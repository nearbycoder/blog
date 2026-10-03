---
title: "Haskellite"
summary: "Private desktop dictation in Haskell, with local NVIDIA Parakeet transcription and a global shortcut."
role: "Creator"
year: "2026"
createdAt: "2026-07-17"
stack: ["Haskell", "SDL2", "Dear ImGui", "NVIDIA Parakeet", "ONNX Runtime"]
githubLink: "https://github.com/nearbycoder/Haskellite"
featured: false
accent: "cyan"
draft: false
image: "/images/projects/haskellite.webp"
imageAlt: "Haskellite desktop dictation workspace with Dictate, History, and Settings tabs, an input meter, and a transcript editor."
imageCaption: "Full dictation workspace screenshot from the Haskellite repository."
---

Haskellite is a private desktop voice-to-text app written in Haskell for Linux and macOS. A global shortcut starts dictation from the application you are already using. Speak, finish the phrase, and Haskellite transcribes locally with NVIDIA Parakeet before returning the text to the focused field.

After the initial model and runtime installation, transcription does not require an account, cloud API, Python process, or network connection. The application sends no telemetry and uploads no audio.

## Dictation that stays in the background

Haskellite can live in the system tray and show a compact listening overlay without taking focus away from the active application. Shortcuts are configurable, with both toggle and hold-to-talk modes. Toggle mode can stop after trailing silence; hold-to-talk finishes when the key combination is released.

![Haskellite's compact overlay with a Listening status, Finish button, and input-level bar.](/images/projects/haskellite-overlay.webp)

_The compact listening overlay keeps the main workspace out of the way._

The full workspace adds microphone selection, a live level meter, an editable transcript, clipboard copy, and timestamped text export. Dictation history preserves individual activations so earlier text can be recovered or copied again.

Text delivery uses the clipboard and focused-field paste on macOS and X11. If a Wayland compositor does not permit synthetic paste, the transcript remains available on the clipboard and in history.

## Haskell around a local speech runtime

The handwritten application and bindings use Haskell, with SDL2 and Dear ImGui for the native interface. Haskell handles microphone capture, voice-activity segmentation, and transcript state. Separate threads communicate through bounded STM queues so recognition does not block the interface or allow capture queues to grow indefinitely.

Inference runs through sherpa-onnx and ONNX Runtime, reached through Haskell's foreign-function interface. Three checksum-pinned Parakeet choices balance language coverage and model size. The first-run installer downloads and verifies the selected files.

Linux and macOS are built in CI; Windows support is paused. [The repository](https://github.com/nearbycoder/Haskellite) includes build and packaging instructions, command-line diagnostics, WAV transcription, and separate licensing details for models and native dependencies. Its [GitHub creation date](https://api.github.com/repos/nearbycoder/Haskellite) is July 17, 2026 (UTC).
