import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
import { getDesktopHost } from "./desktop-host";
import {
  ACTIVITY_CHANGED,
  getActivityStore,
  updateActivity,
  kinds,
  record,
  type ActivityEntry,
  type ActivityKind,
} from "./desktop-activity-service";

const appIds = new Set<string>(desktopApps.map((app) => app.id));

/** Mount shell notifications and launcher shortcuts; the activity app stays lazy. */
export function mountDesktopActivity(desktop: HTMLElement) {
  const styleId = "desktop-activity-service-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
    [data-desktop] .desktop-quick-heading{display:flex;align-items:center;justify-content:space-between;padding:0 20px;margin:14px 0 6px;gap:8px;font-size:11px;color:var(--desk-muted)}
    [data-desktop] .desktop-quick-heading button{font-size:11px;min-height:32px;padding:4px 8px;color:var(--desk-accent);border-radius:4px}
    [data-desktop] .desktop-quick-list{display:flex;flex-wrap:wrap;gap:5px;padding:0 20px}
    [data-desktop] .desktop-quick-list button{background:var(--desk-hover);border:1px solid var(--desk-line);border-radius:5px;padding:7px 9px;min-height:36px;font-size:12px}
    [data-desktop] .desktop-quick-list button:hover{background:var(--desk-selected)}
    [data-desktop] .desktop-quick-empty{margin:0;color:var(--desk-muted);font-size:12px}
    [data-desktop] .desktop-notification{position:absolute;right:16px;bottom:80px;z-index:12000;width:min(340px,calc(100% - 32px));padding:14px 16px;background:var(--desk-paper);border:1px solid var(--desk-line);border-radius:10px;box-shadow:0 8px 30px var(--desk-shadow);display:flex;gap:12px;align-items:flex-start;pointer-events:none}
    [data-desktop] .desktop-notification p{margin:0;overflow-wrap:anywhere;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    [data-desktop] .desktop-notification small{display:block;color:var(--desk-muted);margin-bottom:4px;font-size:11px}
    [data-desktop] .desktop-notification button{min-width:32px;min-height:32px;flex-shrink:0;border-radius:5px;background:var(--desk-hover);font-size:20px;pointer-events:auto}
    [data-desktop] [data-activity-unread]:not([hidden]){display:inline-grid;place-items:center;min-width:16px;height:16px;border-radius:10px;padding:0 4px;background:var(--desk-accent);color:var(--desk-paper);font-size:10px;font-weight:700}
    @media(max-width:760px),(pointer:coarse){[data-desktop] :is(.desktop-quick-heading,.desktop-quick-list,.desktop-notification) button{min-height:44px;min-width:44px}}
  `;
    document.head.append(style);
  }
  const quick = document.createElement("div");
  quick.dataset.desktopQuickApps = "";
  desktop.querySelector("[data-launcher-default]")?.prepend(quick);
  const announcer = document.createElement("span");
  announcer.className = "sr-only";
  announcer.setAttribute("role", "status");
  announcer.setAttribute("aria-live", "polite");
  announcer.dataset.reminderAnnouncement = "";
  desktop.append(announcer);
  let quickSignature = "";
  let toast: HTMLElement | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let returnFocus: HTMLElement | undefined;
  function hideToast() {
    const focused = toast?.contains(document.activeElement);
    if (timer) clearTimeout(timer);
    timer = undefined;
    toast?.remove();
    toast = undefined;
    if (
      focused &&
      returnFocus?.isConnected &&
      returnFocus.getClientRects().length
    )
      returnFocus.focus();
  }
  function draw() {
    const state = getActivityStore().value;
    const unread = state.history.filter((entry) => !entry.read).length;
    desktop
      .querySelectorAll<HTMLElement>("[data-activity-unread]")
      .forEach((badge) => {
        badge.hidden = unread === 0;
        badge.textContent = unread > 99 ? "99+" : String(unread);
        badge.setAttribute("aria-label", `${unread} unread notifications`);
      });
    desktop
      .querySelector('[data-open-app="activity"]')
      ?.setAttribute(
        "aria-label",
        unread
          ? `Open Activity: ${unread > 99 ? "99+" : unread} unread notifications`
          : "Open Activity",
      );
    desktop.dataset.doNotDisturb = String(state.dnd);
    if (state.dnd) hideToast();
    const signature = JSON.stringify([state.favorites, state.recent]);
    if (signature === quickSignature) return;
    quickSignature = signature;
    quick.replaceChildren();
    for (const [heading, ids] of [
      ["Favorites", state.favorites],
      ["Recent apps", state.recent],
    ] as const) {
      const section = document.createElement("section");
      section.setAttribute("aria-label", heading);
      section.dataset.quickSection =
        heading === "Favorites" ? "favorites" : "recent";
      const label = document.createElement("div");
      label.className = "desktop-quick-heading";
      const title = document.createElement("span");
      title.textContent = heading;
      label.append(title);
      const manage = document.createElement("button");
      manage.type = "button";
      manage.textContent = heading === "Favorites" ? "Edit" : "Clear";
      manage.setAttribute(
        "aria-label",
        heading === "Favorites"
          ? "Edit launcher favorites"
          : "Clear recent apps",
      );
      if (heading === "Favorites") manage.dataset.quickApp = "activity";
      else {
        manage.dataset.quickClear = "";
        manage.disabled = ids.length === 0;
      }
      label.append(manage);
      const list = document.createElement("div");
      list.className = "desktop-quick-list";
      for (const id of ids) {
        const app = desktopApps.find((candidate) => candidate.id === id)!;
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.quickApp = id;
        button.textContent = app.title;
        list.append(button);
      }
      if (!ids.length) {
        const empty = document.createElement("p");
        empty.className = "desktop-quick-empty";
        empty.textContent =
          heading === "Favorites"
            ? "Pin apps in Activity for quick access."
            : "Apps you open will appear here.";
        list.append(empty);
      }
      section.append(label, list);
      quick.append(section);
    }
  }
  function launch(event: Event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("button");
    if (!button) return;
    if (button.hasAttribute("data-quick-clear")) {
      updateActivity({ recent: [] });
      quick.querySelector<HTMLButtonElement>("[data-quick-app]")?.focus();
    } else if (appIds.has(button.dataset.quickApp ?? "")) {
      getDesktopHost()?.openApp(button.dataset.quickApp as DesktopAppId);
    }
  }
  function launched(event: Event) {
    const detail: unknown = (event as CustomEvent).detail;
    if (
      !record(detail) ||
      typeof detail.id !== "string" ||
      !appIds.has(detail.id)
    )
      return;
    const id = detail.id as DesktopAppId;
    updateActivity({
      recent: [
        id,
        ...getActivityStore().value.recent.filter((item) => item !== id),
      ].slice(0, 8),
    });
  }
  function notify(event: Event) {
    const detail: unknown = (event as CustomEvent).detail;
    if (
      !record(detail) ||
      typeof detail.message !== "string" ||
      !detail.message.trim() ||
      typeof detail.kind !== "string" ||
      !kinds.has(detail.kind)
    )
      return;
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      message: detail.message.trim().slice(0, 500),
      kind: detail.kind as ActivityKind,
      createdAt: Date.now(),
      read: false,
    };
    updateActivity({
      history: [entry, ...getActivityStore().value.history].slice(0, 100),
    });
    if (getActivityStore().value.dnd) return;
    hideToast();
    returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    toast = document.createElement("aside");
    toast.className = "desktop-notification";
    toast.setAttribute("aria-label", "Desktop notification");
    const text = document.createElement("p");
    const kind = document.createElement("small");
    kind.textContent =
      entry.kind === "reminder" ? "Reminder" : "Desktop activity";
    text.append(kind, document.createTextNode(entry.message));
    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.textContent = "×";
    dismiss.setAttribute("aria-label", "Dismiss notification");
    dismiss.addEventListener("click", hideToast, { once: true });
    dismiss.addEventListener("focus", () => clearTimeout(timer));
    dismiss.addEventListener("blur", () => {
      if (dismiss.isConnected)
        timer = setTimeout(
          hideToast,
          Number(desktop.dataset.toastSeconds ?? 8) * 1000,
        );
    });
    toast.append(text, dismiss);
    desktop.append(toast);
    // Shell app/system messages already have a live announcement. Only reminders use this region.
    if (entry.kind === "reminder") announcer.textContent = entry.message;
    timer = setTimeout(
      hideToast,
      Number(desktop.dataset.toastSeconds ?? 8) * 1000,
    );
  }
  quick.addEventListener("click", launch);
  document.addEventListener(ACTIVITY_CHANGED, draw);
  document.addEventListener("desktop-app-launched", launched);
  document.addEventListener("desktop-notify", notify);
  draw();
  return () => {
    hideToast();
    quick.removeEventListener("click", launch);
    document.removeEventListener(ACTIVITY_CHANGED, draw);
    document.removeEventListener("desktop-app-launched", launched);
    document.removeEventListener("desktop-notify", notify);
    quick.remove();
    announcer.remove();
  };
}
