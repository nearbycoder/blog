import { localState } from "./desktop-local-state";

export const DESKTOP_PREFERENCES_KEY = "nearby-desktop-preferences-v1";

export type DesktopPreferences = {
  version: 1;
  accent: "emerald" | "blue" | "violet" | "amber";
  wallpaper: "glass" | "plain" | "grid";
  density: "comfortable" | "compact";
  textSize: "standard" | "large";
  reduceMotion: boolean;
  reduceTransparency: boolean;
  showShortcuts: boolean;
};

export const defaultDesktopPreferences = (): DesktopPreferences => ({
  version: 1,
  accent: "emerald",
  wallpaper: "glass",
  density: "comfortable",
  textSize: "standard",
  reduceMotion: false,
  reduceTransparency: false,
  showShortcuts: true,
});

export function validDesktopPreferences(
  value: unknown,
): value is DesktopPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return (
    data.version === 1 &&
    Object.keys(data).length === 8 &&
    ["emerald", "blue", "violet", "amber"].includes(data.accent as string) &&
    ["glass", "plain", "grid"].includes(data.wallpaper as string) &&
    ["comfortable", "compact"].includes(data.density as string) &&
    ["standard", "large"].includes(data.textSize as string) &&
    typeof data.reduceMotion === "boolean" &&
    typeof data.reduceTransparency === "boolean" &&
    typeof data.showShortcuts === "boolean"
  );
}

let store: ReturnType<typeof localState<DesktopPreferences>> | undefined;
export function getDesktopPreferencesStore() {
  return (store ??= localState(
    DESKTOP_PREFERENCES_KEY,
    defaultDesktopPreferences(),
    validDesktopPreferences,
    2048,
  ));
}

/** Keep startup independent of the lazy Settings interface. */
export function applyDesktopPreferences(desktop: HTMLElement) {
  const value = getDesktopPreferencesStore().value;
  desktop.dataset.desktopAccent = value.accent;
  desktop.dataset.desktopWallpaper = value.wallpaper;
  desktop.dataset.desktopDensity = value.density;
  desktop.dataset.desktopText = value.textSize;
  desktop.dataset.desktopReduceMotion = String(value.reduceMotion);
  desktop.dataset.desktopReduceTransparency = String(value.reduceTransparency);
  desktop.dataset.desktopShortcuts = value.showShortcuts ? "show" : "hide";
}
