import { localState } from "./desktop-local-state";

export const CUSTOMIZATION_KEY = "desktop-customization:v1";
export const CUSTOMIZATION_EVENT = "desktop-customization-changed";
export const wallpaperIds = [
  "original",
  "midnight",
  "charcoal",
  "porcelain",
  "forest",
  "ocean",
  "clay",
  "lavender",
  "sunrise",
  "dusk",
  "lagoon",
  "desert",
  "alpine",
  "rose",
  "ink",
  "citrus",
  "blueprint",
  "dots",
  "checker",
  "stripes",
  "contours",
  "stars",
  "aurora",
  "tides",
  "embers",
  "clouds",
  "prism",
  "orbit",
  "rain",
  "bloom",
] as const;
export const customizationDefaults = () => ({
  version: 1 as const,
  contentScale: 100,
  iconSize: 48,
  dockSize: 56,
  titleSize: 42,
  cornerRadius: 8,
  windowSize: 70,
  useDefaultWindowSize: true,
  wallpaper: "original" as (typeof wallpaperIds)[number],
  brightness: 100,
  wallpaperBlur: 0,
  motionSpeed: 30,
  animateWallpaper: true,
  wallpaperCycle: 0,
  showBranding: true,
  showIconLabels: true,
  showDate: true,
  clockSeconds: false,
  clock12: false,
  windowShadows: true,
  idleMinutes: 0,
  saver: "clock" as "clock" | "aurora" | "stars" | "drift" | "blank",
  saverClock: true,
  saverDate: true,
  saverMessage: "Take a little time.",
  saverColor: "mint" as "mint" | "blue" | "rose" | "amber" | "white",
  saverSpeed: 40,
  saverBrightness: 70,
  wakeOnMove: false,
  toastSeconds: 8,
});
export type Customization = ReturnType<typeof customizationDefaults>;
const ranges: Partial<Record<keyof Customization, [number, number]>> = {
  contentScale: [60, 200],
  iconSize: [24, 112],
  dockSize: [44, 100],
  titleSize: [32, 72],
  cornerRadius: [0, 24],
  windowSize: [30, 100],
  brightness: [20, 140],
  wallpaperBlur: [0, 20],
  motionSpeed: [10, 120],
  wallpaperCycle: [0, 60],
  idleMinutes: [0, 120],
  saverSpeed: [10, 120],
  saverBrightness: [20, 100],
  toastSeconds: [3, 30],
};
export function validCustomization(value: unknown): value is Customization {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>,
    defaults = customizationDefaults();
  if (Object.keys(item).length !== Object.keys(defaults).length) return false;
  return Object.entries(defaults).every(([key, fallback]) => {
    const v = item[key],
      range = ranges[key as keyof Customization];
    if (range)
      return (
        Number.isInteger(v) && Number(v) >= range[0] && Number(v) <= range[1]
      );
    if (typeof fallback === "boolean") return typeof v === "boolean";
    if (key === "version") return v === 1;
    if (key === "wallpaper") return wallpaperIds.includes(v as never);
    if (key === "saver")
      return ["clock", "aurora", "stars", "drift", "blank"].includes(
        v as string,
      );
    if (key === "saverColor")
      return ["mint", "blue", "rose", "amber", "white"].includes(v as string);
    return key === "saverMessage" && typeof v === "string" && v.length <= 120;
  });
}
let store: ReturnType<typeof localState<Customization>> | undefined;
export const getCustomization = () =>
  (store ??= localState(
    CUSTOMIZATION_KEY,
    customizationDefaults(),
    validCustomization,
    4096,
  ));
export function saveCustomization(patch: Partial<Customization>) {
  const saved = getCustomization().save({
    ...getCustomization().value,
    ...patch,
  });
  document.dispatchEvent(new Event(CUSTOMIZATION_EVENT));
  return saved;
}
