import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket } from "ws";
import { createTerminalServer } from "./server.mjs";
const origin = "http://127.0.0.1:4322";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(predicate) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await delay(20);
  }
  throw new Error("Timed out");
}
async function fixture(options = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "nearby-terminal-"));
  const token = randomBytes(32).toString("hex");
  const bridge = createTerminalServer({
    token,
    origins: [origin],
    targets: { shell: { command: "/bin/sh", args: ["-i"], cwd } },
    ...options,
  });
  bridge.server.listen(0, "127.0.0.1");
  await once(bridge.server, "listening");
  const url = `ws://127.0.0.1:${bridge.server.address().port}/terminal`;
  const connect = async (auth = {}) => {
    const socket = new WebSocket(url, { origin });
    const messages = [];
    socket.on("message", (data) => messages.push(JSON.parse(data.toString())));
    await once(socket, "open");
    socket.send(
      JSON.stringify({
        type: "auth",
        version: 1,
        token,
        target: "shell",
        cols: 80,
        rows: 24,
        ...auth,
      }),
    );
    return {
      socket,
      messages,
      text: () =>
        messages
          .filter((m) => m.type === "output")
          .map((m) => m.data)
          .join(""),
    };
  };
  return {
    bridge,
    url,
    token,
    connect,
    close: async () => {
      await bridge.close();
      rmSync(cwd, { recursive: true, force: true });
    },
  };
}
test("Real PTY executes commands, resizes, keeps shells independent, and closes processes", async () => {
  const f = await fixture();
  try {
    const a = await f.connect(),
      b = await f.connect();
    await until(() => f.bridge.sessionCount() === 2);
    a.socket.send(JSON.stringify({ type: "resize", cols: 100, rows: 32 }));
    a.socket.send(
      JSON.stringify({
        type: "input",
        data: "stty size; printf 'REAL_%s\\n' PTY; export PANE_ONLY=one\r",
      }),
    );
    b.socket.send(
      JSON.stringify({
        type: "input",
        data: "printf 'ISOLATED_%s\\n' ${PANE_ONLY:-yes}; printf 'SECRET_%s\\n' ${TERMINAL_TOKEN:-absent}\r",
      }),
    );
    await until(
      () =>
        a.text().includes("32 100") &&
        a.text().includes("REAL_PTY") &&
        b.text().includes("ISOLATED_yes") &&
        b.text().includes("SECRET_absent"),
    );
    a.socket.close();
    await until(() => f.bridge.sessionCount() === 1);
    b.socket.send(JSON.stringify({ type: "input", data: "exit 7\r" }));
    await until(() =>
      b.messages.some((m) => m.type === "exit" && m.code === 7),
    );
    await until(() => f.bridge.sessionCount() === 0);
  } finally {
    await f.close();
  }
});
test("Wrong tokens, unconfigured targets, invalid frames and sizes never launch shells", async () => {
  const f = await fixture();
  try {
    for (const auth of [
      { token: "wrong" },
      { target: "not-configured" },
      { cols: 50000 },
    ]) {
      const client = await f.connect(auth);
      await until(() => client.messages.some((m) => m.type === "error"));
      assert.equal(f.bridge.sessionCount(), 0);
    }
    const client = await f.connect();
    await until(() => f.bridge.sessionCount() === 1);
    client.socket.send('{"type":"input","data":42}');
    await until(() => f.bridge.sessionCount() === 0);
  } finally {
    await f.close();
  }
});
test("Cross-origin upgrades and credential-bearing URLs are rejected", async () => {
  const f = await fixture();
  try {
    for (const [url, suppliedOrigin] of [
      [f.url, "https://untrusted.example"],
      [f.url + "?token=secret", origin],
    ]) {
      const socket = new WebSocket(url, { origin: suppliedOrigin });
      const [error] = await once(socket, "error");
      assert.match(error.message, /403/);
      assert.equal(f.bridge.sessionCount(), 0);
    }
  } finally {
    await f.close();
  }
});
test("Authentication expires and session limits are enforced", async () => {
  const f = await fixture({ authTimeout: 100, maxSessions: 1 });
  try {
    const idle = new WebSocket(f.url, { origin });
    await once(idle, "close");
    assert.equal(f.bridge.sessionCount(), 0);
    const a = await f.connect();
    await until(() => f.bridge.sessionCount() === 1);
    const b = await f.connect();
    await until(() => b.messages.some((m) => m.type === "error"));
    assert.equal(f.bridge.sessionCount(), 1);
    a.socket.close();
  } finally {
    await f.close();
  }
});
