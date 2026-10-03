import { localState } from "./desktop-local-state";

type History = { version: 1; paths: string[] };
export const LIBRARY_HISTORY_KEY = "desktop-library-recent:v1";
export function libraryPath(path: string) {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.length > 600 ||
    /[?#\\\u0000-\u001f]/.test(path)
  )
    return null;
  return path.replace(/\/+$/, "") || "/";
}
function historyStore() {
  return localState<History>(
    LIBRARY_HISTORY_KEY,
    { version: 1, paths: [] },
    (value): value is History => {
      const item = value as Partial<History> | null;
      return (
        !!item &&
        item.version === 1 &&
        Array.isArray(item.paths) &&
        item.paths.length <= 80 &&
        item.paths.every(
          (path) => typeof path === "string" && libraryPath(path) === path,
        ) &&
        new Set(item.paths).size === item.paths.length
      );
    },
    64 * 1024,
  );
}
export function readLibraryHistory() {
  return historyStore();
}
export function recordLibraryOpen(path: string) {
  const normalized = libraryPath(path);
  if (!normalized) return false;
  const store = historyStore();
  if (store.value.paths[0] === normalized) return store.writable;
  return store.save({
    version: 1,
    paths: [
      normalized,
      ...store.value.paths.filter((item) => item !== normalized),
    ].slice(0, 80),
  });
}
export function clearLibraryHistory() {
  return historyStore().save({ version: 1, paths: [] });
}
