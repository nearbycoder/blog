import { Ghostty, Terminal, FitAddon } from "ghostty-web";
import {
  connectionSettings,
  MAX_PANES,
  MAX_TABS,
  serverMessage,
} from "../lib/terminal/protocol";

let engine: Promise<Ghostty> | undefined;
const getEngine = () =>
  (engine ??= Ghostty.load().catch((error) => {
    engine = undefined;
    throw error;
  }));
type Pane = {
  id: number;
  element: HTMLElement;
  term: Terminal;
  fit: FitAddon;
  label: HTMLElement;
  status: HTMLElement;
  surface: HTMLElement;
  transcript: HTMLElement;
  socket?: WebSocket;
  connected: boolean;
  timer?: ReturnType<typeof setTimeout>;
  transcriptTimer?: ReturnType<typeof setTimeout>;
  dispose: () => void;
};
type Tab = {
  id: number;
  button: HTMLButtonElement;
  element: HTMLElement;
  panes: Pane[];
};

export async function mountGhostty(root: HTMLElement): Promise<() => void> {
  const ghostty = await getEngine();
  if (!root.isConnected) return () => {};
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const content = root.querySelector<HTMLElement>("[data-ghostty-content]")!;
  content.innerHTML = `
    <div class="ghostty-toolbar" role="group" aria-label="Terminal workspace">
      <button type="button" data-mux="tab">New tab</button>
      <button type="button" data-mux="right">Split right</button>
      <button type="button" data-mux="down">Split down</button>
      <button type="button" data-mux="close-tab">Close tab</button>
      <button type="button" data-mux="connect">Connect…</button>
    </div>
    <div class="ghostty-tabs" role="tablist" aria-label="Terminal tabs"></div>
    <form class="ghostty-connection" aria-label="Connect a terminal" hidden>
      <h3>Open a connection</h3>
      <p>Connect this pane to a terminal service you control. Access tokens stay in this window and are never saved. <a href="https://github.com/nearbycoder/blog/blob/main/docs/desktop-terminal.md" target="_blank" rel="noopener noreferrer">Connection setup</a></p>
      <div class="ghostty-fields">
        <label>Terminal service URL<input name="endpoint" type="url" placeholder="wss://terminal.example.com/terminal" required autocomplete="off" spellcheck="false" /></label>
        <label>Access token<input name="token" type="password" required autocomplete="off" maxlength="512" /></label>
        <label>Target<input name="target" value="shell" required maxlength="48" autocapitalize="off" autocomplete="off" spellcheck="false" /></label>
      </div>
      <p class="ghostty-connect-error" role="status"></p>
      <div class="ghostty-connection-actions"><button type="submit">Connect</button><button type="button" data-cancel-connect>Cancel</button></div>
    </form>
    <div class="ghostty-sessions"></div>
    <div class="ghostty-keys" role="group" aria-label="Terminal keys">
      <button type="button" data-send="esc">Esc</button><button type="button" data-send="tab">Tab</button>
      <button type="button" data-send="interrupt">Ctrl C</button><button type="button" data-send="up" aria-label="Arrow up">↑</button>
      <button type="button" data-send="down" aria-label="Arrow down">↓</button><button type="button" data-send="left" aria-label="Arrow left">←</button>
      <button type="button" data-send="right" aria-label="Arrow right">→</button><button type="button" data-send="enter">Enter</button>
    </div>
    <p class="ghostty-status" data-mux-status role="status">Ghostty Web · Closing a pane ends its connection.</p>`;
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    content.querySelector<T>(selector)!;
  const tablist = find(".ghostty-tabs");
  const sessions = find(".ghostty-sessions");
  const form = find<HTMLFormElement>(".ghostty-connection");
  const endpoint = find<HTMLInputElement>('[name="endpoint"]');
  const token = find<HTMLInputElement>('[name="token"]');
  const target = find<HTMLInputElement>('[name="target"]');
  const error = find(".ghostty-connect-error");
  const status = find("[data-mux-status]");
  const tabs: Tab[] = [];
  let activeTab: Tab, activePane: Pane, connectionPane: Pane | undefined;
  let nextId = 0;
  const allPanes = () => tabs.flatMap((tab) => tab.panes);
  function updateControls() {
    find<HTMLButtonElement>('[data-mux="tab"]').disabled =
      tabs.length >= MAX_TABS || allPanes().length >= MAX_PANES;
    for (const direction of ["right", "down"])
      find<HTMLButtonElement>(`[data-mux="${direction}"]`).disabled =
        allPanes().length >= MAX_PANES || activeTab.panes.length >= 4;
    find<HTMLButtonElement>('[data-mux="close-tab"]').disabled =
      tabs.length === 1;
    content
      .querySelectorAll<HTMLButtonElement>("[data-send]")
      .forEach((button) => {
        button.disabled = !activePane.connected;
      });
  }
  function selectPane(pane: Pane, focus = true) {
    activePane = pane;
    allPanes().forEach((item) => {
      item.element.dataset.active = String(item === pane);
    });
    updateControls();
    if (focus && !root.hidden && root.classList.contains("is-active"))
      pane.term.focus();
  }
  function selectTab(tab: Tab, focus = true) {
    activeTab = tab;
    form.hidden = true;
    sessions.inert = false;
    token.value = "";
    connectionPane = undefined;
    tabs.forEach((item) => {
      item.element.hidden = item !== tab;
      item.button.setAttribute("aria-selected", String(item === tab));
      item.button.tabIndex = item === tab ? 0 : -1;
    });
    tab.panes.forEach((pane) => pane.fit.fit());
    selectPane(tab.panes[0], focus);
  }
  function showConnection(pane = activePane) {
    selectPane(pane, false);
    connectionPane = pane;
    error.textContent = "";
    form.hidden = false;
    sessions.inert = true;
    if (!root.hidden && root.classList.contains("is-active")) endpoint.focus();
  }
  function stop(
    pane: Pane,
    message = "Disconnected. Connect to open a new session.",
  ) {
    clearTimeout(pane.timer);
    const socket = pane.socket;
    pane.socket = undefined;
    pane.connected = false;
    pane.term.options.disableStdin = true;
    socket?.close(1000, "Disconnected");
    pane.status.textContent = message;
    if (activePane) updateControls();
  }
  function send(pane: Pane, data: string) {
    if (!pane.connected || pane.socket?.readyState !== WebSocket.OPEN) return;
    if (data.length > 65536) {
      pane.status.textContent =
        "Paste is too large. Use less than 64 KB at a time.";
      return;
    }
    if (pane.socket.bufferedAmount > 131072) {
      stop(pane, "Connection fell behind. Reconnect to continue.");
      return;
    }
    // Limit each input frame, including large clipboard pastes.
    for (let i = 0; i < data.length; i += 4096)
      pane.socket.send(
        JSON.stringify({ type: "input", data: data.slice(i, i + 4096) }),
      );
  }
  function addPane(tab: Tab) {
    if (allPanes().length >= MAX_PANES || tab.panes.length >= 4) return;
    const id = ++nextId;
    const element = document.createElement("section");
    element.className = "ghostty-pane";
    element.setAttribute("aria-label", `Terminal pane ${id}`);
    element.innerHTML = `<div class="ghostty-pane-bar"><strong>Session ${id}</strong><button type="button" data-pane-connect>Connect</button><button type="button" data-pane-disconnect>Disconnect</button><button type="button" data-pane-output aria-pressed="false">Read output</button><button type="button" data-pane-close aria-label="Close terminal pane ${id}">×</button></div><div class="ghostty-surface"></div><pre class="ghostty-transcript" tabindex="0" aria-label="Terminal output ${id}" hidden></pre><p class="ghostty-status" role="status">Not connected</p>`;
    tab.element.append(element);
    const surface = element.querySelector<HTMLElement>(".ghostty-surface")!;
    const term = new Terminal({
      ghostty,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      cursorBlink: false,
      scrollback: 2000,
      disableStdin: true,
      theme: {
        background: "#0a171d",
        foreground: "#d7e9e1",
        cursor: "#90e1bb",
        selectionBackground: "#2e5c55",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    element.inert = true;
    term.open(surface);
    element.inert = false;
    fit.fit();
    fit.observeResize();
    term.textarea?.setAttribute("aria-label", `Terminal input ${id}`);
    term.textarea?.setAttribute("autocomplete", "off");
    term.textarea?.setAttribute("autocapitalize", "off");
    // Keep Ctrl+K for the shell; Ctrl+Esc still opens the desktop launcher.
    term.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key === "Escape") return true;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")
        event.stopPropagation();
      return false;
    });
    const pane: Pane = {
      id,
      element,
      term,
      fit,
      surface,
      label: element.querySelector("strong")!,
      status: element.querySelector("[role=status]")!,
      transcript: element.querySelector("pre")!,
      connected: false,
      dispose: () => {
        clearTimeout(pane.transcriptTimer);
        stop(pane);
        fit.dispose();
        term.dispose();
        element.remove();
      },
    };
    tab.panes.push(pane);
    term.onData((data) => send(pane, data));
    term.onResize(({ cols, rows }) => {
      if (pane.connected && pane.socket?.readyState === WebSocket.OPEN)
        pane.socket.send(JSON.stringify({ type: "resize", cols, rows }));
    });
    element.addEventListener(
      "pointerdown",
      () => selectPane(pane, false),
      events,
    );
    element.addEventListener("focusin", () => selectPane(pane, false), events);
    element
      .querySelector("[data-pane-connect]")!
      .addEventListener("click", () => showConnection(pane), events);
    element
      .querySelector("[data-pane-disconnect]")!
      .addEventListener("click", () => stop(pane), events);
    element.querySelector("[data-pane-close]")!.addEventListener(
      "click",
      () => {
        if (connectionPane === pane) {
          form.hidden = true;
          sessions.inert = false;
          token.value = "";
          connectionPane = undefined;
        }
        tab.panes.splice(tab.panes.indexOf(pane), 1);
        pane.dispose();
        if (!tab.panes.length) addPane(tab);
        selectPane(tab.panes[0]);
      },
      events,
    );
    element.querySelector("[data-pane-output]")!.addEventListener(
      "click",
      (event) => {
        pane.transcript.hidden = !pane.transcript.hidden;
        surface.hidden = !pane.transcript.hidden;
        (event.currentTarget as HTMLElement).setAttribute(
          "aria-pressed",
          String(!pane.transcript.hidden),
        );
        if (pane.transcript.hidden) {
          fit.fit();
          term.focus();
        } else pane.transcript.focus();
      },
      events,
    );
    return pane;
  }
  function addTab() {
    if (tabs.length >= MAX_TABS || allPanes().length >= MAX_PANES) return;
    const id = ++nextId;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `Terminal ${id}`;
    button.id = `ghostty-tab-${id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", `ghostty-session-${id}`);
    const element = document.createElement("div");
    element.className = "ghostty-tab";
    element.id = `ghostty-session-${id}`;
    element.setAttribute("role", "tabpanel");
    element.setAttribute("aria-labelledby", button.id);
    const tab: Tab = { id, button, element, panes: [] };
    tabs.push(tab);
    tablist.append(button);
    sessions.append(element);
    addPane(tab);
    button.addEventListener("click", () => selectTab(tab), events);
    button.addEventListener(
      "keydown",
      (event) => {
        const index = tabs.indexOf(tab);
        const next =
          event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : event.key === "ArrowLeft"
              ? (index + tabs.length - 1) % tabs.length
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? tabs.length - 1
                  : -1;
        if (next >= 0) {
          event.preventDefault();
          selectTab(tabs[next], false);
          tabs[next].button.focus();
        }
      },
      events,
    );
    selectTab(tab, false);
    return tab;
  }
  function renderTranscript(pane: Pane) {
    if (pane.transcriptTimer) return;
    pane.transcriptTimer = setTimeout(() => {
      pane.transcriptTimer = undefined;
      const buffer = pane.term.buffer.active;
      const lines: string[] = [];
      for (let i = Math.max(0, buffer.length - 150); i < buffer.length; i++)
        lines.push(buffer.getLine(i)?.translateToString(true) ?? "");
      pane.transcript.textContent = lines.join("\n").trimEnd();
    }, 100);
  }
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const pane = connectionPane;
      if (!pane || !allPanes().includes(pane)) return;
      let settings;
      try {
        settings = connectionSettings(
          endpoint.value.trim(),
          target.value.trim(),
        );
      } catch (reason) {
        error.textContent = (reason as Error).message;
        return;
      }
      let credential = token.value;
      if (!credential) {
        error.textContent = "Enter the access token for this terminal service.";
        return;
      }
      stop(pane, "Connecting…");
      let socket: WebSocket;
      try {
        socket = new WebSocket(settings.endpoint);
      } catch {
        credential = "";
        error.textContent = "The browser couldn’t open this connection.";
        return;
      }
      pane.socket = socket;
      form.hidden = true;
      sessions.inert = false;
      token.value = "";
      connectionPane = undefined;
      pane.label.textContent = settings.target;
      pane.timer = setTimeout(() => {
        credential = "";
        if (pane.socket === socket)
          stop(
            pane,
            "Connection timed out. Check the service address and reconnect.",
          );
      }, 15000);
      socket.addEventListener("open", () => {
        if (pane.socket !== socket) {
          credential = "";
          socket.close();
          return;
        }
        socket.send(
          JSON.stringify({
            type: "auth",
            version: 1,
            token: credential,
            target: settings.target,
            cols: pane.term.cols,
            rows: pane.term.rows,
          }),
        );
        credential = "";
      });
      socket.addEventListener("message", (event) => {
        if (pane.socket !== socket) return;
        const message = serverMessage(event.data);
        if (!message) {
          stop(
            pane,
            "The service sent an unsupported response. Connection closed.",
          );
          return;
        }
        if (message.type === "ready" && !pane.connected) {
          clearTimeout(pane.timer);
          pane.connected = true;
          pane.term.options.disableStdin = false;
          pane.label.textContent = message.title;
          pane.status.textContent = "Connected";
          pane.fit.fit();
          updateControls();
          if (
            pane === activePane &&
            !root.hidden &&
            root.classList.contains("is-active")
          )
            pane.term.focus();
        } else if (message.type === "output" && pane.connected) {
          pane.term.write(message.data, () => {
            if (!controller.signal.aborted && allPanes().includes(pane))
              renderTranscript(pane);
          });
        } else if (message.type === "error") stop(pane, message.message);
        else if (message.type === "exit")
          stop(
            pane,
            `Session ended (exit ${message.code}). Connect to open another.`,
          );
      });
      socket.addEventListener("close", () => {
        credential = "";
        if (pane.socket === socket)
          stop(pane, "Connection closed. Connect to open a new session.");
      });
      socket.addEventListener("error", () => {
        credential = "";
        if (pane.socket === socket)
          stop(
            pane,
            "Couldn’t connect. Check the service URL, access token, and target.",
          );
      });
    },
    events,
  );
  find("[data-cancel-connect]").addEventListener(
    "click",
    () => {
      form.hidden = true;
      sessions.inert = false;
      token.value = "";
      connectionPane = undefined;
      activePane.term.focus();
    },
    events,
  );
  content.querySelectorAll<HTMLButtonElement>("[data-mux]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        const action = button.dataset.mux;
        if (action === "tab") {
          if (addTab()) showConnection();
        } else if (action === "connect") showConnection();
        else if (action === "close-tab" && tabs.length > 1) {
          const tab = activeTab;
          tabs.splice(tabs.indexOf(tab), 1);
          tab.panes.forEach((pane) => pane.dispose());
          tab.element.remove();
          tab.button.remove();
          selectTab(tabs.at(-1)!);
        } else if (action === "right" || action === "down") {
          const pane = addPane(activeTab);
          if (pane) {
            activeTab.element.dataset.axis = action;
            activeTab.panes.forEach((item) => item.fit.fit());
            showConnection(pane);
          }
        }
      },
      events,
    ),
  );
  const keys: Record<string, string> = {
    esc: "\x1b",
    tab: "\t",
    interrupt: "\x03",
    up: "\x1b[A",
    down: "\x1b[B",
    left: "\x1b[D",
    right: "\x1b[C",
    enter: "\r",
  };
  content.querySelectorAll<HTMLButtonElement>("[data-send]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        send(activePane, keys[button.dataset.send!]);
        activePane.term.focus();
      },
      events,
    ),
  );
  const observer = new MutationObserver(() => {
    if (!root.hidden && root.classList.contains("is-active"))
      activeTab.panes.forEach((pane) => pane.fit.fit());
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["hidden", "class"],
  });
  addTab();
  status.textContent = "Ghostty Web · Closing a pane ends its connection.";
  showConnection();
  return () => {
    controller.abort();
    observer.disconnect();
    token.value = "";
    allPanes().forEach((pane) => pane.dispose());
    tabs.length = 0;
  };
}
