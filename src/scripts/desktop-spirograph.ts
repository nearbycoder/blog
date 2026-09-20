import css from "../styles/desktop-spirograph.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("spirograph", css);

type Orbit = {
  kind: "inside" | "outside";
  radius: number;
  wheel: number;
  offset: number;
  rotation: number;
  width: number;
  color: string;
  prism: boolean;
  paper: boolean;
};

const presets: Record<string, Orbit> = {
  silk: {
    kind: "inside",
    radius: 120,
    wheel: 49,
    offset: 76,
    rotation: 0,
    width: 0.8,
    color: "#6ee7cf",
    prism: true,
    paper: false,
  },
  bloom: {
    kind: "inside",
    radius: 120,
    wheel: 45,
    offset: 65,
    rotation: 90,
    width: 1.4,
    color: "#fb8f9f",
    prism: false,
    paper: false,
  },
  halo: {
    kind: "outside",
    radius: 100,
    wheel: 36,
    offset: 54,
    rotation: 0,
    width: 0.8,
    color: "#71b9ff",
    prism: true,
    paper: false,
  },
  star: {
    kind: "inside",
    radius: 140,
    wheel: 60,
    offset: 60,
    rotation: 90,
    width: 1.8,
    color: "#305cc5",
    prism: false,
    paper: true,
  },
};

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** Retained mathematical points let the preview resize without losing its drawing. */
export function mountApp(root: HTMLElement): () => void {
  root.classList.add("spirograph-app");
  root.innerHTML = `
    <div class="desk-app-toolbar spirograph-toolbar">
      <div><strong>Orbit Studio</strong><span>One line. Endless possibilities.</span></div>
      <button type="button" data-orbit-action="export">Export PNG</button>
    </div>
    <div class="spirograph-workspace">
      <section class="spirograph-controls" aria-label="Curve controls">
        <label class="spirograph-field">Starting shape
          <select data-orbit-preset aria-label="Starting shape">
            <option value="silk">Silk · woven rosette</option>
            <option value="bloom">Bloom · eight petals</option>
            <option value="halo">Halo · outer orbit</option>
            <option value="star">Star · seven points</option>
            <option value="custom" disabled>Custom curve</option>
          </select>
        </label>
        <label class="spirograph-field">Curve family
          <select data-orbit-field="kind" aria-label="Curve family">
            <option value="inside">Inside · hypotrochoid</option>
            <option value="outside">Outside · epitrochoid</option>
          </select>
        </label>
        <div class="spirograph-sliders">
          <label><span>Fixed radius <output data-orbit-output="radius"></output></span><input data-orbit-field="radius" aria-label="Fixed radius" type="range" min="80" max="160" step="1"></label>
          <label><span>Rolling radius <output data-orbit-output="wheel"></output></span><input data-orbit-field="wheel" aria-label="Rolling radius" type="range" min="10" max="75" step="1"></label>
          <label><span>Pen offset <output data-orbit-output="offset"></output></span><input data-orbit-field="offset" aria-label="Pen offset" type="range" min="0" max="120" step="1"></label>
          <label><span>Rotation <output data-orbit-output="rotation"></output></span><input data-orbit-field="rotation" aria-label="Rotation" type="range" min="0" max="359" step="1"></label>
          <label><span>Line weight <output data-orbit-output="width"></output></span><input data-orbit-field="width" aria-label="Line weight" type="range" min="0.5" max="3" step="0.1"></label>
        </div>
        <div class="spirograph-ink">
          <label class="spirograph-color">Ink <input type="color" data-orbit-field="color" aria-label="Ink color"></label>
          <label class="spirograph-check"><input type="checkbox" data-orbit-field="prism"> Prism ink</label>
        </div>
        <label class="spirograph-check"><input type="checkbox" data-orbit-field="paper"> Light paper</label>
        <button type="button" class="spirograph-random" data-orbit-action="random">Randomize curve <span aria-hidden="true">↗</span></button>
      </section>
      <div class="spirograph-stage">
        <canvas tabindex="0" role="img" aria-label="Spirograph curve" aria-describedby="spirograph-help">A spirograph curve is drawn here. Adjust the labeled controls to create a new curve.</canvas>
        <div class="spirograph-stage-top" aria-hidden="true"><span>ORBIT / <span data-orbit-name>01</span></span><span data-orbit-family>HYPO</span></div>
        <span class="spirograph-stage-bottom" aria-hidden="true">A SINGLE, CONTINUOUS LINE</span>
      </div>
      <p class="spirograph-help" id="spirograph-help">A pen follows a rolling circle. Change its radii to discover a pattern. Drag the drawing, or use its arrow keys, to rotate.</p>
    </div>
    <div class="desk-app-status spirograph-status"><span data-orbit-status role="status" aria-live="polite"></span><span>2048 × 2048 PNG</span></div>`;

  const canvas = root.querySelector("canvas")!;
  const context = canvas.getContext("2d");
  if (!context) {
    root.innerHTML =
      '<p class="desk-app-status" role="status">Orbit Studio needs canvas support in your browser.</p>';
    return () => root.classList.remove("spirograph-app");
  }
  const ctx = context;
  const stage = root.querySelector<HTMLElement>(".spirograph-stage")!;
  const preset = root.querySelector<HTMLSelectElement>("[data-orbit-preset]")!;
  const status = root.querySelector<HTMLElement>("[data-orbit-status]")!;
  const name = root.querySelector<HTMLElement>("[data-orbit-name]")!;
  const family = root.querySelector<HTMLElement>("[data-orbit-family]")!;
  const fields = new Map<string, HTMLInputElement | HTMLSelectElement>(
    Array.from(
      root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "[data-orbit-field]",
      ),
    ).map((field) => [field.dataset.orbitField!, field]),
  );
  const events = new AbortController();
  let orbit: Orbit = { ...presets.silk };
  let points = new Float32Array(0);
  let extent = 1;
  let turns = 1;
  let disposed = false;
  let drag: { id: number; x: number; rotation: number } | null = null;

  function generate() {
    const inside = orbit.kind === "inside";
    const rollingCenter = inside
      ? orbit.radius - orbit.wheel
      : orbit.radius + orbit.wheel;
    const frequency = rollingCenter / orbit.wheel;
    turns = orbit.wheel / gcd(orbit.radius, orbit.wheel);
    const angle = Math.PI * 2 * turns;
    // Even coprime radii have a hard sampling bound; there is no idle animation.
    const segments = Math.min(
      18000,
      Math.max(1200, Math.ceil(angle * Math.max(1, frequency) * 28)),
    );
    points = new Float32Array((segments + 1) * 2);
    extent = rollingCenter + orbit.offset;
    for (let index = 0; index <= segments; index++) {
      const t = (index / segments) * angle;
      points[index * 2] =
        rollingCenter * Math.cos(t) +
        (inside ? 1 : -1) * orbit.offset * Math.cos(frequency * t);
      points[index * 2 + 1] =
        rollingCenter * Math.sin(t) - orbit.offset * Math.sin(frequency * t);
    }
    // The theoretical closure is exact; avoid a floating-point seam in exports.
    points[points.length - 2] = points[0];
    points[points.length - 1] = points[1];
  }

  function paint(
    target: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.fillStyle = orbit.paper ? "#faf8f2" : "#101c29";
    target.fillRect(0, 0, width, height);
    const size = Math.min(width, height);
    const scale = (size * 0.42) / Math.max(1, extent);
    target.save();
    target.translate(width / 2, height / 2);
    target.rotate((orbit.rotation * Math.PI) / 180);
    target.lineWidth = Math.max(0.6, (orbit.width * size) / 440);
    target.lineCap = "round";
    target.lineJoin = "round";
    if (orbit.prism) {
      const gradient = target.createLinearGradient(
        -size * 0.4,
        -size * 0.35,
        size * 0.4,
        size * 0.35,
      );
      gradient.addColorStop(0, orbit.paper ? "#16765c" : "#7af3c5");
      gradient.addColorStop(0.4, orbit.paper ? "#245baa" : "#6cbcff");
      gradient.addColorStop(0.7, orbit.paper ? "#9140ab" : "#ce91ed");
      gradient.addColorStop(1, orbit.paper ? "#b64747" : "#ffa890");
      target.strokeStyle = gradient;
    } else target.strokeStyle = orbit.color;
    target.beginPath();
    target.moveTo(points[0] * scale, points[1] * scale);
    for (let index = 2; index < points.length; index += 2)
      target.lineTo(points[index] * scale, points[index + 1] * scale);
    target.stroke();
    target.restore();
  }

  function render() {
    if (disposed) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.min(2400, Math.max(1, Math.round(rect.width * density)));
    const height = Math.min(
      2400,
      Math.max(1, Math.round(rect.height * density)),
    );
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    paint(ctx, width, height);
  }

  function sync(custom = false) {
    if (custom) preset.value = "custom";
    for (const [key, field] of fields) {
      const value = orbit[key as keyof Orbit];
      if (typeof value === "boolean")
        (field as HTMLInputElement).checked = value;
      else field.value = String(value);
      const output = root.querySelector<HTMLOutputElement>(
        `[data-orbit-output="${key}"]`,
      );
      if (output)
        output.value = key === "rotation" ? `${value}°` : String(value);
    }
    (fields.get("color") as HTMLInputElement).disabled = orbit.prism;
    stage.classList.toggle("spirograph-paper", orbit.paper);
    name.textContent =
      preset.value === "custom" ? "CUSTOM" : preset.value.toUpperCase();
    family.textContent = orbit.kind === "inside" ? "HYPO" : "EPI";
    const type = orbit.kind === "inside" ? "Hypotrochoid" : "Epitrochoid";
    canvas.setAttribute(
      "aria-label",
      `${type} spirograph: fixed radius ${orbit.radius}, rolling radius ${orbit.wheel}, pen offset ${orbit.offset}, rotation ${orbit.rotation} degrees`,
    );
    status.textContent = `${turns} ${turns === 1 ? "revolution" : "revolutions"} · ${(points.length / 2 - 1).toLocaleString()} segments`;
  }

  function refresh(custom: boolean, geometry = true) {
    if (geometry) generate();
    sync(custom);
    render();
  }

  root.addEventListener(
    "input",
    (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const key = input.dataset.orbitField;
      if (!key) return;
      if (key === "prism" || key === "paper") orbit[key] = input.checked;
      else if (key === "color") {
        if (/^#[0-9a-f]{6}$/i.test(input.value)) orbit.color = input.value;
      } else if (
        key === "radius" ||
        key === "wheel" ||
        key === "offset" ||
        key === "rotation" ||
        key === "width"
      ) {
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        orbit[key] = Math.max(
          Number(input.min),
          Math.min(Number(input.max), value),
        );
      }
      refresh(true, key === "radius" || key === "wheel" || key === "offset");
    },
    { signal: events.signal },
  );

  root.addEventListener(
    "change",
    (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) return;
      if (select === preset && Object.hasOwn(presets, preset.value)) {
        orbit = { ...presets[preset.value] };
        refresh(false);
      } else if (
        select.dataset.orbitField === "kind" &&
        (select.value === "inside" || select.value === "outside")
      ) {
        orbit.kind = select.value;
        refresh(true);
      }
    },
    { signal: events.signal },
  );

  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-orbit-action]",
      );
      if (!button) return;
      if (button.dataset.orbitAction === "random") {
        orbit = {
          ...orbit,
          radius: 80 + Math.floor(Math.random() * 81),
          wheel: 10 + Math.floor(Math.random() * 66),
          offset: 18 + Math.floor(Math.random() * 103),
          kind: Math.random() < 0.7 ? "inside" : "outside",
          rotation: Math.floor(Math.random() * 360),
        };
        refresh(true);
      } else if (button.dataset.orbitAction === "export") {
        try {
          const exported = document.createElement("canvas");
          exported.width = exported.height = 2048;
          const exportContext = exported.getContext("2d");
          if (!exportContext) throw new Error("Canvas is unavailable");
          paint(exportContext, 2048, 2048);
          const link = document.createElement("a");
          link.href = exported.toDataURL("image/png");
          link.download = `orbit-studio-${orbit.radius}-${orbit.wheel}-${orbit.offset}.png`;
          link.click();
          status.textContent = "PNG exported · 2048 × 2048 pixels";
        } catch {
          status.textContent = "PNG could not be exported. Try again.";
        }
      }
    },
    { signal: events.signal },
  );

  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || drag) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        rotation: orbit.rotation,
      };
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
      event.preventDefault();
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      orbit.rotation =
        ((Math.round(drag.rotation + (event.clientX - drag.x) * 0.6) % 360) +
          360) %
        360;
      refresh(true, false);
    },
    { signal: events.signal },
  );
  function finishDrag(event?: Event) {
    if (!drag || (event instanceof PointerEvent && event.pointerId !== drag.id))
      return;
    const id = drag.id;
    drag = null;
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }
  for (const event of [
    "pointerup",
    "pointercancel",
    "lostpointercapture",
  ] as const)
    canvas.addEventListener(event, finishDrag, { signal: events.signal });
  canvas.addEventListener(
    "keydown",
    (event) => {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        !["ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      event.preventDefault();
      orbit.rotation =
        (orbit.rotation +
          (event.key === "ArrowLeft" ? -1 : 1) * (event.shiftKey ? 15 : 1) +
          360) %
        360;
      refresh(true, false);
    },
    { signal: events.signal },
  );
  window.addEventListener("blur", finishDrag, { signal: events.signal });
  const resize = new ResizeObserver(render);
  resize.observe(stage);
  refresh(false);

  return () => {
    disposed = true;
    finishDrag();
    events.abort();
    resize.disconnect();
    points = new Float32Array(0);
    root.classList.remove("spirograph-app");
  };
}
