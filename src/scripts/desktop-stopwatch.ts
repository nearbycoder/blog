import css from "../styles/desktop-stopwatch.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("stopwatch", css);

type Lap = { total: number; split: number };
function format(milliseconds: number) {
  const hundredths = Math.floor(milliseconds / 10);
  const hours = Math.floor(hundredths / 360000);
  return `${hours ? `${String(hours).padStart(2, "0")}:` : ""}${String(Math.floor(hundredths / 6000) % 60).padStart(2, "0")}:${String(Math.floor(hundredths / 100) % 60).padStart(2, "0")}.${String(hundredths % 100).padStart(2, "0")}`;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("stopwatch-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const win = root.closest<HTMLElement>("[data-window]")!;
  let accumulated = 0;
  let started: number | null = null;
  let interval: ReturnType<typeof setInterval> | undefined;
  let laps: Lap[] = [];
  let previous: { time: number; laps: Lap[] } | undefined;
  const downloads = new Map<string, ReturnType<typeof setTimeout>>();
  root.innerHTML = `
    <div class="stopwatch-face"><p>EVERY MOMENT COUNTS</p><output role="timer" aria-label="Elapsed time" aria-live="off" data-stopwatch-time>00:00.00</output><span data-stopwatch-state>Ready when you are</span></div>
    <div class="stopwatch-controls"><button type="button" data-stopwatch-toggle>Start</button><button type="button" data-stopwatch-lap disabled>Lap</button><button type="button" data-stopwatch-reset disabled>Reset</button><button type="button" data-stopwatch-undo hidden>Undo reset</button></div>
    <div class="stopwatch-laps"><table><caption>Lap times <span data-stopwatch-count>0 / 200</span></caption><thead><tr><th scope="col">Lap</th><th scope="col">Split</th><th scope="col">Total</th></tr></thead><tbody data-stopwatch-laps></tbody></table><p data-stopwatch-empty>Start the clock, then mark a lap.</p></div>
    <div class="desk-app-toolbar"><button type="button" data-stopwatch-export disabled>Export laps .csv</button></div>
    <p class="desk-app-status" role="status" data-stopwatch-status>Continues while minimized. Closing starts fresh next time.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const toggle = find<HTMLButtonElement>("[data-stopwatch-toggle]");
  const lapButton = find<HTMLButtonElement>("[data-stopwatch-lap]");
  const reset = find<HTMLButtonElement>("[data-stopwatch-reset]");
  const undo = find<HTMLButtonElement>("[data-stopwatch-undo]");
  const status = find<HTMLElement>("[data-stopwatch-status]");
  const timeDisplay = find<HTMLElement>("[data-stopwatch-time]");
  const stateDisplay = find<HTMLElement>("[data-stopwatch-state]");
  const elapsed = () =>
    accumulated + (started === null ? 0 : performance.now() - started);
  function renderTime() {
    timeDisplay.textContent = format(elapsed());
  }
  function sync() {
    clearInterval(interval);
    interval = undefined;
    renderTime();
    if (started !== null && !document.hidden && !win.hidden)
      interval = setInterval(renderTime, 50);
    const hasProgress = accumulated > 0 || laps.length > 0;
    toggle.textContent =
      started !== null ? "Pause" : hasProgress ? "Resume" : "Start";
    toggle.setAttribute("aria-pressed", String(started !== null));
    lapButton.disabled = started === null || laps.length >= 200;
    reset.disabled =
      started !== null || (accumulated === 0 && laps.length === 0);
    undo.hidden = !previous;
    stateDisplay.textContent =
      started !== null
        ? "Running"
        : hasProgress
          ? "Paused"
          : "Ready when you are";
  }
  function drawLaps() {
    const body = find<HTMLElement>("[data-stopwatch-laps]");
    body.replaceChildren();
    laps.forEach((lap, index) => {
      const row = document.createElement("tr");
      for (const value of [
        String(index + 1),
        format(lap.split),
        format(lap.total),
      ]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      }
      body.prepend(row);
    });
    find<HTMLElement>("[data-stopwatch-count]").textContent =
      `${laps.length} / 200`;
    find<HTMLElement>("[data-stopwatch-empty]").hidden = laps.length > 0;
    find<HTMLButtonElement>("[data-stopwatch-export]").disabled =
      laps.length === 0;
  }
  toggle.addEventListener(
    "click",
    () => {
      previous = undefined;
      if (started === null) {
        started = performance.now();
        status.textContent = "Stopwatch running.";
      } else {
        accumulated = elapsed();
        started = null;
        status.textContent = `Paused at ${format(accumulated)}.`;
      }
      sync();
    },
    events,
  );
  lapButton.addEventListener(
    "click",
    () => {
      if (started === null || laps.length >= 200) return;
      const total = elapsed();
      laps.push({ total, split: total - (laps.at(-1)?.total ?? 0) });
      drawLaps();
      sync();
      status.textContent = `Lap ${laps.length}: ${format(laps.at(-1)!.split)}.${laps.length === 200 ? " Lap limit reached. Export your times before resetting." : ""}`;
    },
    events,
  );
  reset.addEventListener(
    "click",
    () => {
      if (started !== null || (accumulated === 0 && laps.length === 0)) return;
      previous = { time: accumulated, laps: [...laps] };
      accumulated = 0;
      laps = [];
      drawLaps();
      sync();
      status.textContent = "Stopwatch reset. Undo restores the previous times.";
    },
    events,
  );
  undo.addEventListener(
    "click",
    () => {
      if (!previous) return;
      accumulated = previous.time;
      laps = previous.laps;
      previous = undefined;
      drawLaps();
      sync();
      status.textContent = "Previous stopwatch restored, paused.";
    },
    events,
  );
  find<HTMLButtonElement>("[data-stopwatch-export]").addEventListener(
    "click",
    () => {
      if (laps.length === 0) return;
      try {
        const csv =
          "Lap,Split seconds,Total seconds\r\n" +
          laps
            .map(
              (lap, i) =>
                `${i + 1},${(lap.split / 1000).toFixed(3)},${(lap.total / 1000).toFixed(3)}`,
            )
            .join("\r\n");
        const url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8" }),
        );
        downloads.set(
          url,
          setTimeout(() => {
            URL.revokeObjectURL(url);
            downloads.delete(url);
          }, 1000),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "stopwatch-laps.csv";
        link.hidden = true;
        root.append(link);
        try {
          link.click();
        } finally {
          link.remove();
        }
        status.textContent = "Lap download started.";
      } catch {
        status.textContent =
          "The download could not start. Your lap times remain here.";
      }
    },
    events,
  );
  const observer = new MutationObserver(sync);
  observer.observe(win, { attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("visibilitychange", sync, events);
  sync();
  return () => {
    controller.abort();
    observer.disconnect();
    clearInterval(interval);
    downloads.forEach((timer, url) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    });
    downloads.clear();
  };
}
