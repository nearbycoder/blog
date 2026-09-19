import css from "../styles/desktop-focus.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("focus", css);

const key = "nearby-desktop-focus-v1";
type TimerState = {
  mode: string;
  duration: number;
  remaining: number;
  deadline: number | null;
  completed: number;
};
const fresh = (): TimerState => ({
  mode: "Focus",
  duration: 25 * 60,
  remaining: 25 * 60,
  deadline: null,
  completed: 0,
});
function read(): TimerState {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      data &&
      ["Focus", "Short break", "Long break", "Custom"].includes(data.mode) &&
      Number.isInteger(data.duration) &&
      data.duration >= 60 &&
      data.duration <= 10800 &&
      typeof data.remaining === "number" &&
      Number.isFinite(data.remaining) &&
      data.remaining >= 0 &&
      data.remaining <= data.duration &&
      (data.deadline === null ||
        (Number.isFinite(data.deadline) &&
          data.deadline >= 0 &&
          data.deadline <= Date.now() + 10800000)) &&
      Number.isInteger(data.completed) &&
      data.completed >= 0 &&
      data.completed < 100000
    )
      return data;
  } catch {
    /* A blocked or corrupt store should not prevent using the timer. */
  }
  return fresh();
}

export function mountFocus(root: HTMLElement) {
  root.classList.add("focus-app");
  root.innerHTML = `
    <div class="focus-modes desk-app-toolbar" role="group" aria-label="Timer presets">
      <button type="button" data-focus-mode="Focus" data-minutes="25">Focus</button>
      <button type="button" data-focus-mode="Short break" data-minutes="5">Short break</button>
      <button type="button" data-focus-mode="Long break" data-minutes="15">Long break</button>
    </div>
    <div class="focus-body">
      <p class="focus-eyebrow" data-focus-label>Focus</p>
      <h2>One thing at a time.</h2>
      <div class="focus-dial"><span class="focus-time" role="timer" aria-label="Time remaining" aria-live="off">25:00</span><span class="focus-state">Ready when you are</span></div>
      <div class="focus-actions"><button type="button" data-focus-toggle>Start timer</button><button type="button" data-focus-reset>Reset</button></div>
      <form class="focus-custom"><label>Minutes<input type="number" name="minutes" min="1" max="180" step="1" value="25" required inputmode="numeric"></label><button type="submit">Set timer</button></form>
      <p class="focus-completed"></p>
    </div>
    <p class="desk-app-status" role="status" data-focus-message>Continues while minimized. Closing pauses the timer.</p>
  `;
  let state = read();
  let alive = true;
  const display = root.querySelector<HTMLElement>(".focus-time")!;
  const phase = root.querySelector<HTMLElement>(".focus-state")!;
  const toggle = root.querySelector<HTMLButtonElement>("[data-focus-toggle]")!;
  const status = root.querySelector<HTMLElement>("[data-focus-message]")!;
  const minutes = root.querySelector<HTMLInputElement>(
    'input[name="minutes"]',
  )!;
  const announce = (text: string) => {
    status.textContent = text;
  };
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      announce(
        "Storage is unavailable. This timer will last until you close it.",
      );
    }
  };
  function draw() {
    const seconds = Math.ceil(state.remaining);
    display.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    toggle.textContent = state.deadline
      ? "Pause timer"
      : state.remaining === 0
        ? "Start again"
        : state.remaining < state.duration
          ? "Resume timer"
          : "Start timer";
    root.querySelector<HTMLElement>("[data-focus-label]")!.textContent =
      state.mode;
    root.querySelector<HTMLElement>(".focus-completed")!.textContent =
      `${state.completed} focus ${state.completed === 1 ? "session" : "sessions"} completed`;
    phase.textContent = state.deadline
      ? "Keep going. You’ve got this."
      : state.remaining === 0
        ? "Time’s up. Take a breath."
        : state.remaining < state.duration
          ? "Paused. Take your time."
          : "Ready when you are";
    root
      .querySelectorAll<HTMLButtonElement>("[data-focus-mode]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.focusMode === state.mode),
        ),
      );
    root
      .querySelector<HTMLElement>(".focus-dial")!
      .style.setProperty(
        "--focus-progress",
        `${(1 - state.remaining / state.duration) * 100}%`,
      );
  }
  function tick() {
    if (!alive || state.deadline === null) return;
    state.remaining = Math.max(0, (state.deadline - Date.now()) / 1000);
    if (!state.remaining) {
      state.deadline = null;
      if (state.mode === "Focus" || state.mode === "Custom") state.completed++;
      announce(
        `${state.mode} complete. ${state.mode.endsWith("break") ? "Ready for your next session?" : "Time for a break."}`,
      );
      save();
    }
    draw();
  }
  function setTimer(mode: string, duration: number) {
    state = { ...state, mode, duration, remaining: duration, deadline: null };
    minutes.value = String(duration / 60);
    announce(`${mode} set for ${duration / 60} minutes.`);
    save();
    draw();
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-focus-mode]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        setTimer(
          button.dataset.focusMode!,
          Number(button.dataset.minutes) * 60,
        ),
      ),
    );
  toggle.addEventListener("click", () => {
    const wasRunning = state.deadline !== null;
    tick();
    if (wasRunning) {
      state.deadline = null;
      announce("Timer paused.");
    } else {
      if (!state.remaining) state.remaining = state.duration;
      state.deadline = Date.now() + state.remaining * 1000;
      announce(`${state.mode} started.`);
    }
    save();
    draw();
  });
  root
    .querySelector("[data-focus-reset]")!
    .addEventListener("click", () => setTimer(state.mode, state.duration));
  root.querySelector("form")!.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!minutes.checkValidity()) {
      minutes.reportValidity();
      return;
    }
    const value = Number(minutes.value);
    if (Number.isInteger(value) && value >= 1 && value <= 180)
      setTimer("Custom", value * 60);
  });
  minutes.value = String(state.duration / 60);
  tick();
  draw();
  const timer = window.setInterval(tick, 250);
  document.addEventListener("visibilitychange", tick);
  return () => {
    tick();
    state.deadline = null;
    save();
    alive = false;
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", tick);
  };
}
