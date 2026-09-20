import css from "../styles/desktop-decision.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("decision", css);

const STORAGE_KEY = "nearby-desktop-decision-v1";
const DEFAULT_CHOICES = [
  "Read a chapter",
  "Take a walk",
  "Make something",
  "Call a friend",
];
const MAX_CHOICES = 20;
const MAX_LENGTH = 80;
type ClearSnapshot = { draft: string; choices: string[] };
type Pending = { label: string; index: number; angle: number };

// Reject the incomplete tail of uint32 values before taking a remainder.
function randomChoice(count: number): number {
  const limit = Math.floor(0x100000000 / count) * count;
  const value = new Uint32Array(1);
  do crypto.getRandomValues(value);
  while (value[0] >= limit);
  return value[0] % count;
}

function validSavedChoices(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    (value.length === 0 ||
      (value.length >= 2 && value.length <= MAX_CHOICES)) &&
    value.every(
      (choice) =>
        typeof choice === "string" &&
        choice.trim() === choice &&
        choice.length > 0 &&
        choice.length <= MAX_LENGTH &&
        !/[\r\n]/.test(choice),
    )
  );
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("decision-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const windowElement = root.closest<HTMLElement>("[data-window]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let choices = [...DEFAULT_CHOICES];
  let storageBlocked = false;
  let storageMessage = "";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 12000) throw new Error("Saved choices too large");
      const saved: unknown = JSON.parse(raw);
      if (
        !saved ||
        typeof saved !== "object" ||
        !("version" in saved) ||
        saved.version !== 1 ||
        !("choices" in saved) ||
        !validSavedChoices(saved.choices)
      ) {
        throw new Error("Invalid saved choices");
      }
      choices = saved.choices;
    }
  } catch {
    storageBlocked = true;
    storageMessage =
      "Saved choices could not be read. Any original data is untouched. Changes work for this session only.";
  }

  root.innerHTML = `
    <div class="desk-app-toolbar decision-toolbar"><strong>Let chance choose</strong><span data-decision-count></span></div>
    <div class="decision-body">
      <section class="decision-editor" aria-label="Edit wheel choices">
        <form novalidate>
          <label for="decision-choices">Choices, one per line</label>
          <p id="decision-help" class="decision-help">2–20 lines, up to 80 characters each. Blank lines are ignored. Every line has an equal chance, including repeats.</p>
          <textarea id="decision-choices" data-decision-choices rows="7" maxlength="4096" spellcheck="false" aria-describedby="decision-help decision-status"></textarea>
          <div class="decision-actions"><button type="submit" data-decision-save>Save choices</button><button type="button" data-decision-clear>Clear choices</button><button type="button" data-decision-undo hidden>Undo clear</button></div>
        </form>
        <p class="decision-draft" data-decision-draft>Save or spin to keep these choices in this browser.</p>
        <p class="decision-storage" data-decision-storage role="status" hidden></p>
        <div class="decision-history-heading"><h2>Recent picks</h2><span>Last 10 · this session</span></div>
        <p class="decision-help" data-decision-empty-history>Your first pick will appear here.</p>
        <ol class="decision-history" data-decision-history aria-label="Recent picks"></ol>
      </section>
      <section class="decision-stage" aria-label="Decision wheel">
        <div class="decision-wheel-wrap" aria-hidden="true"><span class="decision-pointer"></span><div class="decision-wheel" data-decision-wheel></div><span class="decision-hub">CHOOSE</span></div>
        <button class="decision-spin" type="button" data-decision-spin>Spin the wheel</button>
        <div class="decision-result"><span data-decision-result-label>Ready for a little chance?</span><output data-decision-result aria-label="Chosen option">Give the wheel a spin.</output></div>
        <ol class="decision-legend" data-decision-legend aria-label="Wheel choices"></ol>
      </section>
    </div>
    <p id="decision-status" class="desk-app-status decision-status" data-decision-status role="status">Choose something good. Results use your browser’s secure random generator.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const editor = find<HTMLTextAreaElement>("[data-decision-choices]");
  const save = find<HTMLButtonElement>("[data-decision-save]");
  const clear = find<HTMLButtonElement>("[data-decision-clear]");
  const undo = find<HTMLButtonElement>("[data-decision-undo]");
  const spin = find<HTMLButtonElement>("[data-decision-spin]");
  const wheel = find<HTMLElement>("[data-decision-wheel]");
  const legend = find<HTMLOListElement>("[data-decision-legend]");
  const status = find<HTMLElement>("[data-decision-status]");
  const draft = find<HTMLElement>("[data-decision-draft]");
  const storageNotice = find<HTMLElement>("[data-decision-storage]");
  const historyList = find<HTMLOListElement>("[data-decision-history]");
  let history: string[] = [];
  let previous: ClearSnapshot | null = null;
  let pending: Pending | null = null;
  let animation: Animation | null = null;
  let rotation = 0;
  let disposed = false;
  editor.value = choices.join("\n");

  function feedback(message: string, error = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  }

  function showStorageMessage() {
    storageNotice.textContent = storageMessage;
    storageNotice.hidden = !storageMessage;
  }

  function persist(): boolean {
    if (storageBlocked) return false;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, choices }),
      );
      storageMessage = "";
      showStorageMessage();
      return true;
    } catch {
      storageMessage =
        "Your choices work for this session, but this browser could not save them. Try Save choices again.";
      showStorageMessage();
      return false;
    }
  }

  function parseDraft(): string[] | null {
    const parsed = editor.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    let error = "";
    if (
      editor.value.length > 4096 ||
      parsed.length < 2 ||
      parsed.length > MAX_CHOICES
    ) {
      error = "Enter between 2 and 20 non-empty choices, one per line.";
    } else if (parsed.some((choice) => choice.length > MAX_LENGTH)) {
      error = "Keep each choice to 80 characters or fewer.";
    }
    editor.setAttribute("aria-invalid", String(Boolean(error)));
    if (error) {
      feedback(error, true);
      return null;
    }
    return parsed;
  }

  function syncControls() {
    editor.disabled = save.disabled = spin.disabled = Boolean(pending);
    clear.disabled =
      Boolean(pending) || (editor.value.length === 0 && choices.length === 0);
    undo.hidden = !previous;
    undo.disabled = Boolean(pending);
    spin.textContent = pending ? "Choosing…" : "Spin the wheel";
    root.setAttribute("aria-busy", String(Boolean(pending)));
  }

  function renderWheel() {
    rotation = 0;
    wheel.style.transform = "rotate(0deg)";
    find<HTMLElement>("[data-decision-result-label]").textContent =
      choices.length ? "Ready for a little chance?" : "The wheel is empty";
    find<HTMLOutputElement>("[data-decision-result]").value = choices.length
      ? "Give the wheel a spin."
      : "Add at least two choices.";
    wheel.replaceChildren();
    legend.replaceChildren();
    const slice = 360 / Math.max(1, choices.length);
    const stops: string[] = [];
    choices.forEach((choice, index) => {
      const color = `hsl(${(index * 137.508 + 12) % 360} 68% 75%)`;
      stops.push(`${color} ${index * slice}deg ${(index + 1) * slice}deg`);
      const number = document.createElement("span");
      number.className = "decision-wheel-number";
      const radians = (((index + 0.5) * slice - 90) * Math.PI) / 180;
      number.style.left = `${50 + 36 * Math.cos(radians)}%`;
      number.style.top = `${50 + 36 * Math.sin(radians)}%`;
      number.textContent = String(index + 1);
      wheel.append(number);
      const item = document.createElement("li");
      const swatch = document.createElement("span");
      swatch.className = "decision-swatch";
      swatch.style.backgroundColor = color;
      swatch.textContent = String(index + 1);
      const label = document.createElement("span");
      label.textContent = choice;
      item.append(swatch, label);
      legend.append(item);
    });
    wheel.style.background = stops.length
      ? `conic-gradient(${stops.join(",")})`
      : "var(--desk-sidebar)";
    find<HTMLElement>("[data-decision-count]").textContent =
      `${choices.length} choices`;
    legend.hidden = !choices.length;
  }

  function useDraft(parsed: string[]) {
    const changed =
      choices.length !== parsed.length ||
      choices.some((choice, index) => choice !== parsed[index]);
    choices = parsed;
    editor.value = choices.join("\n");
    previous = null;
    if (changed) renderWheel();
    const saved = persist();
    draft.textContent = saved
      ? "Choices saved in this browser."
      : "Choices are available for this session.";
    syncControls();
    return saved;
  }

  function finishSpin() {
    if (!pending) return;
    const chosen = pending;
    pending = null;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = null;
    }
    rotation = chosen.angle % 360;
    wheel.style.transform = `rotate(${rotation}deg)`;
    find<HTMLElement>("[data-decision-result-label]").textContent =
      `Choice ${chosen.index + 1}`;
    find<HTMLOutputElement>("[data-decision-result]").value = chosen.label;
    for (const [index, item] of [...legend.children].entries()) {
      item.classList.toggle("is-chosen", index === chosen.index);
    }
    history = [chosen.label, ...history].slice(0, 10);
    historyList.replaceChildren();
    history.forEach((label, index) => {
      const item = document.createElement("li");
      const order = document.createElement("span");
      order.textContent = index === 0 ? "Latest" : String(index + 1);
      const text = document.createElement("span");
      text.textContent = label;
      item.append(order, text);
      historyList.append(item);
    });
    find<HTMLElement>("[data-decision-empty-history]").hidden = true;
    syncControls();
    feedback(`The wheel chose: ${chosen.label}.`);
  }

  find<HTMLFormElement>("form").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      if (pending) return;
      const parsed = parseDraft();
      if (!parsed) return;
      const saved = useDraft(parsed);
      feedback(
        saved
          ? `${choices.length} choices saved in this browser.`
          : `${choices.length} choices ready for this session. Saving is unavailable.`,
      );
    },
    events,
  );

  editor.addEventListener(
    "input",
    () => {
      previous = null;
      editor.removeAttribute("aria-invalid");
      draft.textContent = "Unsaved edits. Save or spin to use these choices.";
      syncControls();
    },
    events,
  );

  clear.addEventListener(
    "click",
    () => {
      if (pending || (editor.value.length === 0 && choices.length === 0))
        return;
      previous = { draft: editor.value, choices: [...choices] };
      choices = [];
      editor.value = "";
      editor.removeAttribute("aria-invalid");
      renderWheel();
      const saved = persist();
      draft.textContent = "Add at least two choices to spin again.";
      syncControls();
      feedback(
        `Choices cleared${saved ? " and saved" : " for this session"}. Undo clear restores the list.`,
      );
    },
    events,
  );

  undo.addEventListener(
    "click",
    () => {
      if (!previous || pending) return;
      choices = previous.choices;
      editor.value = previous.draft;
      previous = null;
      renderWheel();
      const saved = persist();
      draft.textContent =
        editor.value === choices.join("\n")
          ? "Your choice list is restored."
          : "Your choice list and unsaved edits are restored.";
      syncControls();
      feedback(
        saved
          ? "Choices restored and saved in this browser."
          : "Choices restored for this session. Saving is unavailable.",
      );
    },
    events,
  );

  spin.addEventListener(
    "click",
    () => {
      if (disposed || pending) return;
      const parsed = parseDraft();
      if (!parsed) return;
      let index: number;
      try {
        index = randomChoice(parsed.length);
      } catch {
        feedback("Secure randomness is unavailable. No choice was made.", true);
        return;
      }
      useDraft(parsed);
      const finalRotation =
        (360 - (index + 0.5) * (360 / choices.length)) % 360;
      pending = {
        label: choices[index],
        index,
        angle: rotation + 1440 + ((finalRotation - rotation + 360) % 360),
      };
      syncControls();
      feedback("The wheel is spinning…");
      if (
        reducedMotion.matches ||
        document.hidden ||
        root.hidden ||
        windowElement?.hidden
      ) {
        finishSpin();
        return;
      }
      try {
        animation = wheel.animate(
          [
            { transform: `rotate(${rotation}deg)` },
            { transform: `rotate(${pending.angle}deg)` },
          ],
          {
            duration: 1700,
            easing: "cubic-bezier(.15,.72,.18,1)",
            fill: "forwards",
          },
        );
        animation.onfinish = finishSpin;
      } catch {
        finishSpin();
      }
    },
    events,
  );

  const settleWhenHidden = () => {
    if (document.hidden || root.hidden || windowElement?.hidden) finishSpin();
  };
  const observer = new MutationObserver(settleWhenHidden);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (windowElement)
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  document.addEventListener("visibilitychange", settleWhenHidden, events);
  reducedMotion.addEventListener(
    "change",
    () => {
      if (reducedMotion.matches) finishSpin();
    },
    events,
  );
  renderWheel();
  syncControls();
  showStorageMessage();
  return () => {
    disposed = true;
    finishSpin();
    controller.abort();
    observer.disconnect();
    animation?.cancel();
    animation = null;
  };
}
