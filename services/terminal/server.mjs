import http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import pty from "node-pty";

const digest = (value) => createHash("sha256").update(value).digest();
const dimensions = (cols, rows) =>
  Number.isInteger(cols) &&
  cols >= 2 &&
  cols <= 500 &&
  Number.isInteger(rows) &&
  rows >= 1 &&
  rows <= 300;

/** Authenticated, single-owner PTY bridge. Targets are chosen by the operator, never by browser command strings. */
export function createTerminalServer({
  token,
  origins,
  targets,
  maxSessions = 8,
  authTimeout = 10000,
  idleTimeout = 30 * 60 * 1000,
}) {
  if (typeof token !== "string" || token.length < 32 || token.length > 512)
    throw new Error("TERMINAL_TOKEN must contain 32–512 characters.");
  if (
    !Array.isArray(origins) ||
    !origins.length ||
    origins.some((origin) => {
      try {
        return new URL(origin).origin !== origin || !/^https?:/.test(origin);
      } catch {
        return true;
      }
    })
  )
    throw new Error("Configure explicit allowed HTTP(S) origins.");
  const targetMap = new Map(Object.entries(targets ?? {}));
  if (
    !targetMap.size ||
    [...targetMap].some(
      ([id, target]) =>
        !/^[a-zA-Z0-9_-]{1,48}$/.test(id) ||
        !target ||
        typeof target.command !== "string" ||
        !target.command.startsWith("/") ||
        !Array.isArray(target.args) ||
        target.args.some((arg) => typeof arg !== "string") ||
        typeof target.cwd !== "string" ||
        !target.cwd.startsWith("/"),
    )
  )
    throw new Error(
      "Configure targets with an absolute command, argument array, and absolute working directory.",
    );
  const expected = digest(token);
  const allowed = new Set(origins);
  const sessions = new Map();
  const attempts = new Map();
  const server = http.createServer((request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.writeHead(request.url === "/health" ? 200 : 404, {
      "Content-Type": "text/plain",
    });
    response.end(request.url === "/health" ? "ok\n" : "Not found\n");
  });
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 32768,
    perMessageDeflate: false,
  });
  server.on("upgrade", (request, socket, head) => {
    if (request.url !== "/terminal" || !allowed.has(request.headers.origin)) {
      socket.end(
        "HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
      );
      return;
    }
    const address = request.socket.remoteAddress;
    const now = Date.now();
    for (const [key, entry] of attempts)
      if (entry.until < now) attempts.delete(key);
    const attempt = attempts.get(address) ?? { count: 0, until: now + 60000 };
    attempts.set(address, attempt);
    if (++attempt.count > 30 || wss.clients.size >= 16) {
      socket.end(
        "HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
      );
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) =>
      wss.emit("connection", ws),
    );
  });
  wss.on("connection", (ws) => {
    let process,
      alive = true,
      lastActivity = Date.now(),
      closed = false;
    const send = (message) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
    };
    function cleanup() {
      if (closed) return;
      closed = true;
      clearTimeout(authTimer);
      clearTimeout(lifetime);
      if (process) {
        sessions.delete(ws);
        try {
          process.kill();
        } catch {
          /* Already exited. */
        }
      }
    }
    function fail(message) {
      send({ type: "error", message });
      cleanup();
      ws.close(1008, "Session ended");
    }
    const authTimer = setTimeout(
      () => fail("Authentication timed out."),
      authTimeout,
    );
    const lifetime = setTimeout(
      () => fail("Session time limit reached. Reconnect to continue."),
      2 * 60 * 60 * 1000,
    );
    authTimer.unref();
    lifetime.unref();
    ws.on("pong", () => {
      alive = true;
    });
    ws.on("error", cleanup);
    ws.on("close", cleanup);
    ws.on("message", (raw, binary) => {
      if (closed) return;
      if (binary) {
        fail("Unsupported message.");
        return;
      }
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        fail("Unsupported message.");
        return;
      }
      if (!process) {
        if (
          message?.type !== "auth" ||
          message.version !== 1 ||
          typeof message.token !== "string" ||
          message.token.length > 512 ||
          !timingSafeEqual(digest(message.token), expected)
        ) {
          fail("Authentication failed.");
          return;
        }
        const target = targetMap.get(message.target);
        if (!target) {
          fail("Unknown terminal target.");
          return;
        }
        if (!dimensions(message.cols, message.rows)) {
          fail("Unsupported terminal size.");
          return;
        }
        if (sessions.size >= maxSessions) {
          fail("All terminal sessions are in use.");
          return;
        }
        clearTimeout(authTimer);
        try {
          // Never inherit API keys or the bridge token into connected shells.
          const env = {
            PATH: "/usr/local/bin:/usr/bin:/bin",
            HOME: target.home ?? target.cwd,
            LANG: "C.UTF-8",
            TERM: "xterm-256color",
            COLORTERM: "truecolor",
            ...target.env,
          };
          process = pty.spawn(target.command, target.args, {
            name: "xterm-256color",
            cols: message.cols,
            rows: message.rows,
            cwd: target.cwd,
            env,
          });
        } catch {
          fail("Couldn’t start this terminal target.");
          return;
        }
        sessions.set(ws, process);
        send({ type: "ready", title: message.target });
        process.onData((data) => {
          if (closed) return;
          lastActivity = Date.now();
          if (ws.bufferedAmount > 1024 * 1024) {
            fail("Output exceeded the connection capacity.");
            return;
          }
          for (let start = 0; start < data.length;) {
            let end = Math.min(start + 16384, data.length);
            if (end < data.length && /[\uD800-\uDBFF]/.test(data[end - 1]))
              end--;
            send({ type: "output", data: data.slice(start, end) });
            start = end;
          }
        });
        process.onExit(({ exitCode }) => {
          send({ type: "exit", code: exitCode });
          cleanup();
          ws.close(1000, "Process exited");
        });
      } else if (
        message?.type === "input" &&
        typeof message.data === "string" &&
        message.data.length <= 4096
      ) {
        lastActivity = Date.now();
        process.write(message.data);
      } else if (
        message?.type === "resize" &&
        dimensions(message.cols, message.rows)
      ) {
        process.resize(message.cols, message.rows);
      } else fail("Unsupported message.");
    });
    const heartbeat = setInterval(() => {
      if (!alive || Date.now() - lastActivity > idleTimeout) {
        cleanup();
        ws.terminate();
        return;
      }
      alive = false;
      ws.ping();
    }, 30000);
    heartbeat.unref();
    ws.once("close", () => clearInterval(heartbeat));
  });
  return {
    server,
    sessionCount: () => sessions.size,
    close: () =>
      new Promise((resolve) => {
        for (const ws of wss.clients) ws.terminate();
        wss.close(() => server.close(resolve));
      }),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const bridge = createTerminalServer({
      token: process.env.TERMINAL_TOKEN,
      origins: (process.env.TERMINAL_ORIGINS ?? "").split(",").filter(Boolean),
      targets: JSON.parse(
        readFileSync(process.env.TERMINAL_TARGETS_FILE, "utf8"),
      ),
    });
    const port = Number(process.env.PORT || 8787);
    const host = process.env.TERMINAL_HOST || "127.0.0.1";
    bridge.server.listen(port, host, () =>
      console.log(`Terminal service listening on ${host}:${port}`),
    );
    for (const signal of ["SIGINT", "SIGTERM"])
      process.once(signal, async () => {
        await bridge.close();
        process.exit(0);
      });
  } catch (error) {
    console.error(`Terminal service configuration error: ${error.message}`);
    process.exitCode = 1;
  }
}
