import css from "../styles/desktop-library.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { localState } from "./desktop-local-state";
import {
  libraryPath,
  readLibraryHistory,
  recordLibraryOpen,
  clearLibraryHistory,
} from "./desktop-library-history";

type Sort =
  | "original"
  | "name-asc"
  | "name-desc"
  | "kind-asc"
  | "kind-desc"
  | "date-asc"
  | "date-desc";
type Location = { folder: string; query: string };
type LibraryState = Location & {
  version: 1;
  view: "list" | "grid";
  sort: Sort;
  stars: string[];
};
const SORTS: [Sort, string][] = [
  ["original", "Default order"],
  ["name-asc", "Name · A–Z"],
  ["name-desc", "Name · Z–A"],
  ["kind-asc", "Type · A–Z"],
  ["kind-desc", "Type · Z–A"],
  ["date-desc", "Date · newest first"],
  ["date-asc", "Date · oldest first"],
];
const KEY = "desktop-library:v1";
const initial: LibraryState = {
  version: 1,
  folder: "all",
  query: "",
  view: "list",
  sort: "original",
  stars: [],
};
const validPaths = (value: unknown, maximum: number): value is string[] =>
  Array.isArray(value) &&
  value.length <= maximum &&
  value.every(
    (item) => typeof item === "string" && libraryPath(item) === item,
  ) &&
  new Set(value).size === value.length;
function valid(value: unknown): value is LibraryState {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LibraryState>;
  return (
    item.version === 1 &&
    typeof item.folder === "string" &&
    /^[a-z-]{1,40}$/.test(item.folder) &&
    typeof item.query === "string" &&
    item.query.length <= 2000 &&
    (item.view === "list" || item.view === "grid") &&
    SORTS.some(([sort]) => sort === item.sort) &&
    validPaths(item.stars, 1000)
  );
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function button(text: string, label: string) {
  const item = el("button", text);
  item.type = "button";
  item.setAttribute("aria-label", label);
  item.title = label;
  return item;
}
function fileDate(text: string) {
  if (!/^\d{4}(?:-\d{2}-\d{2})?$/.test(text)) return null;
  const iso = text.length === 4 ? `${text}-01-01` : text;
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === iso
    ? time
    : null;
}

export function mountLibrary(
  desktop: HTMLElement,
  actions: {
    getFolder: () => string;
    selectFolder: (id: string) => void;
    announce: (text: string) => void;
  },
  restore = { location: true, view: true },
) {
  installAppStyle("library", css);
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const win = desktop.querySelector<HTMLElement>('[data-window="library"]')!;
  const content = win.querySelector<HTMLElement>(".library-content")!;
  const list = win.querySelector<HTMLUListElement>(".desktop-files")!;
  const search = win.querySelector<HTMLInputElement>("[data-desktop-search]")!;
  const sidebar = win.querySelector<HTMLElement>(".library-sidebar")!;
  const store = localState(KEY, initial, valid, 768 * 1024);
  let state = { ...store.value, stars: [...store.value.stars] };
  if (!restore.view)
    state.view = content.dataset.view === "grid" ? "grid" : "list";
  const savedLocation = { folder: state.folder, query: state.query };
  const historyStore = readLibraryHistory();
  let recentPaths = [...historyStore.value.paths];
  const files = [...list.querySelectorAll<HTMLElement>("[data-file]")].map(
    (row, order) => {
      const link = row.querySelector<HTMLAnchorElement>("[data-desktop-file]")!;
      return {
        row,
        link,
        order,
        path: libraryPath(link.pathname)!,
        title: link.dataset.fileTitle || link.textContent?.trim() || "Untitled",
        kind: row.querySelector(".file-kind")?.textContent?.trim() || "File",
        detail: row.querySelector(".file-date")?.textContent?.trim() || "",
        folder: row.dataset.fileFolder!,
        terms: row.dataset.fileSearch || "",
      };
    },
  );
  type File = (typeof files)[number];
  let selected: File | undefined;
  let inspectorTrigger: HTMLButtonElement | undefined;
  let locations: Location[] = [];
  let position = -1;
  let searchGroupUntil = 0;
  let restoring = true;
  let disposed = false;
  const controls = el("div", undefined, "library-tools");
  controls.dataset.libraryTools = "";
  const navigation = el("div", undefined, "library-history");
  navigation.setAttribute("role", "group");
  navigation.setAttribute("aria-label", "Library navigation");
  const back = button("←", "Library Back");
  const forward = button("→", "Library Forward");
  navigation.append(back, forward);
  const sortLabel = el("label", "Sort", "library-sort");
  const sorting = el("select");
  sorting.setAttribute("aria-label", "Sort files");
  SORTS.forEach(([value, title]) => {
    const option = el("option", title);
    option.value = value;
    sorting.append(option);
  });
  sorting.value = state.sort;
  sortLabel.append(sorting);
  const clearRecent = button("Clear history", "Clear recent files");
  clearRecent.hidden = true;
  controls.append(navigation, sortLabel, clearRecent);
  win.querySelector(".library-toolbar")!.after(controls);
  const notice = el("p", "", "library-save-notice");
  notice.setAttribute("role", "status");
  notice.hidden = true;
  controls.after(notice);
  function warn(message = store.message) {
    notice.hidden = false;
    notice.textContent = message;
  }
  if (!store.writable) warn();
  if (!historyStore.writable) warn(historyStore.message);
  function save() {
    if (!store.save(state)) warn();
  }
  const virtual = new Map<string, HTMLButtonElement>();
  for (const [id, title, icon] of [
    ["favorites", "Favorites", "☆"],
    ["recent", "Recent files", "◷"],
  ]) {
    const item = button("", title);
    item.dataset.folder = id;
    item.setAttribute("aria-pressed", "false");
    const glyph = el("span", icon, "desktop-icon");
    glyph.setAttribute("aria-hidden", "true");
    const count = el("small");
    count.setAttribute("aria-hidden", "true");
    item.append(glyph, el("span", title), count);
    sidebar.querySelector(".library-sidebar-note")!.before(item);
    item.addEventListener("click", () => actions.selectFolder(id), options);
    virtual.set(id, item);
  }
  const details = el("section", undefined, "library-details");
  details.hidden = true;
  details.setAttribute("aria-label", "File details");
  details.dataset.libraryDetails = "";
  content.querySelector(".library-intro")!.after(details);
  const detailHeading = el("h2");
  detailHeading.tabIndex = -1;
  const closeDetails = button("×", "Close file details");
  const detailHeader = el("div", undefined, "library-detail-heading");
  detailHeader.append(detailHeading, closeDetails);
  const description = el("p");
  const metadata = el("dl");
  const linkLabel = el("label", "File link");
  const linkField = el("input");
  linkField.readOnly = true;
  linkField.type = "text";
  linkField.setAttribute("aria-label", "File link");
  linkLabel.append(linkField);
  const detailActions = el("div", undefined, "library-detail-actions");
  const copy = button("Copy link", "Copy file link");
  const open = el("a", "Open in a tab");
  open.target = "_blank";
  open.rel = "noopener";
  const copyStatus = el("span");
  copyStatus.setAttribute("role", "status");
  detailActions.append(copy, open, copyStatus);
  details.append(detailHeader, description, metadata, linkLabel, detailActions);
  const rowButtons: HTMLElement[] = [];
  files.forEach((file) => {
    const rowActions = el("div", undefined, "library-file-actions");
    const star = button("☆", `Star ${file.title}`);
    star.dataset.libraryStar = file.path;
    star.setAttribute("aria-pressed", String(state.stars.includes(file.path)));
    const inspect = button("ⓘ", `Details for ${file.title}`);
    inspect.dataset.libraryInspect = file.path;
    rowActions.append(star, inspect);
    file.row.append(rowActions);
    rowButtons.push(rowActions);
  });
  function updateStars() {
    files.forEach((file) => {
      const starred = state.stars.includes(file.path);
      const item = file.row.querySelector<HTMLButtonElement>(
        "[data-library-star]",
      )!;
      item.textContent = starred ? "★" : "☆";
      item.setAttribute("aria-pressed", String(starred));
      item.setAttribute(
        "aria-label",
        `${starred ? "Unstar" : "Star"} ${file.title}`,
      );
      item.title = `${starred ? "Unstar" : "Star"} ${file.title}`;
    });
    virtual.get("favorites")!.querySelector("small")!.textContent = String(
      files.filter((file) => state.stars.includes(file.path)).length,
    );
    virtual.get("recent")!.querySelector("small")!.textContent = String(
      files.filter((file) => recentPaths.includes(file.path)).length,
    );
  }
  function historyControls() {
    back.disabled = position <= 0;
    forward.disabled = position >= locations.length - 1;
  }
  function remember(location: Location) {
    const previous = locations[position];
    if (
      previous?.folder === location.folder &&
      previous.query === location.query
    )
      return;
    const now = Date.now();
    const queryChange = previous?.folder === location.folder;
    const canCoalesce =
      queryChange &&
      now < searchGroupUntil &&
      position > 0 &&
      position === locations.length - 1;
    if (canCoalesce) locations[position] = location;
    else {
      locations = locations.slice(0, position + 1);
      locations.push(location);
      if (locations.length > 50) locations.shift();
      position = locations.length - 1;
    }
    searchGroupUntil = queryChange ? now + 700 : 0;
    historyControls();
  }
  function filter(folder: string, query: string) {
    state = { ...state, folder, query: query.slice(0, 2000) };
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const file of files) {
      const inFolder =
        folder === "all" ||
        (folder === "favorites"
          ? state.stars.includes(file.path)
          : folder === "recent"
            ? recentPaths.includes(file.path)
            : file.folder === folder);
      file.row.hidden =
        !inFolder || !terms.every((term) => file.terms.includes(term));
      if (!file.row.hidden) count++;
    }
    const sorted = [...files].sort((a, b) => {
      if (state.sort === "original")
        return folder === "recent"
          ? (recentPaths.indexOf(a.path) < 0
              ? 1000
              : recentPaths.indexOf(a.path)) -
              (recentPaths.indexOf(b.path) < 0
                ? 1000
                : recentPaths.indexOf(b.path)) || a.order - b.order
          : a.order - b.order;
      const direction = state.sort.endsWith("desc") ? -1 : 1;
      if (state.sort.startsWith("date")) {
        const aDate = fileDate(a.detail);
        const bDate = fileDate(b.detail);
        if (aDate === null || bDate === null)
          return aDate === bDate ? a.order - b.order : aDate === null ? 1 : -1;
        return (aDate - bDate) * direction || a.order - b.order;
      }
      const field = state.sort.startsWith("kind") ? "kind" : "title";
      return (
        a[field].localeCompare(b[field], "en", {
          numeric: true,
          sensitivity: "base",
        }) * direction || a.order - b.order
      );
    });
    // Only move rows whose order changed; typing should retain keyboard focus.
    sorted.forEach((file, index) => {
      if (list.children[index] !== file.row)
        list.insertBefore(file.row, list.children[index] || null);
    });
    win.querySelector("[data-file-count]")!.textContent =
      `${count} ${count === 1 ? "file" : "files"}`;
    win.querySelector<HTMLElement>("[data-desktop-empty]")!.hidden =
      count !== 0;
    clearRecent.hidden = folder !== "recent";
    clearRecent.disabled = recentPaths.length === 0;
    if (selected?.row.hidden) {
      details.hidden = true;
      selected = undefined;
    }
    if (!restoring) {
      remember({ folder, query: state.query });
      save();
    }
    updateStars();
  }
  function travel(delta: number) {
    const destination = locations[position + delta];
    if (!destination) return;
    position += delta;
    restoring = true;
    actions.selectFolder(destination.folder);
    search.value = destination.query;
    filter(destination.folder, destination.query);
    restoring = false;
    searchGroupUntil = 0;
    save();
    historyControls();
    actions.announce(
      `Library: ${win.querySelector("[data-folder-title]")!.textContent}${destination.query ? `, search ${destination.query}` : ""}.`,
    );
  }
  back.addEventListener("click", () => travel(-1), options);
  forward.addEventListener("click", () => travel(1), options);
  sorting.addEventListener(
    "change",
    () => {
      state.sort = sorting.value as Sort;
      filter(actions.getFolder(), search.value);
    },
    options,
  );
  clearRecent.addEventListener(
    "click",
    () => {
      const saved = clearLibraryHistory();
      recentPaths = [];
      filter(actions.getFolder(), search.value);
      if (!saved) warn(readLibraryHistory().message);
      actions.announce(
        saved
          ? "Recent file history cleared on this device."
          : "Recent files cleared for this visit. Stored history could not be changed.",
      );
    },
    options,
  );
  list.addEventListener(
    "click",
    (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-library-star], [data-library-inspect]",
      );
      if (!target) return;
      const file = files.find(
        (item) =>
          item.path ===
          (target.dataset.libraryStar || target.dataset.libraryInspect),
      );
      if (!file) return;
      if (target.hasAttribute("data-library-star")) {
        const wasStarred = state.stars.includes(file.path);
        if (!wasStarred && state.stars.length >= 1000) {
          actions.announce(
            "Favorites is full. Unstar a file before adding another.",
          );
          return;
        }
        state.stars = wasStarred
          ? state.stars.filter((path) => path !== file.path)
          : [...state.stars, file.path];
        filter(actions.getFolder(), search.value);
        if (file.row.hidden) virtual.get("favorites")!.focus();
        actions.announce(
          `${file.title} ${wasStarred ? "removed from" : "added to"} Favorites.`,
        );
      } else {
        selected = file;
        inspectorTrigger = target;
        details.hidden = false;
        detailHeading.textContent = file.title;
        description.textContent = file.link.title;
        metadata.replaceChildren();
        for (const [term, value] of [
          ["Type", file.kind],
          ["Date", fileDate(file.detail) === null ? "Not dated" : file.detail],
          [
            "Folder",
            sidebar.querySelector(
              `[data-folder="${file.folder}"] span:not(.desktop-icon)`,
            )?.textContent || file.folder,
          ],
        ])
          metadata.append(el("dt", term), el("dd", value));
        linkField.value = file.link.href;
        open.href = file.link.href;
        copyStatus.textContent = "";
        detailHeading.focus();
      }
    },
    options,
  );
  closeDetails.addEventListener(
    "click",
    () => {
      details.hidden = true;
      selected = undefined;
      inspectorTrigger?.focus();
    },
    options,
  );
  copy.addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(linkField.value);
        if (!disposed) copyStatus.textContent = "Link copied.";
      } catch {
        if (!disposed) {
          copyStatus.textContent = "Select and copy the link above.";
          linkField.focus();
          linkField.select();
        }
      }
    },
    options,
  );
  win.querySelector(".file-view-controls")!.addEventListener(
    "click",
    (event) => {
      const view = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-file-view]",
      )?.dataset.fileView;
      if (view !== "list" && view !== "grid") return;
      state.view = view;
      save();
    },
    options,
  );
  content.dataset.view = state.view;
  win
    .querySelectorAll<HTMLButtonElement>("[data-file-view]")
    .forEach((item) =>
      item.setAttribute(
        "aria-pressed",
        String(item.dataset.fileView === state.view),
      ),
    );
  // Lazy mounting never opens Library at startup. Restore after the caller has
  // received this API, so selectFolder can safely delegate back to filter.
  queueMicrotask(() => {
    if (disposed) return;
    const current = actions.getFolder();
    const available = [
      ...sidebar.querySelectorAll<HTMLButtonElement>("[data-folder]"),
    ].some((item) => item.dataset.folder === savedLocation.folder);
    const restoreLocation = restore.location && current === "all";
    const restoreFolder =
      restoreLocation && available ? savedLocation.folder : current;
    const restoreQuery = restoreLocation ? savedLocation.query : search.value;
    actions.selectFolder(restoreFolder);
    search.value = restoreQuery;
    filter(restoreFolder, restoreQuery);
    restoring = false;
    remember({ folder: restoreFolder, query: restoreQuery });
    if (!restore.location || !restore.view) save();
  });
  updateStars();
  historyControls();
  return {
    filter,
    recordOpen(link: HTMLAnchorElement) {
      const path = libraryPath(link.pathname);
      if (!path || !files.some((file) => file.path === path)) return;
      const saved = recordLibraryOpen(path);
      recentPaths = [
        path,
        ...recentPaths.filter((item) => item !== path),
      ].slice(0, 80);
      if (!saved) warn(readLibraryHistory().message);
      if (actions.getFolder() === "recent") filter("recent", search.value);
      else updateStars();
    },
    dispose() {
      disposed = true;
      abort.abort();
      controls.remove();
      notice.remove();
      details.remove();
      virtual.forEach((item) => item.remove());
      rowButtons.forEach((item) => item.remove());
    },
  };
}
