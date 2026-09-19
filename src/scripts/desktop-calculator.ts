import css from "../styles/desktop-calculator.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("calculator", css);

/** Small arithmetic grammar: no JavaScript execution or external dependencies. */
export function calculateExpression(source: string): number {
  const expression = source
    .trim()
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-");
  if (!expression) throw new Error("Enter a calculation first.");
  if (expression.length > 500) throw new Error("This calculation is too long.");
  let index = 0;
  let depth = 0;
  const whitespace = () => {
    while (/\s/.test(expression[index] ?? "") && index < expression.length)
      index++;
  };
  const take = (character: string) => {
    whitespace();
    if (expression[index] !== character) return false;
    index++;
    return true;
  };
  const unary = (): number => {
    if (++depth > 40) throw new Error("Try fewer nested parentheses or signs.");
    let value: number;
    if (take("+")) value = unary();
    else if (take("-")) value = -unary();
    else if (take("(")) {
      value = sum();
      if (!take(")")) throw new Error("Add a closing parenthesis.");
    } else {
      whitespace();
      const number = expression
        .slice(index)
        .match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!number) throw new Error("Check the numbers and operators.");
      index += number[0].length;
      value = Number(number[0]);
    }
    while (take("%")) value /= 100;
    depth--;
    return value;
  };
  const product = (): number => {
    let value = unary();
    while (true) {
      if (take("*")) value *= unary();
      else if (take("/")) {
        const divisor = unary();
        if (divisor === 0) throw new Error("Cannot divide by zero.");
        value /= divisor;
      } else return value;
    }
  };
  const sum = (): number => {
    let value = product();
    while (true) {
      if (take("+")) value += product();
      else if (take("-")) value -= product();
      else return value;
    }
  };
  const value = sum();
  whitespace();
  if (index < expression.length)
    throw new Error("Check the numbers and operators.");
  if (!Number.isFinite(value)) throw new Error("The result is too large.");
  if (Object.is(value, -0)) return 0;
  return Number.isSafeInteger(value) ? value : Number(value.toPrecision(12));
}

export function mountCalculator(root: HTMLElement): () => void {
  const controller = new AbortController();
  const events = { signal: controller.signal };
  root.classList.add("calculator-app");
  root.innerHTML = `
    <div class="desk-app-toolbar calculator-toolbar">
      <span>Standard calculator</span>
      <button type="button" data-calculator-copy disabled>Copy result</button>
    </div>
    <div class="calculator-body">
      <section class="calculator-main" aria-label="Calculation">
        <div class="calculator-display">
          <label for="desktop-calculator-expression">Expression</label>
          <input id="desktop-calculator-expression" data-calculator-expression type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="500" placeholder="0" aria-describedby="calculator-help" />
          <output data-calculator-result aria-label="Result" aria-live="polite">0</output>
        </div>
        <div class="calculator-keypad" role="group" aria-label="Calculator keypad">
          <button type="button" data-calculator-key="(" aria-label="Open parenthesis">(</button>
          <button type="button" data-calculator-key=")" aria-label="Close parenthesis">)</button>
          <button type="button" data-calculator-action="clear" aria-label="Clear calculation">AC</button>
          <button type="button" data-calculator-action="delete" aria-label="Delete last character">⌫</button>
          ${[
            ["7", "7"],
            ["8", "8"],
            ["9", "9"],
            ["/", "Divide"],
            ["4", "4"],
            ["5", "5"],
            ["6", "6"],
            ["*", "Multiply"],
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["-", "Subtract"],
            ["0", "0"],
            [".", "Decimal point"],
            ["%", "Percent"],
            ["+", "Add"],
          ]
            .map(
              ([key, label]) =>
                `<button type="button" data-calculator-key="${key}" ${/[*/+\-%]/.test(key) ? 'class="calculator-operator"' : ""} aria-label="${label}">${({ "/": "÷", "*": "×", "-": "−" } as Record<string, string>)[key] ?? key}</button>`,
            )
            .join("")}
          <button type="button" class="calculator-equals" data-calculator-action="equals" aria-label="Calculate result">=</button>
        </div>
        <p id="calculator-help" class="calculator-help">Enter to calculate · Esc to clear · % divides by 100</p>
      </section>
      <aside class="calculator-history" aria-label="Calculation history">
        <div class="calculator-history-heading"><h2>History</h2><button type="button" data-calculator-clear-history disabled>Clear history</button></div>
        <p data-calculator-empty>Your calculations will appear here.</p>
        <ol data-calculator-history></ol>
      </aside>
    </div>
    <p class="desk-app-status calculator-status" data-calculator-status role="status">Ready for a little number crunching.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const input = find<HTMLInputElement>("[data-calculator-expression]");
  const output = find<HTMLOutputElement>("[data-calculator-result]");
  const status = find<HTMLElement>("[data-calculator-status]");
  const copy = find<HTMLButtonElement>("[data-calculator-copy]");
  const historyList = find<HTMLOListElement>("[data-calculator-history]");
  const clearHistory = find<HTMLButtonElement>(
    "[data-calculator-clear-history]",
  );
  const history: { expression: string; result: string }[] = [];
  let result = "0";
  let solved = false;

  function feedback(
    message = "Ready for a little number crunching.",
    error = false,
  ) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
    input.setAttribute("aria-invalid", String(error));
  }
  function focus() {
    input.focus({ preventScroll: true });
  }
  function renderHistory() {
    historyList.replaceChildren();
    find<HTMLElement>("[data-calculator-empty]").hidden = history.length > 0;
    clearHistory.disabled = history.length === 0;
    history.forEach((entry, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.calculatorHistoryEntry = String(index);
      button.setAttribute(
        "aria-label",
        `Reuse ${entry.expression} equals ${entry.result}`,
      );
      const expression = document.createElement("span");
      expression.textContent = entry.expression;
      const value = document.createElement("strong");
      value.textContent = `= ${entry.result}`;
      button.append(expression, value);
      item.append(button);
      historyList.append(item);
    });
  }
  function evaluate() {
    try {
      result = String(calculateExpression(input.value));
      output.value = result;
      copy.disabled = false;
      solved = true;
      if (
        history[0]?.expression !== input.value ||
        history[0]?.result !== result
      ) {
        history.unshift({ expression: input.value, result });
        history.splice(8);
        renderHistory();
      }
      feedback("Calculated. Choose a history item to use it again.");
      focus();
      input.select();
    } catch (error) {
      solved = false;
      feedback(
        error instanceof Error ? error.message : "Check this calculation.",
        true,
      );
      focus();
    }
  }
  function insert(key: string) {
    if (solved) {
      input.value = /^[\d.(]$/.test(key) ? "" : result;
      input.setSelectionRange(input.value.length, input.value.length);
    }
    solved = false;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (input.value.length - (end - start) + key.length > 500) return;
    input.setRangeText(key, start, end, "end");
    feedback();
    focus();
  }
  function remove() {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.setRangeText(
      "",
      start === end ? Math.max(0, start - 1) : start,
      end,
      "end",
    );
    solved = false;
    feedback();
    focus();
  }
  function clear() {
    input.value = "";
    output.value = "0";
    copy.disabled = true;
    result = "0";
    solved = false;
    feedback();
    focus();
  }
  input.addEventListener(
    "input",
    () => {
      solved = false;
      feedback();
    },
    events,
  );
  root.addEventListener(
    "click",
    async (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!button) return;
      if (button.dataset.calculatorKey) insert(button.dataset.calculatorKey);
      else if (button.dataset.calculatorAction === "equals") evaluate();
      else if (button.dataset.calculatorAction === "clear") clear();
      else if (button.dataset.calculatorAction === "delete") remove();
      else if (button === clearHistory) {
        history.length = 0;
        renderHistory();
        feedback("History cleared.");
      } else if (button.dataset.calculatorHistoryEntry !== undefined) {
        const entry = history[Number(button.dataset.calculatorHistoryEntry)];
        input.value = entry.expression;
        result = entry.result;
        output.value = result;
        solved = true;
        copy.disabled = false;
        feedback("Calculation restored from history.");
        focus();
        input.select();
      } else if (button === copy) {
        try {
          await navigator.clipboard.writeText(result);
          if (!controller.signal.aborted) feedback("Result copied.");
        } catch {
          if (!controller.signal.aborted)
            feedback("Copy is unavailable. Select the result to copy it.");
        }
      }
    },
    events,
  );
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const isInput = event.target === input;
      if ((event.key === "Enter" && isInput) || event.key === "=") {
        event.preventDefault();
        evaluate();
      } else if (event.key === "Escape") {
        event.preventDefault();
        clear();
      } else if (isInput && solved && /^[\d.+*/()%\-]$/.test(event.key)) {
        event.preventDefault();
        insert(event.key);
      } else if (!isInput && /^[\d.+*/()%\-]$/.test(event.key)) {
        event.preventDefault();
        insert(event.key);
      } else if (!isInput && event.key === "Backspace") {
        event.preventDefault();
        remove();
      }
    },
    events,
  );
  if (root.closest(".desktop-window")?.classList.contains("is-active")) focus();
  return () => controller.abort();
}
