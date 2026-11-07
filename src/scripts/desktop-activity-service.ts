import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
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
export const kinds = new Set(["app", "system", "reminder"]);
export const record = (value: unknown): value is Record<string, unknown> =>
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
