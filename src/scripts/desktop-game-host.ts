import "../styles/desktop-classics.css";

export type CanvasGame = {
  reset: () => void;
  step: (seconds: number, held: ReadonlySet<string>) => void;
  draw: (context: CanvasRenderingContext2D) => void;
  key: (key: string) => void;
  score: () => string;
  finished: () => string | undefined;
};

/** One animation loop, owned by the visible, active Arcade window. */
export function mountCanvasGame(
  root: HTMLElement,
  events: { signal: AbortSignal },
  id: string,
  title: string,
  instructions: string,
  controls: readonly (readonly [string, string])[],
  game: CanvasGame,
) {
  const panel = root.querySelector<HTMLElement>(`[data-arcade-panel="${id}"]`)!;
  // All markup and labels here are local constants, never user content.
  panel.innerHTML = `
    <div class="game-heading"><h3>${title}</h3><button type="button" class="arcade-button" data-game-reset>New game</button></div>
    <p class="game-instructions">${instructions} Space pauses. Games pause when you leave them.</p>
    <div class="classic-screen" data-state="ready">
      <canvas width="480" height="360" tabindex="0" role="img" aria-label="${title} game board. ${instructions}" aria-describedby="${id}-score"></canvas>
      <span class="classic-overlay" aria-hidden="true">READY?</span>
    </div>
    <div class="classic-toolbar">
      <button type="button" class="arcade-button" data-game-toggle>Start ${title}</button>
      <div class="classic-controls" role="group" aria-label="${title} controls">
        ${controls.map(([key, label]) => `<button type="button" class="arcade-button" data-game-key="${key}" aria-label="${({ ArrowUp: "Move up", ArrowDown: "Move down", ArrowLeft: "Move left", ArrowRight: "Move right" } as Record<string, string>)[key]}">${label}</button>`).join("")}
      </div>
    </div>
    <p class="game-status" id="${id}-score" data-game-status role="status"></p>`;
  const canvas = panel.querySelector<HTMLCanvasElement>("canvas")!;
  const context = canvas.getContext("2d")!;
  const screen = panel.querySelector<HTMLElement>(".classic-screen")!;
  const overlay = panel.querySelector<HTMLElement>(".classic-overlay")!;
  const toggle = panel.querySelector<HTMLButtonElement>("[data-game-toggle]")!;
  const status = panel.querySelector<HTMLElement>("[data-game-status]")!;
  const held = new Set<string>();
  const pointers = new Map<number, string>();
  let running = false,
    started = false,
    frame = 0,
    previous = 0;
  const available = () =>
    !document.hidden &&
    !root.hidden &&
    !panel.hidden &&
    root.classList.contains("is-active");
  function render() {
    game.draw(context);
    const result = game.finished();
    screen.dataset.state = result
      ? "finished"
      : running
        ? "running"
        : started
          ? "paused"
          : "ready";
    overlay.textContent = result ?? (started ? "PAUSED" : "READY?");
    toggle.textContent = result
      ? "Play again"
      : running
        ? "Pause"
        : started
          ? "Resume"
          : `Start ${title}`;
    toggle.setAttribute("aria-pressed", String(running));
    const message = `${game.score()} · ${result ?? (running ? "Playing" : started ? "Paused" : "Ready when you are")}`;
    if (status.textContent !== message) status.textContent = message;
  }
  function pause() {
    cancelAnimationFrame(frame);
    running = false;
    held.clear();
    pointers.clear();
    render();
  }
  function tick(time: number) {
    if (!running) return;
    if (!available()) {
      pause();
      return;
    }
    // Clamp elapsed time so a delayed frame cannot teleport a ball or snake.
    game.step(Math.min((time - previous) / 1000, 0.035), held);
    previous = time;
    if (game.finished()) {
      pause();
      return;
    }
    render();
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (!available()) return;
    if (game.finished()) game.reset();
    running = started = true;
    previous = performance.now();
    render();
    canvas.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener("click", () => (running ? pause() : start()), events);
  panel.querySelector("[data-game-reset]")!.addEventListener(
    "click",
    () => {
      pause();
      game.reset();
      started = false;
      render();
    },
    events,
  );
  canvas.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) running ? pause() : start();
      } else if (controls.some(([key]) => key === event.key)) {
        event.preventDefault();
        if (running) {
          held.add(event.key);
          game.key(event.key);
        }
      }
    },
    events,
  );
  canvas.addEventListener("keyup", (event) => held.delete(event.key), events);
  canvas.addEventListener("blur", () => held.clear(), events);
  panel
    .querySelectorAll<HTMLButtonElement>("[data-game-key]")
    .forEach((button) => {
      const key = button.dataset.gameKey!;
      button.addEventListener(
        "pointerdown",
        (event) => {
          if (!running) return;
          button.setPointerCapture(event.pointerId);
          pointers.set(event.pointerId, key);
          held.add(key);
          game.key(key);
        },
        events,
      );
      const release = (event: PointerEvent) => {
        pointers.delete(event.pointerId);
        if (![...pointers.values()].includes(key)) held.delete(key);
      };
      for (const name of [
        "pointerup",
        "pointercancel",
        "lostpointercapture",
      ] as const)
        button.addEventListener(name, release, events);
      button.addEventListener(
        "click",
        (event) => {
          if (event.detail === 0 && running) game.key(key);
        },
        events,
      );
    });
  const observer = new MutationObserver(() => {
    if (running && !available()) pause();
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["hidden", "class"],
  });
  observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden && running) pause();
    },
    events,
  );
  window.addEventListener(
    "blur",
    () => {
      if (running) pause();
    },
    events,
  );
  render();
  return () => {
    cancelAnimationFrame(frame);
    running = false;
    held.clear();
    observer.disconnect();
  };
}
