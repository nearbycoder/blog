import { getDesktopHost } from "./desktop-host";
import { localState } from "./desktop-local-state";

export type DesktopSpace = { id: string; name: string };
export type DesktopSpacesState = {
  version: 1;
  active: string;
  spaces: DesktopSpace[];
  assignments: Record<string, string>;
};
const key = "desktop-spaces:v1";
const validId = (value: unknown): value is string =>
  typeof value === "string" && /^desk-[a-z0-9-]{1,48}$/.test(value);
const validKey = (value: string) =>
  value.length > 0 &&
  value.length <= 300 &&
  !["__proto__", "constructor", "prototype"].includes(value) &&
  !/[\u0000-\u001f\u007f]/.test(value);
export function validDesktopSpaces(
  value: unknown,
): value is DesktopSpacesState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as DesktopSpacesState;
  if (
    data.version !== 1 ||
    !Array.isArray(data.spaces) ||
    !data.spaces.length ||
    data.spaces.length > 8
  )
    return false;
  if (
    !data.spaces.every(
      (space) =>
        space &&
        typeof space === "object" &&
        validId(space.id) &&
        typeof space.name === "string" &&
        space.name.trim().length > 0 &&
        space.name.length <= 40 &&
        !/[\u0000-\u001f\u007f]/.test(space.name),
    )
  )
    return false;
  const ids = new Set(data.spaces.map((space) => space.id));
  if (
    ids.size !== data.spaces.length ||
    !ids.has(data.active) ||
    !data.assignments ||
    typeof data.assignments !== "object" ||
    Array.isArray(data.assignments)
  )
    return false;
  const entries = Object.entries(data.assignments);
  return (
    entries.length <= 256 &&
    entries.every(
      ([name, id]) => validKey(name) && typeof id === "string" && ids.has(id),
    )
  );
}

export type DesktopSpaces = ReturnType<typeof mountDesktopSpaces>;
let current: DesktopSpaces | undefined;
export const getDesktopSpaces = () => current;

/** Separates a desk being out of view from a user's choice to minimize an app. */
export function mountDesktopSpaces(
  desktop: HTMLElement,
  visibleMinimized: (win: HTMLElement) => boolean = (win) => win.hidden,
) {
  const store = localState<DesktopSpacesState>(
    key,
    {
      version: 1,
      active: "desk-1",
      spaces: [{ id: "desk-1", name: "Desk 1" }],
      assignments: {},
    },
    validDesktopSpaces,
    128 * 1024,
  );
  let state = structuredClone(store.value);
  let restoring = true;
  const minimized = new WeakMap<HTMLElement, boolean>();
  const all = () => [...desktop.querySelectorAll<HTMLElement>("[data-window]")];
  const sticky = (win: HTMLElement) => win.dataset.window === "workspaces";
  const identity = (win: HTMLElement) =>
    win.dataset.source ?? win.dataset.window ?? "";
  const nameOf = (id: string) =>
    state.spaces.find((space) => space.id === id)?.name ?? "Desktop";
  function save() {
    store.save(state);
    document.dispatchEvent(new CustomEvent("desktop-spaces-changed"));
    getDesktopHost()?.changed();
  }
  function remember(win: HTMLElement) {
    const name = identity(win);
    if (!validKey(name) || sticky(win)) return;
    // Keep recent assignments bounded, including readers that navigate to a new URL.
    const entries = Object.entries(state.assignments).filter(
      ([item]) => item !== name,
    );
    entries.push([name, win.dataset.space ?? state.active]);
    state.assignments = Object.fromEntries(entries.slice(-256));
  }
  function register(win: HTMLElement) {
    const assigned = state.assignments[identity(win)];
    win.dataset.space = state.spaces.some((space) => space.id === assigned)
      ? assigned
      : state.active;
    if (!restoring) {
      remember(win);
      apply();
      save();
    }
  }
  function apply() {
    const windows = all();
    for (const win of windows) {
      const inactive = !sticky(win) && win.dataset.space !== state.active;
      if (inactive) {
        if (win.dataset.spaceHidden !== "true")
          minimized.set(win, visibleMinimized(win));
        win.dataset.spaceHidden = "true";
        if (!win.hidden) win.hidden = true;
        if (win.classList.contains("is-active"))
          win.classList.remove("is-active");
      } else if (win.dataset.spaceHidden === "true") {
        win.hidden = minimized.get(win) ?? true;
        delete win.dataset.spaceHidden;
      }
    }
    for (const button of desktop.querySelectorAll<HTMLButtonElement>(
      "[data-task]",
    )) {
      const win = windows.find(
        (item) => item.dataset.window === button.dataset.task,
      );
      button.hidden =
        !!win && !sticky(win) && win.dataset.space !== state.active;
      if (button.hidden) button.setAttribute("aria-pressed", "false");
    }
    desktop
      .querySelectorAll<HTMLElement>("[data-active-space-label]")
      .forEach((label) => {
        label.textContent = nameOf(state.active);
      });
    desktop.dataset.activeSpace = state.active;
  }
  function switchTo(id: string, focus = true) {
    if (!state.spaces.some((space) => space.id === id)) return;
    const changed = state.active !== id;
    state.active = id;
    apply();
    if (focus) {
      const visible = getDesktopHost()
        ?.windows()
        .filter((win) => !win.hidden)
        .sort(
          (a, b) =>
            Number(b.dataset.lastActive ?? 0) -
            Number(a.dataset.lastActive ?? 0),
        );
      if (visible?.[0]) getDesktopHost().activate(visible[0]);
      else
        desktop
          .querySelector<HTMLButtonElement>('[data-open-app="workspaces"]')
          ?.focus();
    }
    if (changed) {
      save();
      getDesktopHost()?.announce(`Switched to ${nameOf(id)}.`);
    }
  }
  const controller = {
    get state() {
      return state;
    },
    get message() {
      return store.message;
    },
    register,
    isMinimized: (win: HTMLElement) =>
      win.dataset.spaceHidden === "true"
        ? (minimized.get(win) ?? true)
        : visibleMinimized(win),
    minimize(win: HTMLElement) {
      if (win.dataset.spaceHidden === "true") minimized.set(win, true);
    },
    reveal(win: HTMLElement) {
      if (!restoring && !sticky(win))
        switchTo(win.dataset.space ?? state.active, false);
    },
    finishRestore() {
      restoring = false;
      apply();
    },
    switchTo,
    create(name: string) {
      if (state.spaces.length >= 8) return false;
      const title = name.trim().slice(0, 40);
      if (!title || /[\u0000-\u001f\u007f]/.test(title)) return false;
      const id = `desk-${crypto.randomUUID()}`;
      state.spaces.push({ id, name: title });
      save();
      return id;
    },
    rename(id: string, name: string) {
      const space = state.spaces.find((item) => item.id === id);
      const title = name.trim().slice(0, 40);
      if (!space || !title || /[\u0000-\u001f\u007f]/.test(title)) return false;
      space.name = title;
      apply();
      save();
      return true;
    },
    remove(id: string) {
      if (
        state.spaces.length === 1 ||
        !state.spaces.some((space) => space.id === id)
      )
        return false;
      const target = state.spaces.find((space) => space.id !== id)!.id;
      state.spaces = state.spaces.filter((space) => space.id !== id);
      for (const name of Object.keys(state.assignments))
        if (state.assignments[name] === id) state.assignments[name] = target;
      for (const win of all())
        if (win.dataset.space === id) win.dataset.space = target;
      if (state.active === id) state.active = target;
      apply();
      save();
      getDesktopHost()?.announce(
        `Desktop removed. Its windows are on ${nameOf(target)}.`,
      );
      return true;
    },
    move(win: HTMLElement, id: string, follow = false) {
      if (sticky(win) || !state.spaces.some((space) => space.id === id)) return;
      win.dataset.space = id;
      remember(win);
      apply();
      save();
      if (follow) {
        switchTo(id, false);
        getDesktopHost()?.activate(win);
      }
      getDesktopHost()?.announce(
        `${win.dataset.title ?? "Library"} moved to ${nameOf(id)}.`,
      );
    },
    handleShortcut(event: KeyboardEvent) {
      if (
        !event.ctrlKey ||
        !event.altKey ||
        event.metaKey ||
        !["PageUp", "PageDown"].includes(event.key) ||
        event.repeat ||
        event.isComposing
      )
        return false;
      if (document.querySelector("dialog[open]")) return false;
      event.preventDefault();
      event.stopPropagation();
      const index = state.spaces.findIndex(
        (space) => space.id === state.active,
      );
      const id =
        state.spaces[
          (index + (event.key === "PageDown" ? 1 : -1) + state.spaces.length) %
            state.spaces.length
        ].id;
      const active = all().find(
        (win) => !win.hidden && win.classList.contains("is-active"),
      );
      if (event.shiftKey && active && !sticky(active))
        controller.move(active, id, true);
      else switchTo(id);
      return true;
    },
  };
  current = controller;
  document.addEventListener("desktop-windows-changed", () => {
    if (restoring) return;
    // Reader navigation changes its persistence key without moving the window.
    let changed = false;
    for (const win of all())
      if (
        !sticky(win) &&
        state.assignments[identity(win)] !== win.dataset.space
      ) {
        remember(win);
        changed = true;
      }
    apply();
    if (changed) save();
  });
  return controller;
}
