import css from "../styles/desktop-apps.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("apps", css);
import type { DesktopAppId } from "../lib/desktop-apps";

// Functions keep every application download behind a launch action.
const apps = {
  tasks: () => import("./desktop-tasks"),
  markdown: () => import("./desktop-markdown"),
  json: () => import("./desktop-json"),
  converter: () => import("./desktop-converter"),
  worldclock: () => import("./desktop-worldclock"),
  colors: () => import("./desktop-colors"),
  pixel: () => import("./desktop-pixel"),
  sequencer: () => import("./desktop-sequencer"),
  soundscape: () => import("./desktop-soundscape"),
  dice: () => import("./desktop-dice"),
  sudoku: () => import("./desktop-sudoku"),
  connect: () => import("./desktop-connect"),
  reversi: () => import("./desktop-reversi"),
  wordsearch: () => import("./desktop-wordsearch"),
  typing: () => import("./desktop-typing"),
  life: () => import("./desktop-life"),
  spirograph: () => import("./desktop-spirograph"),
  stopwatch: () => import("./desktop-stopwatch"),
  texttools: () => import("./desktop-texttools"),
  decision: () => import("./desktop-decision"),
  settings: () => import("./desktop-settings"),
  windows: () => import("./desktop-windows"),
  workspaces: () => import("./desktop-workspaces"),
  activity: () => import("./desktop-activity"),
  backup: () => import("./desktop-backup"),
  agenda: () => import("./desktop-agenda"),
} satisfies Record<
  Exclude<DesktopAppId, "notes" | "calculator" | "sketchpad" | "focus">,
  () => Promise<{ mountApp: (root: HTMLElement) => (() => void) | undefined }>
>;

/** Returning the mount function lets the host recheck disposal after downloading. */
export async function loadDesktopApp(id: DesktopAppId) {
  switch (id) {
    case "notes":
      return (await import("./desktop-notes")).mountNotes;
    case "calculator":
      return (await import("./desktop-calculator")).mountCalculator;
    case "sketchpad":
      return (await import("./desktop-sketchpad")).mountSketchpad;
    case "focus":
      return (await import("./desktop-focus")).mountFocus;
    default:
      if (!Object.hasOwn(apps, id))
        throw new Error(`Unknown desktop application: ${id}`);
      return (await apps[id]()).mountApp;
  }
}
