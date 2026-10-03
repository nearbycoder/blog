import css from "../styles/desktop-workspaces.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { getDesktopHost } from "./desktop-host";
import { getDesktopSpaces } from "./desktop-spaces";

installAppStyle("workspaces", css);

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("workspaces-app");
  const spaces = getDesktopSpaces();
  if (!spaces) {
    root.textContent =
      "Desktops could not load. Reload this page to try again.";
    return () => {};
  }
  const controller = spaces;
  const host = getDesktopHost();
  const manager = root.closest<HTMLElement>("[data-window]")!;
  const abort = new AbortController();
  const events = { signal: abort.signal };
  root.innerHTML = `<header class="spaces-heading"><h2>A place for each kind of work</h2><p>Group this site's windows into up to eight desktops. Your apps stay open when you switch. This control window is available on every desktop.</p></header>
    <form class="spaces-create"><label for="new-desktop-name">New desktop name</label><div><input id="new-desktop-name" name="name" maxlength="40" placeholder="Writing, reading, play…" required autocomplete="off"><button type="submit">Create desktop</button></div></form>
    <section class="spaces-section" aria-label="Your desktops"><div class="spaces-section-heading"><h3>Your desktops</h3><span data-spaces-count></span></div><div class="spaces-list"></div></section>
    <section class="spaces-section" aria-label="Move windows"><h3>Move windows</h3><p class="spaces-help">Choose a home for each open window. Minimized windows stay minimized when you switch.</p><div class="spaces-windows"></div><p data-spaces-empty class="spaces-help" hidden>Open an app or the Library to place it on a desktop.</p></section>
    <aside class="spaces-shortcuts"><strong>Keep your hands on the keyboard</strong><p><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Page Up / Down</kbd> switches desktops. Add <kbd>Shift</kbd> to move the active window and follow it.</p><p>These desktops organize windows inside this browser tab. Saved names and assignments stay in this browser.</p></aside>
    <p class="desk-app-status" data-spaces-status role="status"></p>`;
  const query = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const newName = query<HTMLInputElement>("#new-desktop-name");
  const create = query<HTMLFormElement>(".spaces-create");
  const list = query<HTMLElement>(".spaces-list");
  const windowList = query<HTMLElement>(".spaces-windows");
  const status = query<HTMLElement>("[data-spaces-status]");
  type Card = {
    root: HTMLElement;
    label: HTMLElement;
    select: HTMLButtonElement;
    name: HTMLInputElement;
    remove: HTMLButtonElement;
    confirm: HTMLElement;
  };
  const cards = new Map<string, Card>();
  const rows = new Map<
    HTMLElement,
    { root: HTMLElement; label: HTMLElement; select: HTMLSelectElement }
  >();

  function card(id: string): Card {
    const article = document.createElement("article");
    article.className = "spaces-card";
    article.dataset.spaceCard = id;
    article.innerHTML = `<div class="spaces-card-heading"><h4></h4><button type="button" data-space-switch>Switch here</button></div><form class="spaces-rename"><label>Desktop name<input maxlength="40" required autocomplete="off"></label><button type="submit">Rename</button></form><div class="spaces-card-footer"><span data-space-window-count></span><button type="button" data-space-remove>Remove desktop</button></div><div class="spaces-confirm" hidden><p>Open windows will move to the first remaining desktop. App data stays intact.</p><button type="button" data-space-remove-confirm>Remove and move windows</button><button type="button" data-space-remove-cancel>Cancel</button></div>`;
    const get = <T extends HTMLElement>(selector: string) =>
      article.querySelector<T>(selector)!;
    const result = {
      root: article,
      label: get<HTMLElement>("h4"),
      select: get<HTMLButtonElement>("[data-space-switch]"),
      name: get<HTMLInputElement>("input"),
      remove: get<HTMLButtonElement>("[data-space-remove]"),
      confirm: get<HTMLElement>(".spaces-confirm"),
    };
    result.select.addEventListener(
      "click",
      () => {
        controller.switchTo(id, false);
        host.activate(manager);
        refresh();
      },
      events,
    );
    get<HTMLFormElement>("form").addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        if (controller.rename(id, result.name.value)) {
          status.textContent = `Desktop renamed. ${controller.message}`;
          refresh();
        } else {
          result.name.setCustomValidity(
            "Enter a desktop name using visible characters.",
          );
          result.name.reportValidity();
        }
      },
      events,
    );
    result.name.addEventListener(
      "input",
      () => result.name.setCustomValidity(""),
      events,
    );
    result.remove.addEventListener(
      "click",
      () => {
        result.confirm.hidden = false;
        get<HTMLButtonElement>("[data-space-remove-confirm]").focus();
      },
      events,
    );
    get<HTMLButtonElement>("[data-space-remove-cancel]").addEventListener(
      "click",
      () => {
        result.confirm.hidden = true;
        result.remove.focus();
      },
      events,
    );
    get<HTMLButtonElement>("[data-space-remove-confirm]").addEventListener(
      "click",
      () => {
        controller.remove(id);
        refresh();
        newName.focus();
      },
      events,
    );
    return result;
  }

  function refresh() {
    const { state } = controller;
    const openWindows = host.windows().filter((win) => win !== manager);
    query<HTMLElement>("[data-spaces-count]").textContent =
      `${state.spaces.length} of 8`;
    query<HTMLButtonElement>(".spaces-create button").disabled =
      state.spaces.length >= 8;
    for (const [id, item] of cards)
      if (!state.spaces.some((space) => space.id === id)) {
        item.root.remove();
        cards.delete(id);
      }
    for (const space of state.spaces) {
      let item = cards.get(space.id);
      if (!item) {
        item = card(space.id);
        cards.set(space.id, item);
        list.append(item.root);
      }
      item.label.textContent = space.name;
      item.root.dataset.current = String(state.active === space.id);
      item.root.setAttribute("aria-label", `${space.name} desktop`);
      item.select.textContent =
        state.active === space.id ? "Current desktop" : "Switch here";
      item.select.setAttribute(
        "aria-pressed",
        String(state.active === space.id),
      );
      item.select.setAttribute("aria-label", `Switch to ${space.name}`);
      item.name.setAttribute("aria-label", `Name for ${space.name}`);
      if (document.activeElement !== item.name) item.name.value = space.name;
      item.remove.disabled = state.spaces.length === 1;
      item.remove.title =
        state.spaces.length === 1
          ? "Keep at least one desktop."
          : "Move this desktop's windows to the first remaining desktop";
      const count = openWindows.filter(
        (win) => win.dataset.space === space.id,
      ).length;
      item.root.querySelector<HTMLElement>(
        "[data-space-window-count]",
      )!.textContent = `${count} ${count === 1 ? "window" : "windows"}`;
    }
    for (const [win, row] of rows)
      if (!openWindows.includes(win)) {
        row.root.remove();
        rows.delete(win);
      }
    for (const win of openWindows) {
      let row = rows.get(win);
      if (!row) {
        const label = document.createElement("label");
        label.className = "spaces-window";
        const title = document.createElement("span");
        const select = document.createElement("select");
        select.dataset.spaceWindow = win.dataset.window;
        label.append(title, select);
        windowList.append(label);
        row = { root: label, label: title, select };
        rows.set(win, row);
        select.addEventListener(
          "change",
          () => {
            controller.move(win, select.value);
            refresh();
          },
          events,
        );
      }
      row.label.textContent = win.dataset.title ?? "Library";
      row.select.setAttribute(
        "aria-label",
        `Desktop for ${win.dataset.title ?? "Library"}`,
      );
      const options = state.spaces.map(
        (space) => new Option(space.name, space.id),
      );
      if (
        row.select.options.length !== options.length ||
        options.some(
          (option, index) =>
            row!.select.options[index]?.value !== option.value ||
            row!.select.options[index]?.text !== option.text,
        )
      )
        row.select.replaceChildren(...options);
      row.select.value = win.dataset.space ?? state.active;
    }
    query<HTMLElement>("[data-spaces-empty]").hidden = openWindows.length > 0;
    status.textContent = controller.message;
  }

  create.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const created = controller.create(newName.value);
      if (!created) {
        newName.setCustomValidity(
          "Use a visible name of up to 40 characters. You can have eight desktops.",
        );
        newName.reportValidity();
        return;
      }
      newName.value = "";
      refresh();
      cards.get(created)?.select.focus();
    },
    events,
  );
  newName.addEventListener(
    "input",
    () => newName.setCustomValidity(""),
    events,
  );
  document.addEventListener("desktop-spaces-changed", refresh, events);
  document.addEventListener("desktop-windows-changed", refresh, events);
  refresh();
  return () => {
    abort.abort();
    cards.clear();
    rows.clear();
  };
}
