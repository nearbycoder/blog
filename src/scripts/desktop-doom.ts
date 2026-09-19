import playerHtml from "../components/desktop/doom-player.html?raw";

export function mountDoom(root: HTMLElement, events: { signal: AbortSignal }) {
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const panel = find('[data-arcade-panel="doom"]');
  const host = find("[data-doom-host]");
  const status = find("[data-doom-status]");
  const play = find<HTMLButtonElement>("[data-doom-play]");
  const pause = find<HTMLButtonElement>("[data-doom-pause]");
  const sound = find<HTMLButtonElement>("[data-doom-sound]");
  const stop = find<HTMLButtonElement>("[data-doom-stop]");
  let frame: HTMLIFrameElement | undefined;
  let ready = false,
    paused = false,
    muted = true;
  const held = new Map<number, number>();
  const send = (action: string, extra = {}) =>
    frame?.contentWindow?.postMessage(
      { type: "nearby-doom-control", action, ...extra },
      location.origin,
    );
  const available = () =>
    !document.hidden &&
    !root.hidden &&
    !panel.hidden &&
    root.classList.contains("is-active");
  function releaseKeys() {
    held.forEach((code) => send("key", { code, pressed: false }));
    held.clear();
  }
  function setPaused(value: boolean) {
    releaseKeys();
    paused = value;
    send(value ? "pause" : "resume");
    pause.textContent = value ? "Resume" : "Pause";
    pause.setAttribute("aria-pressed", String(value));
    host.dataset.paused = String(value);
    if (ready)
      status.textContent = value
        ? "Paused. Press Resume to keep playing."
        : "DOOM is running. Click the game to use your keyboard.";
  }
  function end() {
    releaseKeys();
    frame?.remove();
    frame = undefined;
    ready = false;
    paused = false;
    muted = true;
    host.hidden = true;
    host.replaceChildren();
    delete host.dataset.paused;
    play.hidden = false;
    play.textContent = "Play DOOM";
    pause.hidden = true;
    sound.hidden = true;
    stop.hidden = true;
    sound.textContent = "Sound on";
    sound.setAttribute("aria-pressed", "false");
    find("[data-doom-controls]").hidden = true;
    status.textContent = "Shareware Episode One · Loads only when you play.";
  }
  function start() {
    end();
    frame = document.createElement("iframe");
    frame.title = "DOOM shareware game";
    frame.srcdoc = playerHtml;
    frame.allow = "autoplay; fullscreen";
    host.append(frame);
    host.hidden = false;
    play.hidden = true;
    stop.hidden = false;
    status.textContent =
      "Loading DOOM… The first launch downloads the emulator and game.";
  }
  play.addEventListener("click", start, events);
  stop.addEventListener(
    "click",
    () => {
      end();
      play.focus();
    },
    events,
  );
  pause.addEventListener(
    "click",
    () => {
      setPaused(!paused);
      if (!paused) send("focus");
    },
    events,
  );
  sound.addEventListener(
    "click",
    () => {
      muted = !muted;
      send("mute", { value: muted });
      sound.textContent = muted ? "Sound on" : "Mute";
      sound.setAttribute("aria-pressed", String(!muted));
    },
    events,
  );
  window.addEventListener(
    "message",
    (event) => {
      if (
        !frame ||
        event.source !== frame.contentWindow ||
        event.origin !== location.origin ||
        event.data?.type !== "nearby-doom"
      )
        return;
      if (event.data.state === "ready") {
        ready = true;
        pause.hidden = false;
        sound.hidden = false;
        find("[data-doom-controls]").hidden = false;
        setPaused(!available() || paused);
        if (!paused) send("focus");
      } else if (
        event.data.state === "error" ||
        event.data.state === "exited"
      ) {
        const error = event.data.state === "error";
        end();
        status.textContent = error
          ? "Could not load DOOM. Check your connection, then try again."
          : "Game closed. Play again whenever you like.";
        play.textContent = error ? "Retry DOOM" : "Play DOOM";
      } else if (event.data.state === "focus") {
        root.dispatchEvent(new Event("desktop-game-focus"));
      } else if (event.data.state === "shortcut") {
        root.dispatchEvent(
          new CustomEvent("desktop-game-shortcut", {
            detail: event.data.message,
          }),
        );
      }
    },
    events,
  );
  const observer = new MutationObserver(() => {
    if (frame && !available()) setPaused(true);
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["hidden", "class"],
  });
  observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (frame && document.hidden) setPaused(true);
    },
    events,
  );
  window.addEventListener(
    "blur",
    () => {
      if (frame && !document.hasFocus()) setPaused(true);
    },
    events,
  );
  root
    .querySelectorAll<HTMLButtonElement>("[data-doom-key]")
    .forEach((button) => {
      const code = Number(button.dataset.doomKey);
      button.addEventListener(
        "pointerdown",
        (event) => {
          if (!ready || paused || event.button !== 0) return;
          event.preventDefault();
          button.setPointerCapture(event.pointerId);
          held.set(event.pointerId, code);
          send("key", { code, pressed: true });
        },
        events,
      );
      const release = (event: PointerEvent) => {
        const key = held.get(event.pointerId);
        if (key !== undefined) {
          send("key", { code: key, pressed: false });
          held.delete(event.pointerId);
        }
      };
      button.addEventListener("pointerup", release, events);
      button.addEventListener("pointercancel", release, events);
      button.addEventListener("lostpointercapture", release, events);
      button.addEventListener(
        "click",
        (event) => {
          if (event.detail !== 0 || !ready || paused) return;
          send("key", { code, pressed: true });
          send("key", { code, pressed: false });
        },
        events,
      );
    });
  return () => {
    observer.disconnect();
    end();
  };
}
