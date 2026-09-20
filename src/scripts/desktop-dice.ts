import css from "../styles/desktop-dice.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("dice", css);

const SIDES = [4, 6, 8, 10, 12, 20, 100];
type Roll = { label: string; values: number[]; total: number; coin?: string };

/** Reject the incomplete tail of the uint32 range to keep every face equally likely. */
function randomFace(sides: number): number {
  const limit = Math.floor(0x100000000 / sides) * sides;
  const bytes = new Uint32Array(1);
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return (bytes[0] % sides) + 1;
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const events = { signal: controller.signal };
  root.classList.add("dice-app");
  root.innerHTML = `
    <div class="desk-app-toolbar dice-toolbar">
      <span>Your tabletop sidekick</span>
      <button type="button" data-dice-coin>Flip a coin</button>
    </div>
    <div class="dice-body">
      <section class="dice-table" aria-label="Dice table">
        <form class="dice-controls" novalidate>
          <label>Die type
            <select data-dice-sides aria-describedby="dice-range-help">
              <option value="4">d4 · four sides</option>
              <option value="6" selected>d6 · six sides</option>
              <option value="8">d8 · eight sides</option>
              <option value="10">d10 · ten sides</option>
              <option value="12">d12 · twelve sides</option>
              <option value="20">d20 · twenty sides</option>
              <option value="100">d100 · hundred sides</option>
            </select>
          </label>
          <label>Dice count
            <input data-dice-count type="number" min="1" max="12" step="1" value="2" inputmode="numeric" aria-describedby="dice-range-help dice-status" />
          </label>
          <button type="submit" class="dice-roll" data-dice-roll>Roll dice</button>
        </form>
        <p class="dice-help" id="dice-range-help">Choose 1–12 dice. Each die rolls from 1 to its number of sides.</p>
        <div class="dice-result" aria-label="Latest result">
          <div class="dice-result-heading"><span data-dice-label>Ready to roll</span><span class="dice-total-label" data-dice-total-label hidden>Total <output data-dice-total aria-label="Total"></output></span></div>
          <div class="dice-faces" data-dice-faces></div>
          <p class="dice-empty" data-dice-empty>Pick your dice and give them a roll.</p>
        </div>
        <p class="dice-footnote">Fresh, independent results from your browser’s secure random generator.</p>
      </section>
      <aside class="dice-history" aria-label="Roll history">
        <div class="dice-history-heading"><h2>Recent rolls</h2><span data-dice-history-count>0 / 10</span></div>
        <div class="dice-history-actions"><button type="button" data-dice-clear disabled>Clear history</button><button type="button" data-dice-undo hidden>Undo clear</button></div>
        <p class="dice-history-note">Last 10 results in this session.</p>
        <p class="dice-empty-history" data-dice-empty-history>No rolls yet.</p>
        <ol data-dice-history></ol>
      </aside>
    </div>
    <p class="desk-app-status dice-status" id="dice-status" data-dice-status role="status">Ready. Roll the dice or flip a coin.</p>
  `;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const form = find<HTMLFormElement>("form");
  const countInput = find<HTMLInputElement>("[data-dice-count]");
  const sidesInput = find<HTMLSelectElement>("[data-dice-sides]");
  const faces = find<HTMLElement>("[data-dice-faces]");
  const historyList = find<HTMLOListElement>("[data-dice-history]");
  const status = find<HTMLElement>("[data-dice-status]");
  const clear = find<HTMLButtonElement>("[data-dice-clear]");
  const undo = find<HTMLButtonElement>("[data-dice-undo]");
  let history: Roll[] = [];
  let cleared: Roll[] = [];

  function feedback(message: string, error = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  }

  function renderHistory() {
    historyList.replaceChildren();
    history.forEach((roll) => {
      const item = document.createElement("li");
      const heading = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = roll.label;
      const total = document.createElement("strong");
      total.textContent = roll.coin ?? String(roll.total);
      heading.append(label, total);
      item.append(heading);
      if (!roll.coin) {
        const values = document.createElement("small");
        values.textContent = roll.values.join(" + ");
        item.append(values);
      }
      historyList.append(item);
    });
    find<HTMLElement>("[data-dice-empty-history]").hidden = history.length > 0;
    find<HTMLElement>("[data-dice-history-count]").textContent =
      `${history.length} / 10`;
    clear.disabled = history.length === 0;
    undo.hidden = cleared.length === 0;
  }

  function showRoll(roll: Roll) {
    faces.replaceChildren();
    find<HTMLElement>("[data-dice-empty]").hidden = true;
    find<HTMLElement>("[data-dice-label]").textContent = roll.label;
    find<HTMLElement>("[data-dice-total-label]").hidden = !!roll.coin;
    find<HTMLOutputElement>("[data-dice-total]").value = roll.coin
      ? ""
      : String(roll.total);
    if (roll.coin) {
      const coin = document.createElement("div");
      coin.className = "dice-coin-face";
      coin.dataset.diceCoinResult = "";
      coin.textContent = roll.coin;
      faces.append(coin);
    } else {
      roll.values.forEach((value, index) => {
        const face = document.createElement("div");
        face.className = "dice-face";
        face.dataset.diceValue = String(value);
        face.setAttribute("aria-label", `Die ${index + 1}: ${value}`);
        face.textContent = String(value);
        faces.append(face);
      });
    }
    history.unshift(roll);
    history = history.slice(0, 10);
    renderHistory();
    feedback(
      roll.coin
        ? `Coin flip: ${roll.coin}.`
        : `${roll.label}: ${roll.values.join(", ")}. Total ${roll.total}.`,
    );
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const count = Number(countInput.value);
      const sides = Number(sidesInput.value);
      const countValid =
        countInput.value.trim() !== "" &&
        Number.isInteger(count) &&
        count >= 1 &&
        count <= 12;
      const sidesValid = SIDES.includes(sides);
      countInput.setAttribute("aria-invalid", String(!countValid));
      sidesInput.setAttribute("aria-invalid", String(!sidesValid));
      if (!countValid || !sidesValid) {
        feedback(
          !countValid
            ? "Enter a whole number of dice from 1 to 12."
            : "Choose a supported die type.",
          true,
        );
        return;
      }
      try {
        const values = Array.from({ length: count }, () => randomFace(sides));
        showRoll({
          label: `${count}d${sides}`,
          values,
          total: values.reduce((sum, value) => sum + value, 0),
        });
      } catch {
        feedback(
          "Secure randomness is unavailable in this browser. No roll was made.",
          true,
        );
      }
    },
    events,
  );

  find<HTMLButtonElement>("[data-dice-coin]").addEventListener(
    "click",
    () => {
      try {
        showRoll({
          label: "Coin flip",
          values: [],
          total: 0,
          coin: randomFace(2) === 1 ? "Heads" : "Tails",
        });
      } catch {
        feedback(
          "Secure randomness is unavailable in this browser. No flip was made.",
          true,
        );
      }
    },
    events,
  );

  clear.addEventListener(
    "click",
    () => {
      cleared = history;
      history = [];
      renderHistory();
      feedback("History cleared. Undo clear restores those rolls.");
    },
    events,
  );

  undo.addEventListener(
    "click",
    () => {
      history = [...history, ...cleared].slice(0, 10);
      cleared = [];
      renderHistory();
      feedback(
        "Cleared history restored. The 10 most recent results are shown.",
      );
    },
    events,
  );

  return () => controller.abort();
}
