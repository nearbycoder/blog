import css from "../styles/desktop-converter.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("converter", css);

type Unit = { id: string; name: string; symbol: string; factor: number };
type Category = {
  id: string;
  name: string;
  note: string;
  units: Unit[];
  defaults: [string, string];
};

const categories: Category[] = [
  {
    id: "length",
    name: "Length",
    note: "International inch and foot definitions. Signed values are supported.",
    defaults: ["m", "ft"],
    units: [
      { id: "mm", name: "Millimeter", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "Centimeter", symbol: "cm", factor: 0.01 },
      { id: "m", name: "Meter", symbol: "m", factor: 1 },
      { id: "km", name: "Kilometer", symbol: "km", factor: 1000 },
      { id: "in", name: "Inch", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "Foot", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "Yard", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "Mile", symbol: "mi", factor: 1609.344 },
    ],
  },
  {
    id: "mass",
    name: "Mass",
    note: "Ounces and pounds use avoirdupois mass, not troy weight.",
    defaults: ["kg", "lb"],
    units: [
      { id: "mg", name: "Milligram", symbol: "mg", factor: 0.000001 },
      { id: "g", name: "Gram", symbol: "g", factor: 0.001 },
      { id: "kg", name: "Kilogram", symbol: "kg", factor: 1 },
      { id: "t", name: "Metric tonne", symbol: "t", factor: 1000 },
      { id: "oz", name: "Ounce", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", name: "Pound", symbol: "lb", factor: 0.45359237 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    note: "Absolute temperatures, not temperature differences. A scale and offset are applied.",
    defaults: ["c", "f"],
    units: [
      { id: "c", name: "Celsius", symbol: "°C", factor: 1 },
      { id: "f", name: "Fahrenheit", symbol: "°F", factor: 1 },
      { id: "k", name: "Kelvin", symbol: "K", factor: 1 },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    note: "US measures are liquid units; the US cup is 8 US fluid ounces. Imperial gallons are labeled separately.",
    defaults: ["l", "usgal"],
    units: [
      { id: "ml", name: "Milliliter", symbol: "mL", factor: 0.001 },
      { id: "l", name: "Liter", symbol: "L", factor: 1 },
      { id: "m3", name: "Cubic meter", symbol: "m³", factor: 1000 },
      {
        id: "ustsp",
        name: "US teaspoon",
        symbol: "US tsp",
        factor: 0.00492892159375,
      },
      {
        id: "ustbsp",
        name: "US tablespoon",
        symbol: "US tbsp",
        factor: 0.01478676478125,
      },
      {
        id: "usfloz",
        name: "US fluid ounce",
        symbol: "US fl oz",
        factor: 0.0295735295625,
      },
      { id: "uscup", name: "US cup", symbol: "US cup", factor: 0.2365882365 },
      { id: "uspt", name: "US pint", symbol: "US pt", factor: 0.473176473 },
      { id: "usgal", name: "US gallon", symbol: "US gal", factor: 3.785411784 },
      {
        id: "impgal",
        name: "Imperial gallon",
        symbol: "imp gal",
        factor: 4.54609,
      },
    ],
  },
  {
    id: "speed",
    name: "Speed",
    note: "One knot is one international nautical mile (1,852 meters) per hour.",
    defaults: ["kmh", "mph"],
    units: [
      { id: "ms", name: "Meters per second", symbol: "m/s", factor: 1 },
      {
        id: "kmh",
        name: "Kilometers per hour",
        symbol: "km/h",
        factor: 1 / 3.6,
      },
      { id: "mph", name: "Miles per hour", symbol: "mph", factor: 0.44704 },
      { id: "kn", name: "Knots", symbol: "kn", factor: 1852 / 3600 },
      { id: "fts", name: "Feet per second", symbol: "ft/s", factor: 0.3048 },
    ],
  },
  {
    id: "data",
    name: "Data",
    note: "1 byte = 8 bits. kB, MB, GB and TB use powers of 1,000; KiB, MiB, GiB and TiB use powers of 1,024.",
    defaults: ["gb", "gib"],
    units: [
      { id: "bit", name: "Bit", symbol: "bit", factor: 1 / 8 },
      { id: "b", name: "Byte", symbol: "B", factor: 1 },
      { id: "kb", name: "Kilobyte", symbol: "kB", factor: 1000 },
      { id: "mb", name: "Megabyte", symbol: "MB", factor: 1e6 },
      { id: "gb", name: "Gigabyte", symbol: "GB", factor: 1e9 },
      { id: "tb", name: "Terabyte", symbol: "TB", factor: 1e12 },
      { id: "kib", name: "Kibibyte", symbol: "KiB", factor: 1024 },
      { id: "mib", name: "Mebibyte", symbol: "MiB", factor: 1024 ** 2 },
      { id: "gib", name: "Gibibyte", symbol: "GiB", factor: 1024 ** 3 },
      { id: "tib", name: "Tebibyte", symbol: "TiB", factor: 1024 ** 4 },
    ],
  },
];

const temperatureRules: Record<
  string,
  { convert: (value: number) => number; formula: string }
> = {
  "c-f": {
    convert: (value) => value * (9 / 5) + 32,
    formula: "°F = (°C × 9/5) + 32",
  },
  "f-c": {
    convert: (value) => (value - 32) * (5 / 9),
    formula: "°C = (°F − 32) × 5/9",
  },
  "c-k": { convert: (value) => value + 273.15, formula: "K = °C + 273.15" },
  "k-c": { convert: (value) => value - 273.15, formula: "°C = K − 273.15" },
  "f-k": {
    convert: (value) => (value - 32) * (5 / 9) + 273.15,
    formula: "K = (°F − 32) × 5/9 + 273.15",
  },
  "k-f": {
    convert: (value) => (value - 273.15) * (9 / 5) + 32,
    formula: "°F = (K − 273.15) × 9/5 + 32",
  },
};

function formatNumber(value: number): string {
  const rounded = value.toPrecision(12);
  const numeric = Number(rounded);
  // Rounding a finite number near Number.MAX_VALUE can overflow on reparse.
  return Number.isFinite(numeric) ? String(numeric) : rounded;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("converter-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  let active = true;
  let revision = 0;
  let category = categories[0];
  let numericResult: number | null = null;

  root.innerHTML = `
    <div class="desk-app-toolbar converter-toolbar">
      <label for="desktop-converter-category">Convert</label>
      <select id="desktop-converter-category" aria-label="Conversion category" data-converter-category></select>
      <button type="button" data-converter-copy>Copy result</button>
    </div>
    <div class="converter-body">
      <div class="converter-amount">
        <label for="desktop-converter-amount">Amount</label>
        <input id="desktop-converter-amount" data-converter-amount type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="100" value="1" aria-describedby="converter-input-help converter-status" aria-invalid="false" />
        <p id="converter-input-help">Decimals, negatives, and scientific notation such as 1e3.</p>
      </div>
      <div class="converter-units">
        <label for="desktop-converter-from">From unit<select id="desktop-converter-from" data-converter-from></select></label>
        <button type="button" class="converter-swap" data-converter-swap aria-label="Swap units" title="Reverse this conversion">⇄ <span>Swap</span></button>
        <label for="desktop-converter-to">To unit<select id="desktop-converter-to" data-converter-to></select></label>
      </div>
      <section class="converter-result-panel" aria-label="Conversion result">
        <p class="converter-result-label">Result</p>
        <div class="converter-result-line"><output data-converter-result aria-label="Converted value" aria-live="polite"></output><span data-converter-result-unit></span></div>
        <p data-converter-equation class="converter-equation"></p>
      </section>
      <div class="converter-reference">
        <p data-converter-formula></p>
        <p data-converter-note></p>
        <p>Results display up to 12 significant digits. Copy uses the displayed value.</p>
      </div>
    </div>
    <p id="converter-status" class="desk-app-status converter-status" data-converter-status role="status">Ready.</p>
  `;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const categorySelect = find<HTMLSelectElement>("[data-converter-category]");
  const amount = find<HTMLInputElement>("[data-converter-amount]");
  const fromSelect = find<HTMLSelectElement>("[data-converter-from]");
  const toSelect = find<HTMLSelectElement>("[data-converter-to]");
  const result = find<HTMLOutputElement>("[data-converter-result]");
  const resultUnit = find<HTMLElement>("[data-converter-result-unit]");
  const equation = find<HTMLElement>("[data-converter-equation]");
  const formula = find<HTMLElement>("[data-converter-formula]");
  const note = find<HTMLElement>("[data-converter-note]");
  const copy = find<HTMLButtonElement>("[data-converter-copy]");
  const status = find<HTMLElement>("[data-converter-status]");

  for (const item of categories) {
    categorySelect.add(new Option(item.name, item.id));
  }

  function fillUnits() {
    fromSelect.replaceChildren();
    toSelect.replaceChildren();
    for (const unit of category.units) {
      const label = `${unit.name} (${unit.symbol})`;
      fromSelect.add(new Option(label, unit.id));
      toSelect.add(new Option(label, unit.id));
    }
    [fromSelect.value, toSelect.value] = category.defaults;
    note.textContent = category.note;
  }

  function feedback(message: string, error = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  }

  function render() {
    revision++;
    const from = category.units.find((unit) => unit.id === fromSelect.value)!;
    const to = category.units.find((unit) => unit.id === toSelect.value)!;
    const temperatureRule = temperatureRules[`${from.id}-${to.id}`];
    formula.textContent =
      category.id === "temperature"
        ? (temperatureRule?.formula ?? `${to.symbol} = ${from.symbol}`)
        : `1 ${from.symbol} ≈ ${formatNumber(from.factor / to.factor)} ${to.symbol}`;
    resultUnit.textContent = to.symbol;
    numericResult = null;
    copy.disabled = true;
    amount.setAttribute("aria-invalid", "false");
    result.textContent = "—";
    equation.textContent = "";

    const source = amount.value.trim();
    if (!source) {
      feedback("Enter an amount to convert.");
      return;
    }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(source)) {
      amount.setAttribute("aria-invalid", "true");
      feedback(
        "Enter a valid number, such as 12.5 or 1e3. Do not include commas or units.",
        true,
      );
      return;
    }
    const value = Number(source);
    if (!Number.isFinite(value)) {
      amount.setAttribute("aria-invalid", "true");
      feedback("This amount is too large. Enter a finite number.", true);
      return;
    }
    // Number() also maps out-of-range nonzero values such as 1e-999 to zero.
    // Inspect only the significand so valid inputs such as 0e-999 stay valid.
    if (value === 0 && /[1-9]/.test(source.split(/[eE]/, 1)[0])) {
      amount.setAttribute("aria-invalid", "true");
      feedback(
        "This amount is too small to represent. Enter a larger amount.",
        true,
      );
      return;
    }
    const converted =
      category.id === "temperature"
        ? (temperatureRule?.convert(value) ?? value)
        : value * (from.factor / to.factor);
    if (!Number.isFinite(converted)) {
      amount.setAttribute("aria-invalid", "true");
      feedback(
        "The converted result is too large. Try a smaller amount.",
        true,
      );
      return;
    }
    // Offset temperature conversions can legitimately yield zero.
    if (converted === 0 && value !== 0 && category.id !== "temperature") {
      amount.setAttribute("aria-invalid", "true");
      feedback(
        "The converted result is too small to represent. Try a larger amount.",
        true,
      );
      return;
    }
    numericResult = converted;
    const display = formatNumber(converted);
    result.textContent = display;
    equation.textContent = `${formatNumber(value)} ${from.symbol} ≈ ${display} ${to.symbol}`;
    copy.disabled = false;
    feedback("Swap reverses the conversion using the unrounded result.");
  }

  categorySelect.addEventListener(
    "change",
    () => {
      category = categories.find((item) => item.id === categorySelect.value)!;
      fillUnits();
      render();
    },
    events,
  );
  amount.addEventListener("input", render, events);
  fromSelect.addEventListener("change", render, events);
  toSelect.addEventListener("change", render, events);
  find<HTMLButtonElement>("[data-converter-swap]").addEventListener(
    "click",
    () => {
      if (numericResult !== null) amount.value = String(numericResult);
      [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
      render();
    },
    events,
  );
  copy.addEventListener(
    "click",
    async () => {
      if (numericResult === null) return;
      const copiedRevision = revision;
      const copiedValue = result.textContent ?? "";
      try {
        await navigator.clipboard.writeText(copiedValue);
        if (active && copiedRevision === revision) feedback("Result copied.");
      } catch {
        if (active && copiedRevision === revision)
          feedback(
            "Copy is unavailable. Select the result and copy it manually.",
            true,
          );
      }
    },
    events,
  );

  fillUnits();
  render();
  return () => {
    active = false;
    controller.abort();
  };
}
