import css from "../styles/desktop-colors.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("colors", css);

const STORAGE_KEY = "nearby-desktop-colors-v1";
const LIMIT = 12;
type RGB = [number, number, number];
type HSL = [number, number, number];

function hexColor(value: string): string | null {
  const hex = value.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;
  return `#${(hex.length === 3 ? [...hex].map((x) => x + x).join("") : hex).toUpperCase()}`;
}

function rgb(hex: string): RGB {
  return [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  ) as RGB;
}

function hsl(hex: string): HSL {
  const [r, g, b] = rgb(hex).map((value) => value / 255);
  const high = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  const delta = high - low;
  const lightness = (high + low) / 2;
  if (!delta) return [0, 0, lightness * 100];
  const hue =
    high === r
      ? (g - b) / delta
      : high === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return [
    (hue * 60 + 360) % 360,
    (delta / (1 - Math.abs(2 * lightness - 1))) * 100,
    lightness * 100,
  ];
}

function fromHsl([h, s, l]: HSL): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("colors-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  let selected = "#3D7BC0";
  let saved: string[] = [];
  let undo: string[] | null = null;
  let storageIssue = "";
  let preserveStored = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 512) throw new Error("Malformed palette");
      const value: unknown = JSON.parse(raw);
      if (
        !Array.isArray(value) ||
        value.length > LIMIT ||
        value.some(
          (item) => typeof item !== "string" || !/^#[\dA-F]{6}$/i.test(item),
        )
      )
        throw new Error("Malformed palette");
      saved = [...new Set(value.map((item: string) => item.toUpperCase()))];
    }
  } catch (error) {
    preserveStored = true;
    storageIssue =
      error instanceof SyntaxError ||
      (error instanceof Error && error.message === "Malformed palette")
        ? "Saved palette is unreadable. Original data is preserved; changes last this session."
        : "Local storage is unavailable. Saved colors last this session.";
  }

  root.innerHTML = `
    <div class="desk-app-toolbar colors-toolbar"><strong>Color Studio</strong><span>Pick · pair · check</span></div>
    <div class="colors-scroll">
      <section class="colors-editor" aria-label="Color editor">
        <label class="colors-picker-label">Pick color<input type="color" value="#3d7bc0" aria-label="Pick color" data-colors-picker></label>
        <div class="colors-hex-field"><label for="colors-hex">Hex color</label><input id="colors-hex" value="#3D7BC0" maxlength="32" spellcheck="false" autocapitalize="off" autocomplete="off" aria-invalid="false" aria-describedby="colors-hex-help" data-colors-hex><span id="colors-hex-help">3 or 6 hex digits · no alpha</span></div>
        <button type="button" data-colors-action="save">Save swatch</button>
      </section>
      <div class="colors-values" aria-label="Color codes"><button type="button" data-colors-code="rgb" aria-label="Copy RGB code"></button><button type="button" data-colors-code="hsl" aria-label="Copy HSL code"></button><button type="button" data-colors-code="hex" aria-label="Copy hex code"></button></div>
      <div class="colors-main-grid">
        <section class="colors-section" aria-label="Color palettes"><h3>Color harmonies <span>Click a swatch to copy</span></h3><h4>Complementary</h4><div class="colors-palette" data-colors-complement></div><h4>Analogous</h4><div class="colors-palette" data-colors-analogous></div><p class="colors-note">Hue offsets: 180° opposite, ±30° neighbors.</p></section>
        <section class="colors-section" aria-label="Contrast checker"><h3>Contrast checker</h3><div class="colors-contrast-inputs"><label>Foreground<input value="#000000" maxlength="32" spellcheck="false" aria-invalid="false" data-colors-foreground></label><label>Background<input value="#FFFFFF" maxlength="32" spellcheck="false" aria-invalid="false" data-colors-background></label></div><div class="colors-contrast-actions"><button type="button" data-colors-action="foreground">Use color as text</button><button type="button" data-colors-action="background">Use color as background</button></div><div class="colors-preview" data-colors-preview><span>Aa</span><span>The quick brown fox<br>Readable color, measured.</span></div><div class="colors-contrast-result" aria-live="polite"><strong data-colors-ratio>21.00:1</strong><div><span data-colors-aa-normal></span><span data-colors-aa-large></span></div></div><p class="colors-note">WCAG AA: 4.5:1 normal · 3:1 large.<br>Large: 18 pt regular or 14 pt bold.</p></section>
      </div>
      <section class="colors-section colors-saved-section" aria-label="Saved swatches"><div class="colors-saved-heading"><h3>Saved swatches <span data-colors-count>0 / 12</span></h3><button type="button" data-colors-action="undo" disabled>Undo removal</button></div><p class="colors-storage-note" data-colors-storage hidden></p><div class="colors-saved" data-colors-saved></div><p class="colors-note" data-colors-empty>Save a color to build your palette. Stored only in this browser.</p></section>
    </div>
    <p class="desk-app-status colors-status" role="status" data-colors-status>Choose a color. Click a code or harmony swatch to copy it.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const hex = find<HTMLInputElement>("[data-colors-hex]");
  const picker = find<HTMLInputElement>("[data-colors-picker]");
  const foreground = find<HTMLInputElement>("[data-colors-foreground]");
  const background = find<HTMLInputElement>("[data-colors-background]");
  const status = find<HTMLElement>("[data-colors-status]");
  const button = (action: string) =>
    find<HTMLButtonElement>(`[data-colors-action="${action}"]`);

  function feedback(message: string) {
    status.textContent = message;
  }
  function storageMessage() {
    const notice = find<HTMLElement>("[data-colors-storage]");
    notice.hidden = !storageIssue;
    notice.textContent = storageIssue;
  }
  function persist() {
    if (preserveStored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      storageIssue = "";
    } catch {
      storageIssue =
        "Local storage could not be updated. Changes last this session.";
    }
    storageMessage();
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (!controller.signal.aborted) feedback(`Copied ${value}.`);
    } catch {
      if (!controller.signal.aborted)
        feedback(`Clipboard unavailable. Copy manually: ${value}`);
    }
  }
  function swatch(value: string, label: string, action: "copy" | "use") {
    const element = document.createElement("button");
    element.type = "button";
    element.className = "colors-swatch";
    element.dataset.colorsValue = value;
    element.dataset.colorsAction = action;
    element.setAttribute(
      "aria-label",
      `${action === "copy" ? "Copy" : "Use"} ${label} ${value}`,
    );
    const chip = document.createElement("span");
    chip.className = "colors-chip";
    chip.style.backgroundColor = value;
    chip.setAttribute("aria-hidden", "true");
    const code = document.createElement("span");
    code.textContent = value;
    element.append(chip, code);
    return element;
  }
  function renderColor() {
    const [h, s, l] = hsl(selected);
    const codes = {
      hex: selected,
      rgb: `rgb(${rgb(selected).join(", ")})`,
      hsl: `hsl(${Math.round(h) % 360}, ${Math.round(s)}%, ${Math.round(l)}%)`,
    };
    for (const [format, value] of Object.entries(codes)) {
      const code = find<HTMLButtonElement>(`[data-colors-code="${format}"]`);
      code.textContent = value;
      code.dataset.colorsValue = value;
    }
    picker.value = selected.toLowerCase();
    find("[data-colors-complement]").replaceChildren(
      swatch(selected, "base", "copy"),
      swatch(fromHsl([h + 180, s, l]), "complementary", "copy"),
    );
    find("[data-colors-analogous]").replaceChildren(
      ...[-30, 0, 30].map((offset) =>
        swatch(
          fromHsl([h + offset, s, l]),
          offset === 0
            ? "base"
            : `analogous ${offset > 0 ? "+" : ""}${offset} degrees`,
          "copy",
        ),
      ),
    );
  }
  function setSelected(value: string) {
    selected = value;
    hex.value = value;
    hex.setAttribute("aria-invalid", "false");
    for (const action of ["save", "foreground", "background"])
      button(action).disabled = false;
    renderColor();
  }
  function renderSaved() {
    find("[data-colors-count]").textContent = `${saved.length} / ${LIMIT}`;
    button("undo").disabled = undo === null;
    find("[data-colors-empty]").hidden = saved.length !== 0;
    find("[data-colors-saved]").replaceChildren(
      ...saved.map((value) => {
        const item = document.createElement("div");
        item.className = "colors-saved-item";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "×";
        remove.dataset.colorsAction = "remove";
        remove.dataset.colorsValue = value;
        remove.setAttribute("aria-label", `Remove saved ${value}`);
        item.append(swatch(value, "saved", "use"), remove);
        return item;
      }),
    );
  }
  function renderContrast() {
    const fg = hexColor(foreground.value);
    const bg = hexColor(background.value);
    foreground.setAttribute("aria-invalid", String(!fg));
    background.setAttribute("aria-invalid", String(!bg));
    const ratio = find("[data-colors-ratio]");
    const normal = find("[data-colors-aa-normal]");
    const large = find("[data-colors-aa-large]");
    const preview = find("[data-colors-preview]");
    preview.hidden = !fg || !bg;
    if (!fg || !bg) {
      ratio.textContent = "—";
      normal.textContent = "Enter valid hex colors.";
      large.textContent = "Use 3 or 6 digits, with optional #.";
      normal.removeAttribute("data-pass");
      large.removeAttribute("data-pass");
      return;
    }
    preview.style.color = fg;
    preview.style.backgroundColor = bg;
    const a = luminance(fg);
    const b = luminance(bg);
    const value = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    ratio.textContent = `${value.toFixed(2)}:1`;
    normal.textContent = `AA normal: ${value >= 4.5 ? "Pass" : "Fail"}`;
    large.textContent = `AA large: ${value >= 3 ? "Pass" : "Fail"}`;
    normal.dataset.pass = String(value >= 4.5);
    large.dataset.pass = String(value >= 3);
  }

  hex.addEventListener(
    "input",
    () => {
      const value = hexColor(hex.value);
      hex.setAttribute("aria-invalid", String(!value));
      for (const action of ["save", "foreground", "background"])
        button(action).disabled = !value;
      if (!value) {
        feedback(
          "Enter 3 or 6 hexadecimal digits (0–9, A–F). Preview shows the last valid color.",
        );
        return;
      }
      selected = value;
      renderColor();
      feedback(`Selected ${selected}. Color codes are ready to copy.`);
    },
    events,
  );
  picker.addEventListener(
    "input",
    () => {
      const value = hexColor(picker.value);
      if (value) {
        setSelected(value);
        feedback(`Selected ${selected}.`);
      }
    },
    events,
  );
  for (const input of [foreground, background])
    input.addEventListener("input", renderContrast, events);
  root.addEventListener(
    "click",
    (event) => {
      const target = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!target || target.disabled) return;
      const action = target.dataset.colorsAction;
      const value = target.dataset.colorsValue;
      if ((action === "copy" || target.dataset.colorsCode) && value)
        void copy(value);
      if (action === "use" && value) {
        setSelected(value);
        feedback(`Selected saved color ${value}.`);
      }
      if (action === "foreground" || action === "background") {
        (action === "foreground" ? foreground : background).value = selected;
        renderContrast();
        feedback(`Set ${action} to ${selected}.`);
      }
      if (action === "save") {
        if (saved.includes(selected)) {
          feedback(`${selected} is already saved.`);
          return;
        }
        if (saved.length >= LIMIT) {
          feedback(
            "Palette is full (12 swatches). Remove a swatch to save another.",
          );
          return;
        }
        saved.push(selected);
        undo = null;
        persist();
        renderSaved();
        feedback(
          storageIssue
            ? `Added ${selected} for this session. ${storageIssue}`
            : `Saved ${selected} in this browser.`,
        );
      }
      if (action === "remove" && value && saved.includes(value)) {
        undo = [...saved];
        saved = saved.filter((item) => item !== value);
        persist();
        renderSaved();
        feedback(
          `Removed ${value}. Undo removal restores it.${storageIssue ? ` ${storageIssue}` : ""}`,
        );
        button("undo").focus();
      }
      if (action === "undo" && undo) {
        const restored = undo.find((item) => !saved.includes(item));
        saved = undo;
        undo = null;
        persist();
        renderSaved();
        feedback(
          `Removed swatch restored.${storageIssue ? ` ${storageIssue}` : ""}`,
        );
        if (restored)
          find<HTMLButtonElement>(
            `[data-colors-action="use"][data-colors-value="${restored}"]`,
          ).focus();
      }
    },
    events,
  );

  renderColor();
  renderContrast();
  renderSaved();
  storageMessage();
  if (storageIssue) feedback(storageIssue);
  return () => controller.abort();
}
