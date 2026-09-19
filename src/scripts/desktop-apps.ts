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
  }
}
