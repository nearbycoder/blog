import css from "../styles/desktop-apps.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("apps", css);
import type { DesktopAppId } from "../lib/desktop-apps";

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
    case "tasks":
      return (await import("./desktop-tasks")).mountApp;
    case "markdown":
      return (await import("./desktop-markdown")).mountApp;
    case "json":
      return (await import("./desktop-json")).mountApp;
    case "converter":
      return (await import("./desktop-converter")).mountApp;
    case "worldclock":
      return (await import("./desktop-worldclock")).mountApp;
    case "colors":
      return (await import("./desktop-colors")).mountApp;
    case "pixel":
      return (await import("./desktop-pixel")).mountApp;
    case "sequencer":
      return (await import("./desktop-sequencer")).mountApp;
    case "soundscape":
      return (await import("./desktop-soundscape")).mountApp;
    case "dice":
      return (await import("./desktop-dice")).mountApp;
    case "sudoku":
      return (await import("./desktop-sudoku")).mountApp;
    case "connect":
      return (await import("./desktop-connect")).mountApp;
    case "reversi":
      return (await import("./desktop-reversi")).mountApp;
    case "wordsearch":
      return (await import("./desktop-wordsearch")).mountApp;
    case "typing":
      return (await import("./desktop-typing")).mountApp;
    case "life":
      return (await import("./desktop-life")).mountApp;
    case "spirograph":
      return (await import("./desktop-spirograph")).mountApp;
    case "stopwatch":
      return (await import("./desktop-stopwatch")).mountApp;
    case "texttools":
      return (await import("./desktop-texttools")).mountApp;
    case "decision":
      return (await import("./desktop-decision")).mountApp;
    default: {
      const unhandled: never = id;
      throw new Error(`Unknown desktop application: ${unhandled}`);
    }
  }
}
