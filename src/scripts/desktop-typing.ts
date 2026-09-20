import css from "../styles/desktop-typing.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("typing", css);

const STORAGE_KEY = "nearby-desktop-typing-v1";
const PASSAGES = [
  {
    id: "morning",
    name: "Morning light",
    text: "Morning light slips across the desk. A warm cup waits beside a blank page. Take a breath, find your rhythm, and let the next small idea begin.",
  },
  {
    id: "garden",
    name: "Pocket garden",
    text: "We planted a tiny garden in old blue pots. Each day brought a green surprise: a new leaf, a brave stem, or a bee stopping by on its way home.",
  },
  {
    id: "train",
    name: "Window seat",
    text: "The train follows the river past quiet towns. Beyond the window, fields turn gold and clouds cast slow shadows. There is still time to enjoy the view.",
  },
];
type Score = { wpm: number; accuracy: number; seconds: number };
type State = "ready" | "armed" | "running" | "paused" | "complete";
type SelectionSnapshot = { start: number; end: number; old: string };

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("typing-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const windowElement = root.closest<HTMLElement>("[data-window]");
  let passage = PASSAGES[0];
  let state: State = "ready";
  let value = "";
  let attempts = 0;
  let mistakes = 0;
  let accumulated = 0;
  let started: number | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let bests: Record<string, Score> = {};
  let canSave = true;
  let storageMessage = "";
  let editSelection: SelectionSnapshot | null = null;
  let compositionSelection: SelectionSnapshot | null = null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 4096) throw new Error("Oversized scores");
      const saved: unknown = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || Array.isArray(saved))
        throw new Error("Invalid scores");
      const data = saved as { version?: unknown; bests?: unknown };
      if (
        data.version !== 1 ||
        !data.bests ||
        typeof data.bests !== "object" ||
        Array.isArray(data.bests)
      )
        throw new Error("Invalid scores");
      const entries = Object.entries(data.bests);
      if (entries.length > PASSAGES.length) throw new Error("Invalid scores");
      for (const [id, item] of entries) {
        const score = item as Partial<Score> | null;
        if (
          !PASSAGES.some((entry) => entry.id === id) ||
          !score ||
          typeof score !== "object" ||
          typeof score.wpm !== "number" ||
          !Number.isFinite(score.wpm) ||
          score.wpm < 0 ||
          score.wpm > 100000 ||
          typeof score.accuracy !== "number" ||
          !Number.isFinite(score.accuracy) ||
          score.accuracy < 0 ||
          score.accuracy > 100 ||
          typeof score.seconds !== "number" ||
          !Number.isFinite(score.seconds) ||
          score.seconds < 0 ||
          score.seconds > 31536000
        )
          throw new Error("Invalid score");
        bests[id] = {
          wpm: score.wpm,
          accuracy: score.accuracy,
          seconds: score.seconds,
        };
      }
    }
  } catch {
    bests = {};
    canSave = false;
    storageMessage =
      "Saved scores could not be read. They will be left untouched; new bests last for this session.";
  }

  root.innerHTML = `
    <div class="desk-app-toolbar typing-toolbar">
      <label>Passage <select data-typing-passage></select></label>
      <div class="typing-actions"><button type="button" data-typing-start>Start sprint</button><button type="button" data-typing-reset disabled>Reset</button></div>
    </div>
    <div class="typing-body">
      <div class="typing-heading"><div><p class="typing-eyebrow">A little practice, at your pace</p><h2 data-typing-heading></h2></div><span class="typing-state" data-typing-state>Ready</span></div>
      <div class="typing-stats" aria-label="Sprint statistics">
        <div><output data-typing-wpm aria-label="Words per minute">0</output><span>WPM</span></div>
        <div><output data-typing-accuracy aria-label="Accuracy">100%</output><span>Accuracy</span></div>
        <div><output data-typing-time aria-label="Active time" aria-live="off">0.0s</output><span>Active time</span></div>
        <div><output data-typing-best aria-label="Local best">—</output><span>Best WPM · this passage</span></div>
      </div>
      <p class="typing-passage" data-typing-target aria-label="Passage to type"></p>
      <div class="typing-progress-row"><label for="typing-progress">Correct characters</label><span data-typing-count></span></div>
      <progress id="typing-progress" data-typing-progress value="0"></progress>
      <label class="typing-input-label" for="typing-input">Type the passage here</label>
      <textarea id="typing-input" data-typing-input rows="3" readonly spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-describedby="typing-help" placeholder="Choose Start sprint when you are ready."></textarea>
      <div class="typing-confirm" data-typing-confirm hidden role="group" aria-label="Reset this sprint">
        <span>Discard this unfinished sprint?</span><button type="button" data-typing-discard>Reset sprint</button><button type="button" data-typing-keep>Keep sprint</button>
      </div>
      <div class="typing-result" data-typing-result hidden><strong>Sprint complete</strong><p data-typing-summary></p><span>Try again, or choose another passage.</span></div>
      <p class="typing-help" id="typing-help">The clock starts with your first character. WPM uses correct characters ÷ 5 per active minute, with a one-second minimum sample. Accuracy counts every character entered, including corrected mistakes. Match the full passage to finish. Paste is disabled.</p>
      <p class="typing-storage" data-typing-storage role="status" hidden></p>
    </div>
    <p class="desk-app-status typing-status" data-typing-status role="status">Ready when you are. Three original short passages to practice.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const selector = find<HTMLSelectElement>("[data-typing-passage]");
  const input = find<HTMLTextAreaElement>("[data-typing-input]");
  const start = find<HTMLButtonElement>("[data-typing-start]");
  const resetButton = find<HTMLButtonElement>("[data-typing-reset]");
  const status = find<HTMLElement>("[data-typing-status]");
  const target = find<HTMLElement>("[data-typing-target]");
  const confirmation = find<HTMLElement>("[data-typing-confirm]");
  const progress = find<HTMLProgressElement>("[data-typing-progress]");
  const storage = find<HTMLElement>("[data-typing-storage]");
  for (const entry of PASSAGES) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    selector.append(option);
  }
  storage.textContent = storageMessage;
  storage.hidden = !storageMessage;

  const elapsed = () =>
    accumulated + (started === null ? 0 : performance.now() - started);
  const correctCount = () =>
    value
      .split("")
      .reduce(
        (sum, character, index) =>
          sum + Number(character === passage.text[index]),
        0,
      );
  const accuracy = () =>
    attempts ? Math.round(((attempts - mistakes) / attempts) * 1000) / 10 : 100;
  const speed = () =>
    elapsed() > 0
      ? Math.round(
          (correctCount() / 5 / (Math.max(1000, elapsed()) / 60000)) * 10,
        ) / 10
      : 0;
  function renderMetrics() {
    find<HTMLElement>("[data-typing-wpm]").textContent = speed()
      .toFixed(1)
      .replace(/\.0$/, "");
    find<HTMLElement>("[data-typing-accuracy]").textContent = `${accuracy()}%`;
    find<HTMLElement>("[data-typing-time]").textContent =
      `${(elapsed() / 1000).toFixed(1)}s`;
  }
  function renderPassage() {
    target.replaceChildren();
    [...passage.text].forEach((character, index) => {
      const span = document.createElement("span");
      span.textContent = character;
      if (index < value.length)
        span.className =
          value[index] === character ? "typing-correct" : "typing-incorrect";
      else if (index === value.length && state !== "ready")
        span.className = "typing-current";
      target.append(span);
    });
    const correct = correctCount();
    progress.max = passage.text.length;
    progress.value = correct;
    const remainingErrors = value.length - correct;
    find<HTMLElement>("[data-typing-count]").textContent =
      `${correct} / ${passage.text.length}${remainingErrors ? ` · ${remainingErrors} to correct` : ""}`;
  }
  function renderControls() {
    start.textContent =
      state === "running" || state === "armed"
        ? "Pause"
        : state === "paused"
          ? "Resume"
          : state === "complete"
            ? "Try again"
            : "Start sprint";
    selector.disabled = state !== "ready" && state !== "complete";
    resetButton.disabled = state === "ready";
    input.readOnly = state !== "running" && state !== "armed";
    input.placeholder =
      state === "ready"
        ? "Choose Start sprint when you are ready."
        : state === "paused"
          ? "Choose Resume to continue."
          : "Follow the passage above…";
    find<HTMLElement>("[data-typing-state]").textContent = {
      ready: "Ready",
      armed: "Ready to type",
      running: "Typing",
      paused: "Paused",
      complete: "Complete",
    }[state];
    find<HTMLElement>("[data-typing-heading]").textContent = passage.name;
    const best = bests[passage.id];
    find<HTMLElement>("[data-typing-best]").textContent = best
      ? String(best.wpm)
      : "—";
    find<HTMLElement>("[data-typing-best]").title = best
      ? `${best.accuracy}% accuracy · ${best.seconds.toFixed(1)} seconds`
      : "Complete this passage to set a local best.";
  }
  function stopClock() {
    accumulated = elapsed();
    started = null;
    clearInterval(timer);
    timer = undefined;
  }
  function startClock() {
    started = performance.now();
    clearInterval(timer);
    timer = setInterval(renderMetrics, 100);
  }
  function pause(message: string) {
    if (state !== "running" && state !== "armed") return;
    stopClock();
    compositionSelection = null;
    editSelection = null;
    input.value = value;
    state = "paused";
    renderControls();
    renderMetrics();
    status.textContent = message;
  }
  function reset() {
    stopClock();
    state = "ready";
    accumulated = 0;
    value = "";
    attempts = 0;
    mistakes = 0;
    editSelection = null;
    compositionSelection = null;
    input.value = "";
    input.maxLength = passage.text.length + 40;
    confirmation.hidden = true;
    find<HTMLElement>("[data-typing-result]").hidden = true;
    renderControls();
    renderMetrics();
    renderPassage();
  }
  function complete() {
    stopClock();
    state = "complete";
    const score = {
      wpm: speed(),
      accuracy: accuracy(),
      seconds: accumulated / 1000,
    };
    const best = bests[passage.id];
    const isBest =
      !best ||
      score.wpm > best.wpm ||
      (score.wpm === best.wpm && score.accuracy > best.accuracy);
    if (isBest) {
      bests[passage.id] = score;
      if (canSave) {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ version: 1, bests }),
          );
        } catch {
          canSave = false;
          storage.textContent =
            "Your best could not be saved to this browser. It will last for this session.";
          storage.hidden = false;
        }
      }
    }
    const summary = `${score.wpm} WPM · ${score.accuracy}% accuracy · ${score.seconds.toFixed(1)} seconds.${isBest ? " New " + (canSave ? "local" : "session") + " best!" : ""}`;
    find<HTMLElement>("[data-typing-summary]").textContent = summary;
    find<HTMLElement>("[data-typing-result]").hidden = false;
    status.textContent = `Sprint complete. ${summary}`;
    renderControls();
    renderMetrics();
  }

  start.addEventListener(
    "click",
    () => {
      confirmation.hidden = true;
      if (state === "running" || state === "armed") {
        pause("Sprint paused. Resume when you are ready.");
        return;
      }
      if (state === "complete") reset();
      state = value.length || attempts ? "running" : "armed";
      if (state === "running") startClock();
      renderControls();
      renderPassage();
      status.textContent =
        state === "armed"
          ? "Ready. Your first character starts the clock."
          : "Sprint resumed. Keep following the passage.";
      input.focus();
    },
    events,
  );
  resetButton.addEventListener(
    "click",
    () => {
      if (state !== "complete" && attempts > 0) {
        pause("Sprint paused while you decide whether to reset.");
        confirmation.hidden = false;
        find<HTMLButtonElement>("[data-typing-keep]").focus();
      } else {
        reset();
        status.textContent = "Sprint reset. Choose Start sprint to try again.";
      }
    },
    events,
  );
  find<HTMLButtonElement>("[data-typing-discard]").addEventListener(
    "click",
    () => {
      reset();
      status.textContent = "Sprint reset. Your local best is kept.";
      start.focus();
    },
    events,
  );
  find<HTMLButtonElement>("[data-typing-keep]").addEventListener(
    "click",
    () => {
      confirmation.hidden = true;
      status.textContent =
        "Your sprint is kept, paused. Choose Resume to continue.";
      start.focus();
    },
    events,
  );
  selector.addEventListener(
    "change",
    () => {
      passage =
        PASSAGES.find((entry) => entry.id === selector.value) ?? PASSAGES[0];
      reset();
      status.textContent =
        "Passage changed. Choose Start sprint when you are ready.";
    },
    events,
  );
  const rejectPaste = (event: Event) => {
    event.preventDefault();
    status.textContent =
      "Type the passage yourself; pasting and dropping text are disabled.";
  };
  input.addEventListener("paste", rejectPaste, events);
  input.addEventListener("drop", rejectPaste, events);
  input.addEventListener(
    "beforeinput",
    (event) => {
      const edit = event as InputEvent;
      if (
        edit.inputType === "insertFromPaste" ||
        edit.inputType === "insertFromDrop"
      ) {
        rejectPaste(event);
        return;
      }
      // IMEs replace their provisional text repeatedly. Keep the selection
      // from compositionstart so only the committed replacement is scored.
      if (compositionSelection) return;
      editSelection = {
        start: input.selectionStart,
        end: input.selectionEnd,
        old: value,
      };
    },
    events,
  );
  function acceptInput(event?: InputEvent) {
    if (state !== "armed" && state !== "running") {
      input.value = value;
      return;
    }
    if (state === "armed" && input.value.length) {
      state = "running";
      startClock();
      renderControls();
      status.textContent =
        "Keep going. Correct any underlined characters before finishing.";
    }
    if (compositionSelection || event?.isComposing) return;
    const next = input.value;
    let from = 0;
    let oldEnd = value.length;
    let nextEnd = next.length;
    // A beforeinput selection identifies replacements, even when the new text
    // equals the old text. The diff fallback covers undo and browser autofill.
    if (
      editSelection &&
      editSelection.old === value &&
      next.startsWith(value.slice(0, editSelection.start)) &&
      next.endsWith(value.slice(editSelection.end)) &&
      next.length >= editSelection.start + value.length - editSelection.end
    ) {
      from = editSelection.start;
      oldEnd = editSelection.end;
      nextEnd = next.length - (value.length - oldEnd);
    } else {
      while (from < oldEnd && from < nextEnd && value[from] === next[from])
        from++;
      while (
        oldEnd > from &&
        nextEnd > from &&
        value[oldEnd - 1] === next[nextEnd - 1]
      ) {
        oldEnd--;
        nextEnd--;
      }
    }
    for (let index = from; index < nextEnd; index++) {
      attempts++;
      if (next[index] !== passage.text[index]) mistakes++;
    }
    editSelection = null;
    value = next;
    renderMetrics();
    renderPassage();
    if (value === passage.text) complete();
  }
  input.addEventListener(
    "input",
    (event) => acceptInput(event as InputEvent),
    events,
  );
  input.addEventListener(
    "compositionstart",
    () => {
      if (state !== "armed" && state !== "running") return;
      editSelection = null;
      compositionSelection = {
        start: input.selectionStart,
        end: input.selectionEnd,
        old: value,
      };
    },
    events,
  );
  input.addEventListener(
    "compositionend",
    () => {
      if (!compositionSelection) return;
      editSelection = compositionSelection;
      compositionSelection = null;
      acceptInput();
    },
    events,
  );
  const onHidden = () => {
    if (document.hidden || root.hidden || windowElement?.hidden)
      pause("Sprint paused while hidden. Choose Resume when you return.");
  };
  const observer = new MutationObserver(onHidden);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (windowElement)
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  document.addEventListener("visibilitychange", onHidden, events);
  reset();
  return () => {
    stopClock();
    observer.disconnect();
    controller.abort();
  };
}
