# Ghostty in the desktop

Open **Ghostty** from the `/desktop` shortcut or application search. This uses [Ghostty Web](https://github.com/coder/ghostty-web) 0.4.0, a browser port of Ghostty's terminal engine, with its WebAssembly served by the blog. It is not the native Ghostty application. The distributed licenses are in `public/licenses/ghostty-web.txt` and `public/licenses/ghostty.txt`. The engine and WASM load only when Ghostty opens.

Each tab or split pane owns an independent terminal connection. Up to four tabs and eight panes can be open, with up to four panes in a tab. **Split right** and **Split down** arrange the current tab; narrow screens stack panes. Minimize and switching tabs retain connections. **Disconnect**, closing a pane/window, or reloading ends its connections. **Read output** exposes the last 150 terminal lines as selectable, accessible text. The extra key row includes Escape, Tab, Ctrl+C, arrows, and Enter for touch keyboards. Inputs use at least 16px text on mobile.

## Real connections

The site does not automatically connect to the blog's host or expose an unauthenticated shell. Enter the **Terminal service URL**, **Access token**, and configured **Target** for a bridge you operate. Each pane can connect to a different target. Remote endpoints must use `wss://`; `ws://` is allowed only on loopback. Tokens go in the first WebSocket message, never a URL or browser storage. The UI clears the token after connecting or cancelling.

The companion service in `services/terminal` runs real PTYs using `node-pty`. A target is an operator-defined executable and argument array; it can be a shell inside the container or an SSH client connecting to a remote machine. The browser chooses a configured target ID, never an arbitrary executable. SSH keys and known-hosts files stay on that service, outside the static blog build.

There is **no default production terminal service or personal SSH target configured**. To finish a specific deployment, choose the service host and SSH destination, then configure the origin allowlist, access token, and target file below. The browser UI and bridge can be deployed separately. No bridge process is started by the blog build or by visiting the site.

## Run the bridge

Requirements: Node 22+ on Linux/macOS, and a C++ toolchain plus Python if `node-pty` needs a native build. From the repository root:

```sh
npm ci --prefix services/terminal
```

The service's package file approves only the pinned `node-pty` install script for npm versions that require install-script approval. Service dependencies are separate from the blog's dependencies and browser bundle.

Create a server-only environment file (for example `.env.terminal`, ignored by Git):

```dotenv
TERMINAL_TOKEN=<a-random-secret-of-at-least-32-characters>
TERMINAL_ORIGINS=https://www.nearbycoder.com,https://nearbycoder.com
TERMINAL_TARGETS_FILE=/etc/nearby-terminal/targets.json
TERMINAL_HOST=127.0.0.1
PORT=8787
```

Generate the token using `openssl rand -hex 32`. Keep it private: this is a single-owner administrative terminal, not a public multi-user sandbox. For local browser testing add `http://127.0.0.1:4322` to the comma-separated allowed origins.

An SSH target file looks like this (replace the host, user, key paths, and working directory):

```json
{
  "my-server": {
    "command": "/usr/bin/ssh",
    "args": [
      "-tt",
      "-o", "StrictHostKeyChecking=yes",
      "-o", "UserKnownHostsFile=/run/ssh/known_hosts",
      "-o", "IdentitiesOnly=yes",
      "-o", "ForwardAgent=no",
      "-i", "/run/ssh/id_ed25519",
      "user@server.example.com"
    ],
    "cwd": "/home/node",
    "home": "/home/node"
  }
}
```

Provision the server's verified host key in `known_hosts` before connecting. Enter `my-server` in the browser's Target field. For a shell on the service host, use an absolute shell path and a dedicated working directory; `targets.example.json` is the container shell example. Targets may specify an `env` map. The bridge otherwise passes a minimal environment and does not inherit its access token or other environment secrets into PTYs.

Start with your environment loaded, or with Node's env-file flag:

```sh
node --env-file=.env.terminal services/terminal/server.mjs
```

The default bind address is loopback. Put the bridge behind an HTTPS reverse proxy with WebSocket upgrade support and route `/terminal` to port 8787. Configure its public `wss://.../terminal` URL in Ghostty. `/health` exposes only an `ok` response. Terminate TLS at the proxy and keep port 8787 private.

## Container option

The Docker image runs as the unprivileged `node` user and includes Bash, OpenSSH, and tmux. It defaults to a shell **inside the container**. Build with the service directory as context:

```sh
docker build -t nearby-desktop-terminal services/terminal
```

Create `.env.terminal-container` with only `TERMINAL_TOKEN` and `TERMINAL_ORIGINS`; this preserves the image’s container bind address and target-file defaults. The following exposes only loopback and gives the container a temporary home directory:

```sh
docker run --rm --init --read-only \
  --cap-drop=ALL --security-opt=no-new-privileges \
  --pids-limit=128 --memory=512m --cpus=1 \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --tmpfs /home/node:rw,nosuid,uid=1000,gid=1000,size=128m \
  --env-file .env.terminal-container \
  -p 127.0.0.1:8787:8787 nearby-desktop-terminal
```

For SSH, mount a target file plus the private key and verified `known_hosts` read-only, set `TERMINAL_TARGETS_FILE` to the mounted file, and ensure the container user can read them. Do not mount the Docker socket or the host's home directory. Run `tmux` on the remote host if sessions should survive browser disconnection; reconnect and attach there explicitly. The browser's tabs and split layout are not saved between visits.

## Lifecycle and limits

The bridge validates the exact browser Origin before upgrading, then requires token authentication before spawning anything. It rejects unconfigured targets, malformed frames and oversized messages. It caps live sessions at eight, pending connections at sixteen, and upgrade attempts at thirty per minute per connecting IP. Reverse-proxy clients may share that IP limit. Idle sessions expire after thirty minutes, total session duration is capped at two hours, and ping/pong detects dead connections. Closing a socket kills its PTY. Tokens and terminal contents are not logged by the service.

The native PTY service should run on a persistent host or container. Vercel supports WebSockets, but its [function duration limit](https://vercel.com/docs/functions/websockets) still closes long connections. This bridge is not included in the blog's Vercel functions.

## Verification

```sh
npm run verify
npm --prefix services/terminal test
```

The site tests check lazy loading, protocol validation, tab/split behavior, shortcut ownership, disconnects, failure recovery, close-during-load races, and mobile accessibility. Transport mocks in those UI tests are complemented by actual PTY tests in the service.

With a built site running at `http://127.0.0.1:4322`, run the real browser-to-shell integration:

```sh
npm --prefix services/terminal run test:browser
```

That test creates a temporary working directory and authenticated loopback service, executes real shell commands from Ghostty, verifies a created file, checks independent pane environments, and verifies that closing Ghostty terminates both connections. The implementation was also checked against a temporary SSH server with a pinned host key, including command execution, PTY sizing, and teardown. Production destinations still need their own configuration and connection check.
