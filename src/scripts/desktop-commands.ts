import css from "../styles/desktop-commands.css?inline";
import { installAppStyle } from "./desktop-app-style";
export { createDesktopCommands } from "./desktop-command-catalog";

export type DesktopCommand = {
  id: string;
  title: string;
  description: string;
  group: "Applications" | "Open windows" | "Desktop" | "Files";
  keywords?: string;
  icon?: Element;
  run: () => void;
};

const groups: DesktopCommand["group"][] = [
  "Open windows",
  "Desktop",
  "Applications",
  "Files",
];
const symbols: Record<DesktopCommand["group"], string> = {
  "Open windows": "▣",
  Desktop: "⌘",
  Applications: "✦",
  Files: "▤",
};
let paletteCount = 0;

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function mountCommandPalette(
  desktop: HTMLElement,
  getCommands: () => DesktopCommand[],
): {
  open: (invoker?: HTMLElement) => void;
  close: (restoreFocus?: boolean) => void;
  isOpen: () => boolean;
} {
  installAppStyle("commands", css);
  const prefix = `desktop-commands-${++paletteCount}`;
  const dialog = document.createElement("dialog");
  dialog.className = "desktop-commands";
  dialog.setAttribute("aria-label", "Desktop commands");

  const header = document.createElement("div");
  header.className = "desktop-commands-search";
  const searchIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  searchIcon.setAttribute("viewBox", "0 0 24 24");
  searchIcon.setAttribute("aria-hidden", "true");
  const circle = document.createElementNS(searchIcon.namespaceURI, "circle");
  circle.setAttribute("cx", "10.5");
  circle.setAttribute("cy", "10.5");
  circle.setAttribute("r", "6.5");
  const handle = document.createElementNS(searchIcon.namespaceURI, "path");
  handle.setAttribute("d", "m16 16 4 4");
  searchIcon.append(circle, handle);
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search apps, files, and commands…";
  input.setAttribute("aria-label", "Search desktop commands");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-haspopup", "listbox");
  input.setAttribute("aria-controls", `${prefix}-results`);
  input.setAttribute("aria-expanded", "false");
  input.autocomplete = "off";
  input.spellcheck = false;
  input.maxLength = 200;
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "desktop-commands-close";
  closeButton.setAttribute("aria-label", "Close desktop commands");
  closeButton.textContent = "Esc";
  header.append(searchIcon, input, closeButton);

  const results = document.createElement("div");
  results.className = "desktop-commands-results";
  results.id = `${prefix}-results`;
  results.setAttribute("role", "listbox");
  results.setAttribute("aria-label", "Desktop command results");
  const empty = document.createElement("div");
  empty.className = "desktop-commands-empty";
  empty.hidden = true;
  const emptyTitle = document.createElement("strong");
  emptyTitle.textContent = "No commands found.";
  const emptyHelp = document.createElement("p");
  emptyHelp.textContent = "Try an app name, a file title, or a desktop action.";
  empty.append(emptyTitle, emptyHelp);

  const footer = document.createElement("div");
  footer.className = "desktop-commands-footer";
  const count = document.createElement("span");
  count.className = "desktop-commands-count";
  count.setAttribute("role", "status");
  count.setAttribute("aria-live", "polite");
  const navigationHint = document.createElement("span");
  navigationHint.className = "desktop-commands-navigation";
  const arrowKey = document.createElement("kbd");
  arrowKey.textContent = "↑ ↓";
  navigationHint.append(arrowKey, " Navigate");
  const runHint = document.createElement("span");
  const enterKey = document.createElement("kbd");
  enterKey.textContent = "↵";
  runHint.append(enterKey, " Open");
  footer.append(count, navigationHint, runHint);
  dialog.append(header, results, empty, footer);
  desktop.append(dialog);

  let commands: DesktopCommand[] = [];
  let visible: DesktopCommand[] = [];
  let options: HTMLElement[] = [];
  let selected = 0;
  let composing = false;
  let previousFocus: HTMLElement | undefined;
  let frameFocus: HTMLElement[] = [];
  let backdropPointer: number | undefined;

  function restoreInvoker() {
    const target = previousFocus;
    const insideFrames = frameFocus;
    previousFocus = undefined;
    frameFocus = [];
    if (target?.isConnected && !target.closest("[inert], [hidden]")) {
      target.focus({ preventScroll: true });
      // Focusing an iframe element alone does not restore its focused control.
      for (const element of insideFrames) {
        if (!element.isConnected || element.closest("[inert], [hidden]")) break;
        element.focus({ preventScroll: true });
      }
    }
  }

  function close(restoreFocus = true) {
    if (!dialog.open) return;
    backdropPointer = undefined;
    composing = false;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    if (!restoreFocus) {
      previousFocus = undefined;
      frameFocus = [];
    }
    dialog.close();
    if (restoreFocus) restoreInvoker();
  }

  function select(index: number, scroll = true) {
    selected = options.length ? (index + options.length) % options.length : 0;
    options.forEach((option, i) =>
      option.setAttribute("aria-selected", String(i === selected)),
    );
    const active = options[selected];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      if (scroll) active.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }

  function execute(index: number) {
    const command = visible[index];
    if (!command || composing) return;
    close();
    command.run();
  }

  function render() {
    const query = normalize(input.value.trim());
    if (query) {
      const terms = query.split(/\s+/);
      visible = commands
        .map((command, index) => {
          const title = normalize(command.title);
          const corpus = normalize(
            `${command.title} ${command.keywords ?? ""} ${command.description}`,
          );
          let rank = Infinity;
          if (terms.every((term) => corpus.includes(term))) {
            rank =
              title === query
                ? 0
                : title.startsWith(query)
                  ? 10
                  : title.includes(query)
                    ? 20
                    : terms.every((term) => title.includes(term))
                      ? 30
                      : 40;
          }
          return { command, rank, index };
        })
        .filter(({ rank }) => Number.isFinite(rank))
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .slice(0, 40)
        .map(({ command }) => command);
    } else {
      visible = groups
        .filter((group) => group !== "Files")
        .flatMap((group) =>
          commands
            .filter((command) => command.group === group)
            .slice(
              0,
              group === "Open windows" ? 6 : group === "Desktop" ? 5 : 8,
            ),
        )
        .slice(0, 16);
    }

    results.replaceChildren();
    options = [];
    // Keep global search ranking: repeated groups receive fresh headings when
    // necessary instead of moving a loose match ahead of an exact title match.
    let currentGroup: DesktopCommand["group"] | undefined;
    let section: HTMLElement;
    visible.forEach((command, index) => {
      if (command.group !== currentGroup) {
        currentGroup = command.group;
        section = document.createElement("div");
        section.className = "desktop-commands-group";
        section.setAttribute("role", "group");
        section.setAttribute("aria-label", command.group);
        const heading = document.createElement("div");
        heading.className = "desktop-commands-heading";
        heading.setAttribute("aria-hidden", "true");
        heading.textContent = command.group;
        section.append(heading);
        results.append(section);
      }
      const option = document.createElement("div");
      option.className = "desktop-commands-option";
      option.id = `${prefix}-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-label", command.title);
      option.setAttribute("aria-description", command.description);
      option.setAttribute("aria-selected", "false");
      option.dataset.commandId = command.id;
      const icon = document.createElement("span");
      icon.className = "desktop-commands-icon";
      icon.setAttribute("aria-hidden", "true");
      if (command.icon) {
        const cloned = command.icon.cloneNode(true) as Element;
        cloned.removeAttribute("id");
        cloned
          .querySelectorAll("[id]")
          .forEach((element) => element.removeAttribute("id"));
        icon.append(cloned);
      } else icon.textContent = symbols[command.group];
      const copy = document.createElement("span");
      copy.className = "desktop-commands-copy";
      const title = document.createElement("span");
      title.className = "desktop-commands-title";
      title.textContent = command.title;
      const description = document.createElement("span");
      description.className = "desktop-commands-description";
      description.textContent = command.description;
      copy.append(title, description);
      const meta = document.createElement("span");
      meta.className = "desktop-commands-meta";
      meta.setAttribute("aria-hidden", "true");
      meta.textContent =
        command.group === "Applications"
          ? "Application"
          : command.group === "Open windows"
            ? "Switch to"
            : command.group === "Files"
              ? "File"
              : "Action";
      option.append(icon, copy, meta);
      option.addEventListener("pointermove", (event) => {
        if (event.pointerType === "mouse") select(index, false);
      });
      option.addEventListener("mousedown", (event) => event.preventDefault());
      option.addEventListener("click", () => execute(index));
      section!.append(option);
      options.push(option);
    });
    empty.hidden = visible.length !== 0;
    results.hidden = !visible.length;
    count.textContent = visible.length
      ? `${visible.length} ${visible.length === 1 ? "command" : "commands"}${query && visible.length === 40 ? " · refine to see more" : ""}`
      : "No matches";
    results.scrollTop = 0;
    select(0, false);
  }

  input.addEventListener("input", () => {
    if (!composing) render();
  });
  input.addEventListener("compositionstart", () => {
    composing = true;
  });
  input.addEventListener("compositionend", () => {
    composing = false;
    render();
  });
  closeButton.addEventListener("click", () => close());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (!composing) close();
  });
  dialog.addEventListener("close", () => {
    // A queued close event from an earlier invocation must not steal focus.
    if (!dialog.open) restoreInvoker();
  });
  dialog.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (composing || event.isComposing || event.keyCode === 229) return;
    if (
      event.key === "Escape" ||
      ((event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "k")
    ) {
      event.preventDefault();
      close();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      select(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (
      (event.key === "Home" || event.key === "End") &&
      (event.target !== input || !input.value || event.altKey)
    ) {
      event.preventDefault();
      select(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" && event.target === input) {
      event.preventDefault();
      if (!event.repeat) execute(selected);
    }
  });
  const outside = (event: PointerEvent) => {
    const rect = dialog.getBoundingClientRect();
    return (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    );
  };
  dialog.addEventListener("pointerdown", (event) => {
    backdropPointer = outside(event) ? event.pointerId : undefined;
  });
  dialog.addEventListener("pointerup", (event) => {
    if (backdropPointer === event.pointerId && outside(event)) close();
    backdropPointer = undefined;
  });
  dialog.addEventListener("pointercancel", () => {
    backdropPointer = undefined;
  });

  return {
    open(invoker) {
      if (dialog.open) {
        input.focus({ preventScroll: true });
        return;
      }
      const focused = document.activeElement;
      previousFocus =
        invoker ?? (focused instanceof HTMLElement ? focused : undefined);
      frameFocus = [];
      let target = previousFocus;
      while (target?.tagName === "IFRAME" && frameFocus.length < 8) {
        try {
          const inner = (target as HTMLIFrameElement).contentDocument
            ?.activeElement as HTMLElement | null;
          if (!inner || typeof inner.focus !== "function") break;
          frameFocus.push(inner);
          target = inner;
        } catch {
          // Cross-origin game frames retain their browser-managed focus.
          break;
        }
      }
      const ids = new Set<string>();
      commands = getCommands().filter((command) => {
        if (ids.has(command.id)) return false;
        ids.add(command.id);
        return true;
      });
      composing = false;
      input.value = "";
      render();
      dialog.showModal();
      input.setAttribute("aria-expanded", "true");
      input.focus({ preventScroll: true });
    },
    close,
    isOpen: () => dialog.open,
  };
}
