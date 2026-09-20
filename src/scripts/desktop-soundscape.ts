import css from "../styles/desktop-soundscape.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("soundscape", css);

type Layer = "white" | "pink" | "brown" | "tone";
type Preferences = {
  version: 1;
  master: number;
  white: number;
  pink: number;
  brown: number;
  tone: number;
  sleepMinutes: number;
};
type Session = {
  context: AudioContext;
  sources: (AudioBufferSourceNode | OscillatorNode)[];
  master: GainNode;
  gains: Record<Layer, GainNode>;
};
const KEY = "nearby-desktop-soundscape-v1";
const LAYERS: Layer[] = ["white", "pink", "brown", "tone"];
const DEFAULTS: Preferences = {
  version: 1,
  master: 40,
  white: 0,
  pink: 25,
  brown: 60,
  tone: 0,
  sleepMinutes: 0,
};
const PRESETS = [
  { name: "Quiet focus", white: 0, pink: 65, brown: 25, tone: 0 },
  { name: "Low and warm", white: 0, pink: 10, brown: 75, tone: 0 },
  { name: "Bright and even", white: 60, pink: 20, brown: 0, tone: 0 },
];

function readPreferences(raw: string | null): Preferences {
  if (raw === null) return { ...DEFAULTS };
  if (raw.length > 2000) throw new Error("Invalid preferences");
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object") throw new Error("Invalid preferences");
  const value = data as Preferences;
  if (
    value.version !== 1 ||
    ![0, 5, 15, 30].includes(value.sleepMinutes) ||
    !["master", ...LAYERS].every((key) => {
      const number = value[key as "master" | Layer];
      return Number.isInteger(number) && number >= 0 && number <= 100;
    })
  )
    throw new Error("Invalid preferences");
  return {
    version: 1,
    master: value.master,
    white: value.white,
    pink: value.pink,
    brown: value.brown,
    tone: value.tone,
    sleepMinutes: value.sleepMinutes,
  };
}

/** A looping, locally synthesized noise buffer. No microphone or recordings. */
function noise(
  context: AudioContext,
  kind: Exclude<Layer, "tone">,
): AudioBuffer {
  const buffer = context.createBuffer(
    1,
    context.sampleRate * 4,
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0,
    brown = 0;
  for (let index = 0; index < samples.length; index++) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") samples[index] = white;
    else if (kind === "brown") {
      brown = (brown + 0.02 * white) / 1.02;
      samples[index] = brown * 3.5;
    } else {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      samples[index] =
        (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  // Crossfade the end into the beginning to keep the loop boundary gentle.
  const fade = Math.min(
    Math.floor(context.sampleRate * 0.025),
    samples.length / 2,
  );
  for (let index = 0; index < fade; index++) {
    const amount = index / (fade - 1);
    const end = samples.length - fade + index;
    samples[end] = samples[end] * (1 - amount) + samples[index] * amount;
  }
  // Bound each layer's peak so a full mix retains headroom.
  let peak = 1;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  for (let index = 0; index < samples.length; index++) samples[index] /= peak;
  return buffer;
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const panel = root.closest<HTMLElement>(".utility-window");
  let preferences = { ...DEFAULTS };
  let storageBlocked = false;
  let storageMessage =
    "Preferences saved on this device. Playback never resumes automatically.";
  try {
    preferences = readPreferences(localStorage.getItem(KEY));
  } catch {
    storageBlocked = true;
    storageMessage =
      "Saved preferences could not be read. Changes stay in this session; original data is unchanged.";
  }
  let session: Session | null = null;
  let state: "stopped" | "starting" | "playing" = "stopped";
  let disposed = false;
  let generation = 0;
  let deadline = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  root.classList.add("soundscape-app");
  root.innerHTML = `
    <div class="desk-app-toolbar soundscape-toolbar"><span class="soundscape-indicator" aria-hidden="true"></span><strong data-soundscape-state>Ready to play</strong><span class="soundscape-offline">Synthesized audio</span></div>
    <div class="soundscape-body">
      <div class="soundscape-intro"><div class="soundscape-mark" aria-hidden="true">≋</div><div><h2>A quieter corner.</h2><p>Blend three colors of noise and a soft sine tone.<br />Generated here, without recordings.</p></div></div>
      <div class="soundscape-presets" role="group" aria-label="Sound presets"><button type="button" data-preset="0">Quiet focus</button><button type="button" data-preset="1">Low and warm</button><button type="button" data-preset="2">Bright and even</button></div>
      <div class="soundscape-layers">
        <label class="soundscape-layer"><span class="soundscape-layer-copy"><strong>White noise</strong><small>Bright, even hiss</small></span><input type="range" min="0" max="100" step="1" data-volume="white" aria-label="White noise volume" /><output data-level="white"></output></label>
        <label class="soundscape-layer"><span class="soundscape-layer-copy"><strong>Pink noise</strong><small>Soft, balanced texture</small></span><input type="range" min="0" max="100" step="1" data-volume="pink" aria-label="Pink noise volume" /><output data-level="pink"></output></label>
        <label class="soundscape-layer"><span class="soundscape-layer-copy"><strong>Brown noise</strong><small>Deep, warm rumble</small></span><input type="range" min="0" max="100" step="1" data-volume="brown" aria-label="Brown noise volume" /><output data-level="brown"></output></label>
        <label class="soundscape-layer"><span class="soundscape-layer-copy"><strong>Gentle tone</strong><small>Optional · 220 Hz sine</small></span><input type="range" min="0" max="100" step="1" data-volume="tone" aria-label="Gentle tone volume" /><output data-level="tone"></output></label>
      </div>
      <label class="soundscape-master"><strong>Master volume</strong><input type="range" min="0" max="100" step="1" data-volume="master" aria-label="Master volume" /><output data-level="master"></output></label>
      <div class="soundscape-transport"><div class="soundscape-actions"><button type="button" data-play><span aria-hidden="true">▶</span> Play</button><button type="button" data-stop disabled><span aria-hidden="true">■</span> Stop</button></div><label class="soundscape-sleep">Sleep timer<select aria-label="Sleep timer"><option value="0">Off</option><option value="5">5 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option></select></label></div>
      <p class="soundscape-timer" data-timer aria-live="off">Timer off</p>
      <p class="soundscape-notice" data-playback-message role="status">Press Play to begin. Minimizing or leaving this tab stops the sound.</p>
    </div>
    <p class="desk-app-status" data-storage></p>`;
  const get = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const play = get<HTMLButtonElement>("[data-play]");
  const stop = get<HTMLButtonElement>("[data-stop]");
  const message = get<HTMLElement>("[data-playback-message]");
  const timerText = get<HTMLElement>("[data-timer]");
  const storage = get<HTMLElement>("[data-storage]");
  const sleep = get<HTMLSelectElement>("select");
  storage.textContent = storageMessage;
  storage.setAttribute("role", "status");

  function save() {
    if (storageBlocked) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(preferences));
      storage.textContent = storageMessage;
    } catch {
      storage.textContent =
        "Preferences could not be saved. Changes stay in this session.";
    }
  }
  function render() {
    root.dataset.playback = state;
    get<HTMLElement>("[data-soundscape-state]").textContent =
      state === "playing"
        ? "Playing your mix"
        : state === "starting"
          ? "Starting audio…"
          : "Ready to play";
    play.disabled = state !== "stopped";
    stop.disabled = state === "stopped";
    for (const key of ["master", ...LAYERS] as const) {
      get<HTMLInputElement>(`[data-volume="${key}"]`).value = String(
        preferences[key],
      );
      get<HTMLOutputElement>(`[data-level="${key}"]`).textContent =
        `${preferences[key]}%`;
    }
    sleep.value = String(preferences.sleepMinutes);
    root
      .querySelectorAll<HTMLButtonElement>("[data-preset]")
      .forEach((button, index) => {
        button.setAttribute(
          "aria-pressed",
          String(
            LAYERS.every(
              (layer) => preferences[layer] === PRESETS[index][layer],
            ),
          ),
        );
      });
  }
  function applyVolume() {
    if (!session) return;
    const now = session.context.currentTime;
    const setGain = (gain: GainNode, value: number) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(value, now, 0.08);
    };
    setGain(session.master, (preferences.master / 100) * 0.65);
    for (const layer of LAYERS)
      setGain(
        session.gains[layer],
        (preferences[layer] / 100) * (layer === "tone" ? 0.06 : 0.3),
      );
  }
  function updateTimer() {
    if (state === "playing" && deadline) {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (!remaining) {
        stopAudio("Sleep timer finished. Sound stopped.");
        return;
      }
      timerText.textContent = `Stops in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    } else
      timerText.textContent = preferences.sleepMinutes
        ? `${preferences.sleepMinutes}-minute timer starts with Play`
        : "Timer off";
  }
  function resetTimer() {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    deadline =
      state === "playing" && preferences.sleepMinutes
        ? Date.now() + preferences.sleepMinutes * 60_000
        : 0;
    if (deadline) timer = setInterval(updateTimer, 1000);
    updateTimer();
  }
  function release(active: Session) {
    for (const source of active.sources) {
      try {
        source.stop();
      } catch {
        /* A source may not have started. */
      }
      source.disconnect();
    }
    for (const gain of Object.values(active.gains)) gain.disconnect();
    active.master.disconnect();
    void active.context.close().catch(() => {});
  }
  function stopAudio(reason: string) {
    generation++;
    const previous = session;
    session = null;
    state = "stopped";
    if (previous) release(previous);
    resetTimer();
    if (!disposed) {
      render();
      message.textContent = reason;
    }
  }
  function available() {
    return (
      !disposed &&
      !document.hidden &&
      !panel?.hidden &&
      !root.hidden &&
      root.isConnected
    );
  }
  async function startAudio() {
    if (state !== "stopped" || !available()) return;
    if (!window.AudioContext) {
      message.textContent = "Audio synthesis is unavailable in this browser.";
      return;
    }
    const request = ++generation;
    state = "starting";
    render();
    message.textContent = "Starting synthesized audio…";
    let context: AudioContext | undefined;
    try {
      context = new AudioContext();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      const gains = {} as Record<Layer, GainNode>;
      const sources: Session["sources"] = [];
      session = { context, master, gains, sources };
      for (const layer of LAYERS) {
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(master);
        gains[layer] = gain;
        if (layer === "tone") {
          const source = context.createOscillator();
          sources.push(source);
          source.type = "sine";
          source.frequency.value = 220;
          source.connect(gain);
          source.start();
        } else {
          const source = context.createBufferSource();
          sources.push(source);
          source.buffer = noise(context, layer);
          source.loop = true;
          source.loopStart = 0.025;
          source.connect(gain);
          source.start();
        }
      }
      await context.resume();
      if (request !== generation || !available()) {
        if (request === generation)
          stopAudio(
            "Sound stopped while this window was hidden. Press Play to resume.",
          );
        return;
      }
      state = "playing";
      applyVolume();
      render();
      resetTimer();
      message.textContent =
        "Playing synthesized noise. Adjust any layer to shape your mix.";
    } catch {
      if (request !== generation) return;
      if (!session && context) void context.close().catch(() => {});
      stopAudio("Audio could not start. Press Play to try again.");
    }
  }
  root.querySelectorAll<HTMLInputElement>("[data-volume]").forEach((input) => {
    input.addEventListener(
      "input",
      () => {
        const key = input.dataset.volume as "master" | Layer;
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        preferences[key] = Math.max(0, Math.min(100, Math.round(value)));
        applyVolume();
        render();
        save();
      },
      { signal },
    );
  });
  root
    .querySelectorAll<HTMLButtonElement>("[data-preset]")
    .forEach((button, index) => {
      button.addEventListener(
        "click",
        () => {
          for (const layer of LAYERS)
            preferences[layer] = PRESETS[index][layer];
          applyVolume();
          render();
          save();
          message.textContent = `${PRESETS[index].name} mix selected.${state === "stopped" ? " Press Play to listen." : ""}`;
        },
        { signal },
      );
    });
  sleep.addEventListener(
    "change",
    () => {
      const value = Number(sleep.value);
      if (![0, 5, 15, 30].includes(value)) return;
      preferences.sleepMinutes = value;
      resetTimer();
      save();
      message.textContent = value
        ? `Sleep timer set to ${value} minutes${state === "playing" ? " from now" : " after Play"}.`
        : "Sleep timer turned off.";
    },
    { signal },
  );
  play.addEventListener("click", () => void startAudio(), { signal });
  stop.addEventListener(
    "click",
    () => stopAudio("Sound stopped. Press Play whenever you are ready."),
    { signal },
  );
  const onHidden = () => {
    if (state !== "stopped" && !available())
      stopAudio(
        "Sound stopped while this window was hidden. Press Play to resume.",
      );
  };
  document.addEventListener("visibilitychange", onHidden, { signal });
  window.addEventListener(
    "pagehide",
    () => {
      if (state !== "stopped") stopAudio("Sound stopped.");
    },
    { signal },
  );
  const observer = new MutationObserver(onHidden);
  if (panel)
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  render();
  updateTimer();
  return () => {
    disposed = true;
    controller.abort();
    observer.disconnect();
    stopAudio("Sound stopped.");
  };
}
