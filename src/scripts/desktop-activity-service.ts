import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
import { getDesktopHost } from "./desktop-host";
import { localState } from "./desktop-local-state";

export const ACTIVITY_KEY = "nearby-desktop-activity-v1";
export const ACTIVITY_CHANGED = "desktop-activity-changed";
export type ActivityKind = "app" | "system" | "reminder";
export type ActivityEntry = {
  id: string;
  message: string;
  kind: ActivityKind;
  createdAt: number;
  read: boolean;
};
export type ActivityState = {
  version: 1;
  history: ActivityEntry[];
  dnd: boolean;
  favorites: DesktopAppId[];
  recent: DesktopAppId[];
};
const appIds = new Set<string>(desktopApps.map((app) => app.id));
const kinds = new Set(["app", "system", "reminder"]);
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const keys = (value: Record<string, unknown>, fields: string[]) =>
  Object.keys(value).length === fields.length &&
  Object.keys(value).every((key) => fields.includes(key));
const validApps = (value: unknown): value is DesktopAppId[] =>
  Array.isArray(value) &&
  value.length <= 8 &&
  value.every((id) => typeof id === "string" && appIds.has(id)) &&
  new Set(value).size === value.length;

export function validActivity(value: unknown): value is ActivityState {
  if (
    !record(value) ||
    !keys(value, ["version", "history", "dnd", "favorites", "recent"]) ||
    value.version !== 1 ||
    typeof value.dnd !== "boolean" ||
    !validApps(value.favorites) ||
    !validApps(value.recent) ||
    !Array.isArray(value.history) ||
    value.history.length > 100
  )
    return false;
  const ids = new Set<string>();
  for (const item of value.history) {
    if (
      !record(item) ||
      !keys(item, ["id", "message", "kind", "createdAt", "read"]) ||
      typeof item.id !== "string" ||
      !item.id ||
      item.id.length > 80 ||
      ids.has(item.id) ||
      typeof item.message !== "string" ||
      !item.message.trim() ||
      item.message.length > 500 ||
      typeof item.kind !== "string" ||
      !kinds.has(item.kind) ||
      typeof item.createdAt !== "number" ||
      !Number.isSafeInteger(item.createdAt) ||
      item.createdAt < 0 ||
      item.createdAt > 8_640_000_000_000_000 ||
      typeof item.read !== "boolean"
    )
      return false;
    ids.add(item.id);
  }
  return true;
}
let store: ReturnType<typeof makeStore> | undefined;
function makeStore() {
  return localState<ActivityState>(
    ACTIVITY_KEY,
    {
      version: 1,
      history: [],
      dnd: false,
      favorites: ["notes", "tasks", "focus"],
      recent: [],
    },
    validActivity,
    128 * 1024,
  );
}
export function getActivityStore() {
  return (store ??= makeStore());
}
export function updateActivity(patch: Partial<Omit<ActivityState, "version">>) {
  const current = getActivityStore();
  const next = { ...current.value, ...patch };
  // A character can take several bytes. Keep the newest entries within the
  // storage budget even when every notification contains long Unicode text.
  while (
    next.history.length &&
    new TextEncoder().encode(JSON.stringify(next)).length > 128 * 1024
  )
    next.history = next.history.slice(0, -1);
  current.save(next);
  document.dispatchEvent(new CustomEvent(ACTIVITY_CHANGED));
}

/** The shell only loads this small event/store adapter; the history UI stays lazy. */
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
      if (dismiss.isConnected) timer = setTimeout(hideToast, 8000);
    });
    toast.append(text, dismiss);
    desktop.append(toast);
    // Shell app/system messages already have a live announcement. Only reminders use this region.
    if (entry.kind === "reminder") announcer.textContent = entry.message;
    timer = setTimeout(hideToast, 8000);
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
