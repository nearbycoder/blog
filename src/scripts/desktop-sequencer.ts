import css from "../styles/desktop-sequencer.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("sequencer", css);

type Pattern = boolean[][];
type SavedBeat = {
  version: 1;
  tempo: number;
  volume: number;
  pattern: Pattern;
};
type Sound = { source: AudioScheduledSourceNode; nodes: AudioNode[] };
const STORAGE_KEY = "nearby-desktop-sequencer-v1";
const VOICES = ["Kick", "Snare", "Hi-hat"];
const STEPS = 8;
const PRESETS: Record<string, Pattern> = {
  pocket: [
    [true, false, false, false, true, false, false, false],
    [false, false, true, false, false, false, true, false],
    [true, true, true, true, true, true, true, true],
  ],
  offbeat: [
    [true, false, false, true, true, false, false, false],
    [false, false, true, false, false, false, true, false],
    [false, true, false, true, false, true, false, true],
  ],
  sparse: [
    [true, false, false, false, false, false, false, true],
    [false, false, false, false, true, false, false, false],
    [true, false, true, false, true, false, true, false],
  ],
};
const copyPattern = (pattern: Pattern): Pattern =>
  pattern.map((row) => [...row]);

function isSavedBeat(value: unknown): value is SavedBeat {
  if (!value || typeof value !== "object") return false;
  const beat = value as Partial<SavedBeat>;
  return (
    beat.version === 1 &&
    Number.isInteger(beat.tempo) &&
    beat.tempo! >= 40 &&
    beat.tempo! <= 200 &&
    Number.isInteger(beat.volume) &&
    beat.volume! >= 0 &&
    beat.volume! <= 100 &&
    Array.isArray(beat.pattern) &&
    beat.pattern.length === VOICES.length &&
    beat.pattern.every(
      (row) =>
        Array.isArray(row) &&
        row.length === STEPS &&
        row.every((step) => typeof step === "boolean"),
    )
  );
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const windowElement = root.closest<HTMLElement>(".utility-window");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let beat: SavedBeat = {
    version: 1,
    tempo: 110,
    volume: 55,
    pattern: copyPattern(PRESETS.pocket),
  };
  let storageBlocked = false;
  let saveMessage =
    "Starter beat. Save your pattern to keep it on this device.";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 2000) throw new Error("Oversized saved pattern");
      const saved: unknown = JSON.parse(raw);
      if (!isSavedBeat(saved)) throw new Error("Invalid saved pattern");
      beat = saved;
      saveMessage = "Saved pattern loaded from this device.";
    }
  } catch {
    storageBlocked = true;
    saveMessage =
      "Saved pattern could not be read. Original data is unchanged; edits stay in this session.";
  }

  let undoPattern: Pattern | null = null;
  let disposed = false;
  let playing = false;
  let starting = false;
  let generation = 0;
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let nextStepTime = 0;
  let nextStep = 0;
  let currentStep = -1;
  const visuals = new Set<ReturnType<typeof setTimeout>>();
  const sounds = new Set<Sound>();

  root.classList.add("sequencer-app");
  root.dataset.playing = "false";
  root.innerHTML = `
    <div class="desk-app-toolbar sequencer-toolbar">
      <button type="button" class="sequencer-play" data-sequencer-play>▶ Play</button>
      <button type="button" data-sequencer-stop disabled>■ Stop</button>
      <label class="sequencer-tempo">Tempo <input type="number" min="40" max="200" step="1" inputmode="numeric" aria-label="Tempo in BPM" data-sequencer-tempo /><span>BPM</span></label>
    </div>
    <div class="sequencer-body">
      <div class="sequencer-heading"><div><h2>One bar. Your rhythm.</h2><p>8 steps · 4 beats · 3 voices</p></div><span class="sequencer-transport" data-sequencer-transport role="status">Stopped</span></div>
      <div class="sequencer-grid" data-sequencer-grid role="group" aria-label="Beat pattern"></div>
      <div class="sequencer-grid-footer"><span>Tap a step to switch it on or off.</span><span data-sequencer-count></span></div>
      <div class="sequencer-controls">
        <label class="sequencer-volume">Volume <input type="range" min="0" max="100" step="1" aria-label="Volume" data-sequencer-volume /><output data-sequencer-volume-value></output></label>
        <div class="sequencer-presets"><label>Preset <select aria-label="Beat preset" data-sequencer-preset><option value="pocket">Pocket groove</option><option value="offbeat">Offbeat</option><option value="sparse">Half-time</option></select></label><button type="button" data-sequencer-load>Load preset</button></div>
        <div class="sequencer-actions"><button type="button" data-sequencer-clear>Clear pattern</button><button type="button" data-sequencer-undo disabled>Undo change</button><button type="button" data-sequencer-save>Save pattern</button></div>
      </div>
      <p class="sequencer-help">Use arrow keys to move between steps, then Space or Enter to toggle. Playback stops when this window is minimized or the page is hidden.</p>
      <p class="sequencer-error" data-sequencer-error role="alert" hidden></p>
    </div>
    <p class="desk-app-status sequencer-status" data-sequencer-status role="status"></p>`;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const grid = find<HTMLElement>("[data-sequencer-grid]");
  const play = find<HTMLButtonElement>("[data-sequencer-play]");
  const stop = find<HTMLButtonElement>("[data-sequencer-stop]");
  const tempo = find<HTMLInputElement>("[data-sequencer-tempo]");
  const volume = find<HTMLInputElement>("[data-sequencer-volume]");
  const volumeValue = find<HTMLOutputElement>("[data-sequencer-volume-value]");
  const transport = find<HTMLElement>("[data-sequencer-transport]");
  const count = find<HTMLElement>("[data-sequencer-count]");
  const error = find<HTMLElement>("[data-sequencer-error]");
  const status = find<HTMLElement>("[data-sequencer-status]");
  const undo = find<HTMLButtonElement>("[data-sequencer-undo]");
  const save = find<HTMLButtonElement>("[data-sequencer-save]");
  const buttons: HTMLButtonElement[][] = [];
  tempo.value = String(beat.tempo);
  volume.value = String(beat.volume);
  volumeValue.value = `${beat.volume}%`;
  save.disabled = storageBlocked;
  status.textContent = saveMessage;

  VOICES.forEach((voice, rowIndex) => {
    const row = document.createElement("div");
    row.className = "sequencer-track";
    row.dataset.voice = String(rowIndex);
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", `${voice} steps`);
    const label = document.createElement("h3");
    label.textContent = voice;
    const cells = document.createElement("div");
    cells.className = "sequencer-steps";
    buttons[rowIndex] = [];
    for (let step = 0; step < STEPS; step++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sequencer-step";
      button.dataset.row = String(rowIndex);
      button.dataset.step = String(step);
      button.setAttribute("aria-label", `${voice}, step ${step + 1}`);
      button.textContent = String(step + 1);
      button.tabIndex = step === 0 ? 0 : -1;
      button.addEventListener(
        "click",
        () => {
          beat.pattern[rowIndex][step] = !beat.pattern[rowIndex][step];
          undoPattern = null;
          markChanged();
          renderPattern();
        },
        { signal },
      );
      button.addEventListener(
        "focus",
        () => {
          buttons[rowIndex].forEach((cell) => (cell.tabIndex = -1));
          button.tabIndex = 0;
        },
        { signal },
      );
      button.addEventListener(
        "keydown",
        (event) => {
          if (event.ctrlKey || event.metaKey || event.altKey) return;
          let targetRow = rowIndex;
          let targetStep = step;
          if (event.key === "ArrowRight") targetStep = (step + 1) % STEPS;
          else if (event.key === "ArrowLeft")
            targetStep = (step + STEPS - 1) % STEPS;
          else if (event.key === "ArrowDown")
            targetRow = (rowIndex + 1) % VOICES.length;
          else if (event.key === "ArrowUp")
            targetRow = (rowIndex + VOICES.length - 1) % VOICES.length;
          else if (event.key === "Home") targetStep = 0;
          else if (event.key === "End") targetStep = STEPS - 1;
          else return;
          event.preventDefault();
          buttons[targetRow][targetStep].focus();
        },
        { signal },
      );
      buttons[rowIndex].push(button);
      cells.append(button);
    }
    row.append(label, cells);
    grid.append(row);
  });

  function showError(message = "") {
    error.textContent = message;
    error.hidden = !message;
  }

  function markChanged(
    message = "Pattern changed. Save to keep your changes on this device.",
  ) {
    if (!storageBlocked) status.textContent = message;
  }

  function renderPattern() {
    buttons.forEach((row, voice) =>
      row.forEach((button, step) =>
        button.setAttribute("aria-pressed", String(beat.pattern[voice][step])),
      ),
    );
    const hits = beat.pattern.flat().filter(Boolean).length;
    count.textContent = hits ? `${hits} active steps` : "Empty pattern";
    undo.disabled = undoPattern === null;
  }

  function setPlayhead(step: number) {
    if (currentStep >= 0)
      buttons.forEach((row) => row[currentStep].classList.remove("is-current"));
    currentStep = step;
    if (step >= 0 && !reducedMotion.matches)
      buttons.forEach((row) => row[step].classList.add("is-current"));
  }

  function available() {
    return (
      !disposed && !document.hidden && !root.hidden && !windowElement?.hidden
    );
  }

  function releaseSound(sound: Sound) {
    sound.source.onended = null;
    sound.nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        /* Already released by the browser. */
      }
    });
    sounds.delete(sound);
  }

  function stopPlayback(message = "Stopped") {
    generation++;
    playing = false;
    starting = false;
    root.dataset.playing = "false";
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    visuals.forEach((timeout) => clearTimeout(timeout));
    visuals.clear();
    sounds.forEach((sound) => {
      try {
        sound.source.stop();
      } catch {
        /* The note may already have ended. */
      }
      releaseSound(sound);
    });
    master?.disconnect();
    master = null;
    noise = null;
    const previousContext = context;
    context = null;
    if (previousContext && previousContext.state !== "closed")
      void previousContext.close().catch(() => {});
    setPlayhead(-1);
    play.disabled = false;
    play.textContent = "▶ Play";
    stop.disabled = true;
    transport.textContent = message;
  }

  function note(
    source: AudioScheduledSourceNode,
    nodes: AudioNode[],
    start: number,
    duration: number,
  ) {
    const sound: Sound = { source, nodes: [source, ...nodes] };
    sounds.add(sound);
    source.onended = () => releaseSound(sound);
    source.start(start);
    source.stop(start + duration);
  }

  function trigger(voice: number, time: number) {
    if (!context || !master || !noise) return;
    const gain = context.createGain();
    if (voice === 0) {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(145, time);
      oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.15);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.8, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
      oscillator.connect(gain);
      gain.connect(master);
      note(oscillator, [gain], time, 0.26);
    } else {
      const source = context.createBufferSource();
      source.buffer = noise;
      const filter = context.createBiquadFilter();
      filter.type = voice === 1 ? "bandpass" : "highpass";
      filter.frequency.setValueAtTime(voice === 1 ? 1600 : 7000, time);
      filter.Q.setValueAtTime(voice === 1 ? 0.65 : 0.7, time);
      const duration = voice === 1 ? 0.16 : 0.055;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(voice === 1 ? 0.6 : 0.19, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      note(source, [filter, gain], time, duration + 0.01);
    }
  }

  function schedule() {
    if (!playing || !context) return;
    if (!available()) {
      stopPlayback("Stopped while hidden · press Play to resume");
      return;
    }
    const now = context.currentTime;
    const stepDuration = 60 / beat.tempo / 2;
    // Keep the bar on the audio clock after a delayed task. Replaying the next
    // stale step at "now" would shift the whole pattern every time a task stalls.
    if (nextStepTime < now) {
      const missedSteps = Math.ceil((now - nextStepTime) / stepDuration);
      nextStepTime += missedSteps * stepDuration;
      nextStep = (nextStep + missedSteps) % STEPS;
      visuals.forEach((timeout) => clearTimeout(timeout));
      visuals.clear();
      setPlayhead(-1);
    }
    try {
      while (nextStepTime < now + 0.1) {
        const step = nextStep;
        beat.pattern.forEach((row, voice) => {
          if (row[step]) trigger(voice, nextStepTime);
        });
        if (!reducedMotion.matches) {
          const timeout = setTimeout(
            () => {
              visuals.delete(timeout);
              if (playing && available()) setPlayhead(step);
            },
            Math.max(0, (nextStepTime - context.currentTime) * 1000),
          );
          visuals.add(timeout);
        }
        nextStepTime += stepDuration;
        nextStep = (nextStep + 1) % STEPS;
      }
    } catch {
      stopPlayback();
      showError(
        "Audio could not play. Try Play again in a browser with Web Audio support.",
      );
    }
  }

  function readTempo() {
    const value = Number(tempo.value);
    if (!Number.isInteger(value) || value < 40 || value > 200) {
      tempo.setAttribute("aria-invalid", "true");
      showError("Enter a whole-number tempo from 40 to 200 BPM.");
      return false;
    }
    tempo.removeAttribute("aria-invalid");
    showError();
    if (value !== beat.tempo) {
      beat.tempo = value;
      markChanged();
    }
    return true;
  }

  play.addEventListener(
    "click",
    async () => {
      if (playing || starting || !available() || !readTempo()) return;
      const AudioContextConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextConstructor) {
        showError(
          "This browser does not support Web Audio. You can still edit and save a pattern.",
        );
        return;
      }
      const attempt = ++generation;
      starting = true;
      play.disabled = true;
      play.textContent = "Starting…";
      stop.disabled = false;
      transport.textContent = "Starting audio…";
      try {
        // The context is created only inside the explicit Play gesture.
        const created = new AudioContextConstructor();
        context = created;
        await created.resume();
        if (disposed || attempt !== generation || context !== created) return;
        if (!available()) {
          stopPlayback("Stopped while hidden · press Play to resume");
          return;
        }
        master = created.createGain();
        master.gain.setValueAtTime(
          (beat.volume / 100) * 0.7,
          created.currentTime,
        );
        master.connect(created.destination);
        noise = created.createBuffer(1, created.sampleRate, created.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++)
          samples[i] = Math.random() * 2 - 1;
        starting = false;
        playing = true;
        root.dataset.playing = "true";
        play.textContent = "▶ Playing";
        transport.textContent = "Playing";
        nextStep = 0;
        nextStepTime = created.currentTime + 0.025;
        schedule();
        if (playing) timer = setInterval(schedule, 25);
      } catch {
        if (attempt !== generation || disposed) return;
        stopPlayback();
        showError("Audio could not start. Press Play to try again.");
      }
    },
    { signal },
  );
  stop.addEventListener("click", () => stopPlayback(), { signal });
  tempo.addEventListener("change", readTempo, { signal });
  volume.addEventListener(
    "input",
    () => {
      beat.volume = Math.round(Number(volume.value));
      volumeValue.value = `${beat.volume}%`;
      if (context && master)
        master.gain.setTargetAtTime(
          (beat.volume / 100) * 0.7,
          context.currentTime,
          0.015,
        );
      markChanged();
    },
    { signal },
  );
  find<HTMLButtonElement>("[data-sequencer-clear]").addEventListener(
    "click",
    () => {
      undoPattern = copyPattern(beat.pattern);
      beat.pattern = VOICES.map(() => Array<boolean>(STEPS).fill(false));
      markChanged(
        "Pattern cleared. Undo change restores it; Save pattern keeps the empty pattern.",
      );
      renderPattern();
    },
    { signal },
  );
  find<HTMLButtonElement>("[data-sequencer-load]").addEventListener(
    "click",
    () => {
      const preset = find<HTMLSelectElement>("[data-sequencer-preset]").value;
      if (!PRESETS[preset]) return;
      undoPattern = copyPattern(beat.pattern);
      beat.pattern = copyPattern(PRESETS[preset]);
      markChanged("Preset loaded. Undo change restores your previous pattern.");
      renderPattern();
    },
    { signal },
  );
  undo.addEventListener(
    "click",
    () => {
      if (!undoPattern) return;
      beat.pattern = undoPattern;
      undoPattern = null;
      markChanged("Previous pattern restored. Save to keep it on this device.");
      renderPattern();
    },
    { signal },
  );
  save.addEventListener(
    "click",
    () => {
      if (storageBlocked || !readTempo()) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(beat));
        status.textContent = "Pattern saved on this device.";
      } catch {
        status.textContent =
          "Could not save on this device. Your pattern is still available in this window.";
      }
    },
    { signal },
  );
  const visibilityChanged = () => {
    if ((playing || starting) && !available())
      stopPlayback("Stopped while hidden · press Play to resume");
  };
  const observer = new MutationObserver(visibilityChanged);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (windowElement)
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  document.addEventListener("visibilitychange", visibilityChanged, { signal });
  reducedMotion.addEventListener(
    "change",
    () => {
      if (reducedMotion.matches) setPlayhead(-1);
    },
    { signal },
  );
  renderPattern();
  return () => {
    disposed = true;
    stopPlayback();
    controller.abort();
    observer.disconnect();
  };
}
