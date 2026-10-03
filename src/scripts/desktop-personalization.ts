import { CUSTOMIZATION_EVENT, getCustomization } from "./desktop-customization";
import { wallpapers } from "./desktop-wallpapers";
import css from "../styles/desktop-personalization.css?inline";

export function mountPersonalization(desktop: HTMLElement) {
  const style = document.createElement("style");
  style.id = "desktop-personalization-style";
  style.textContent = css;
  document.head.append(style);
  let cycle: ReturnType<typeof setInterval> | undefined;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let saverLoading = false,
    asleep = false;
  let lastActivity = Date.now();
  let currentWallpaper = "";
  const controller = new AbortController(),
    { signal } = controller;
  function wallpaper(id: string) {
    const scene = wallpapers.find(([key]) => key === id)!;
    desktop.dataset.customWallpaper = id;
    desktop.dataset.wallpaperAnimation = scene[3] ?? "none";
    if (id === "original") desktop.style.removeProperty("--custom-wallpaper");
    else desktop.style.setProperty("--custom-wallpaper", scene[2]);
  }
  function apply() {
    const p = getCustomization().value;
    desktop.dataset.toastSeconds = String(p.toastSeconds);
    for (const [key, value] of Object.entries({
      "content-scale": p.contentScale / 100,
      "dock-size": `${p.dockSize}px`,
      "title-size": `${p.titleSize}px`,
      "corner-radius": `${p.cornerRadius}px`,
      "wallpaper-brightness": p.brightness / 100,
      "wallpaper-blur": `${p.wallpaperBlur}px`,
      "wallpaper-speed": `${p.motionSpeed}s`,
      "icon-size": `${p.iconSize}px`,
    }))
      desktop.style.setProperty(`--custom-${key}`, String(value));
    const icons = desktop.querySelector<HTMLElement>(".desktop-shortcuts")!;
    icons
      .querySelectorAll<HTMLButtonElement>("[data-desktop-icon]")
      .forEach((button) => {
        if (!button.hasAttribute("aria-label"))
          button.setAttribute("aria-label", button.textContent!.trim());
      });
    const changed = desktop.dataset.iconSize !== String(p.iconSize);
    desktop.dataset.iconSize = String(p.iconSize);
    // Numeric pixel tokens are also read by the icon placement engine.
    for (const [key, value] of Object.entries({
      width: p.iconSize + 44,
      height: p.iconSize + 38,
      "step-x": p.iconSize + 60,
      "step-y": p.iconSize + 54,
    })) {
      if (p.iconSize === 48)
        icons.style.removeProperty(`--desktop-icon-${key}`);
      else icons.style.setProperty(`--desktop-icon-${key}`, `${value}px`);
    }
    if (changed) document.dispatchEvent(new Event("desktop-icons-reflow"));
    for (const [key, value] of Object.entries({
      branding: p.showBranding,
      "icon-labels": p.showIconLabels,
      date: p.showDate,
      shadows: p.windowShadows,
      "wallpaper-motion": p.animateWallpaper,
    }))
      desktop.setAttribute(`data-custom-${key}`, String(value));
    if (currentWallpaper !== p.wallpaper) {
      currentWallpaper = p.wallpaper;
      wallpaper(p.wallpaper);
    }
    clearInterval(cycle);
    if (p.wallpaperCycle)
      cycle = setInterval(() => {
        if (document.hidden || asleep) return;
        const index = wallpapers.findIndex(
          ([id]) => id === desktop.dataset.customWallpaper,
        );
        wallpaper(wallpapers[(index + 1) % wallpapers.length][0]);
      }, p.wallpaperCycle * 60_000);
    scheduleIdle();
  }
  function scheduleIdle() {
    clearTimeout(idle);
    const minutes = getCustomization().value.idleMinutes;
    if (!minutes || asleep || document.hidden) return;
    idle = setTimeout(
      () => {
        // Playing media is activity; do not cover a film or audio controls.
        if (
          [...desktop.querySelectorAll<HTMLMediaElement>("video,audio")].some(
            (media) => !media.paused && !media.ended,
          )
        ) {
          lastActivity = Date.now();
          scheduleIdle();
          return;
        }
        void sleep(true);
      },
      Math.max(100, minutes * 60_000 - (Date.now() - lastActivity)),
    );
  }
  function activity() {
    if (asleep) return;
    lastActivity = Date.now();
    scheduleIdle();
  }
  async function sleep(automatic = false) {
    const idleSince = lastActivity;
    if (asleep || saverLoading || document.hidden) return;
    saverLoading = true;
    try {
      const { showScreensaver } = await import("./desktop-screensaver");
      if (
        signal.aborted ||
        document.hidden ||
        (automatic &&
          (lastActivity !== idleSince || !getCustomization().value.idleMinutes))
      )
        return;
      asleep = true;
      clearTimeout(idle);
      desktop.dataset.sleeping = "true";
      showScreensaver(desktop, () => {
        asleep = false;
        delete desktop.dataset.sleeping;
        activity();
      });
    } catch {
      document.dispatchEvent(
        new CustomEvent("desktop-notify", {
          detail: {
            message: "The screensaver could not load. Try again.",
            kind: "system",
          },
        }),
      );
      activity();
    } finally {
      saverLoading = false;
    }
  }
  const activityEvents = [
    "pointerdown",
    "pointermove",
    "keydown",
    "wheel",
    "touchstart",
  ];
  const frameDocs = new WeakSet<Document>();
  function watchDocument(doc: Document) {
    if (frameDocs.has(doc)) return;
    frameDocs.add(doc);
    activityEvents.forEach((type) =>
      doc.addEventListener(type, activity, {
        passive: true,
        capture: true,
        signal,
      }),
    );
  }
  watchDocument(document);
  function watchFrame(frame: HTMLIFrameElement) {
    const connect = () => {
      try {
        if (frame.contentDocument) watchDocument(frame.contentDocument);
      } catch {
        /* Cross-origin frames cannot expose activity. */
      }
    };
    frame.addEventListener("load", connect, { signal });
    connect();
  }
  const frames = new WeakSet<HTMLIFrameElement>();
  const scanFrames = () =>
    desktop.querySelectorAll("iframe").forEach((frame) => {
      if (!frames.has(frame)) {
        frames.add(frame);
        watchFrame(frame);
      }
    });
  const observer = new MutationObserver(scanFrames);
  observer.observe(desktop, { childList: true, subtree: true });
  scanFrames();
  document.addEventListener(CUSTOMIZATION_EVENT, apply, { signal });
  document.addEventListener("desktop-sleep", () => void sleep(), { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      desktop.dataset.pageHidden = String(document.hidden);
      activity();
    },
    { signal },
  );
  apply();
  return () => {
    controller.abort();
    observer.disconnect();
    clearInterval(cycle);
    clearTimeout(idle);
  };
}
