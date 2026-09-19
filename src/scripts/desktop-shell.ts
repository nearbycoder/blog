import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";

type ShellActions = {
  app: (id: DesktopAppId) => void;
  library: () => void;
  folder: (id: string) => void;
  arcade: () => void;
  terminal: () => void;
  ghostty: () => void;
  doom: () => void;
  game: (activity: "snake" | "pong" | "puzzle") => void;
  file: (link: HTMLAnchorElement) => void;
};

export function mountDesktopShell(desktop: HTMLElement, actions: ShellActions) {
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    desktop.querySelector<T>(selector)!;
  const launcher = find("#desktop-launcher");
  const launchButton = find<HTMLButtonElement>("[data-launcher-toggle]");
  const launchSearch = find<HTMLInputElement>("[data-launcher-search]");
  const calendar = find("#desktop-calendar");
  const calendarButton = find<HTMLButtonElement>("[data-calendar-toggle]");
  const results = find("[data-launcher-results]");
  const sources = [
    ...desktop.querySelectorAll<HTMLAnchorElement>("[data-desktop-file]"),
  ];
  const applications = [
    ...desktopApps.map((app) => ({
      ...app,
      action: () => actions.app(app.id),
    })),
    {
      title: "Files",
      description: "File manager · all blog content",
      keywords: "library writing posts",
      action: actions.library,
    },
    {
      title: "Arcade",
      description: "Six games & a pocket terminal",
      keywords: "games play",
      action: actions.arcade,
    },
    {
      title: "Ghostty",
      description: "Connected terminal · tabs & split panes",
      keywords: "ghosty ssh terminal multiplexer shell remote",
      action: actions.ghostty,
    },
    {
      title: "Terminal",
      description: "Pocket shell · type help to explore",
      keywords: "console commands coffee",
      action: actions.terminal,
    },
    {
      title: "DOOM",
      description: "Shareware Episode One · id Software",
      keywords: "doom shooter game",
      action: actions.doom,
    },
    ...(
      [
        ["snake", "Snake", "Eat, grow, avoid your tail"],
        ["pong", "Pong", "You versus the computer · first to seven"],
        ["puzzle", "15 Puzzle", "Slide fifteen tiles into order"],
      ] as const
    ).map(([id, title, description]) => ({
      title,
      description,
      keywords: "classic games play arcade",
      action: () => actions.game(id),
    })),
  ];
  function closeLauncher(focus = false) {
    launcher.hidden = true;
    launchButton.setAttribute("aria-expanded", "false");
    if (focus) launchButton.focus();
  }
  function closeCalendar(focus = false) {
    calendar.hidden = true;
    calendarButton.setAttribute("aria-expanded", "false");
    if (focus) calendarButton.focus();
  }
  function searchApplications() {
    const query = launchSearch.value.trim().toLowerCase();
    find("[data-launcher-default]").hidden = Boolean(query);
    results.hidden = !query;
    const list = results.querySelector("ul")!;
    list.replaceChildren();
    if (!query) return;
    const matches = [
      ...applications
        .filter((app) =>
          `${app.title} ${app.description} ${app.keywords}`
            .toLowerCase()
            .includes(query),
        )
        .sort(
          (a, b) =>
            Number(b.title.toLowerCase().startsWith(query)) -
            Number(a.title.toLowerCase().startsWith(query)),
        ),
      ...sources
        .filter((link) =>
          link
            .closest<HTMLElement>("[data-file]")!
            .dataset.fileSearch!.includes(query),
        )
        .map((link) => ({
          title: link.dataset.fileTitle!,
          description: link.pathname,
          action: () => actions.file(link),
        })),
    ];
    find("[data-launcher-count]").textContent = matches.length
      ? `${matches.length} results${matches.length > 12 ? " · showing the first 12" : ""}`
      : "No results. Try a different search.";
    matches.slice(0, 12).forEach((match) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      const title = document.createElement("strong");
      title.textContent = match.title;
      const description = document.createElement("span");
      description.textContent = match.description;
      button.append(title, description);
      button.addEventListener("click", () => {
        closeLauncher();
        match.action();
      });
      li.append(button);
      list.append(li);
    });
  }
  function toggleLauncher() {
    if (!launcher.hidden) {
      closeLauncher(true);
      return;
    }
    closeCalendar();
    launcher.hidden = false;
    launchButton.setAttribute("aria-expanded", "true");
    launchSearch.value = "";
    searchApplications();
    launchSearch.focus();
  }
  launchButton.addEventListener("click", toggleLauncher);
  launchSearch.addEventListener("input", searchApplications);
  launchSearch.addEventListener("keydown", (event) => {
    if (["ArrowDown", "Enter"].includes(event.key) && !results.hidden) {
      const first = results.querySelector<HTMLButtonElement>("button");
      if (first) {
        event.preventDefault();
        event.key === "Enter" ? first.click() : first.focus();
      }
    }
  });
  results.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    const buttons = [...results.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = index + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0) launchSearch.focus();
    else buttons[Math.min(next, buttons.length - 1)]?.focus();
  });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-launch-action]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        closeLauncher();
        const action = button.dataset.launchAction as
          "library" | "arcade" | "terminal" | "ghostty";
        actions[action]();
      });
    });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-launch-app]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        closeLauncher();
        actions.app(button.dataset.launchApp as DesktopAppId);
      });
    });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-launch-folder]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        closeLauncher();
        actions.folder(button.dataset.launchFolder!);
      });
    });
  find("[data-open-terminal]").addEventListener("click", actions.terminal);
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-file-view]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        find(".library-content").dataset.view = button.dataset.fileView;
        desktop
          .querySelectorAll("[data-file-view]")
          .forEach((other) =>
            other.setAttribute("aria-pressed", String(other === button)),
          );
      });
    });

  let monthOffset = 0;
  function drawCalendar() {
    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    find("[data-calendar-month]").textContent = month.toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" },
    );
    const grid = find("[data-calendar-days]");
    grid.replaceChildren();
    for (let i = 0; i < month.getDay(); i++) {
      const empty = document.createElement("span");
      empty.setAttribute("aria-hidden", "true");
      grid.append(empty);
    }
    const count = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    for (let day = 1; day <= count; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const cell = document.createElement("time");
      cell.textContent = String(day);
      cell.dateTime = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cell.setAttribute(
        "aria-label",
        date.toLocaleDateString(undefined, { dateStyle: "full" }),
      );
      if (monthOffset === 0 && day === now.getDate())
        cell.setAttribute("aria-current", "date");
      grid.append(cell);
    }
  }
  function updateClock() {
    const now = new Date();
    const clock = find<HTMLTimeElement>("[data-panel-time]");
    clock.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    clock.dateTime = now.toISOString();
    find("[data-panel-date]").textContent = now.toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    calendarButton.title = now.toLocaleDateString(undefined, {
      dateStyle: "full",
    });
    if (!calendar.hidden) drawCalendar();
  }
  updateClock();
  window.setInterval(() => {
    if (!document.hidden) updateClock();
  }, 30_000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateClock();
  });
  calendarButton.addEventListener("click", () => {
    if (!calendar.hidden) {
      closeCalendar(true);
      return;
    }
    closeLauncher();
    monthOffset = 0;
    drawCalendar();
    calendar.hidden = false;
    calendarButton.setAttribute("aria-expanded", "true");
    find<HTMLButtonElement>("[data-calendar-today]").focus();
  });
  desktop
    .querySelectorAll<HTMLButtonElement>("[data-calendar-step]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        monthOffset += Number(button.dataset.calendarStep);
        drawCalendar();
      });
    });
  find("[data-calendar-today]").addEventListener("click", () => {
    monthOffset = 0;
    drawCalendar();
  });
  document.addEventListener("pointerdown", (event) => {
    const target = event.target as Node;
    if (!launcher.contains(target) && !launchButton.contains(target))
      closeLauncher();
    if (!calendar.contains(target) && !calendarButton.contains(target))
      closeCalendar();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!launcher.hidden) {
      event.preventDefault();
      closeLauncher(true);
    }
    if (!calendar.hidden) {
      event.preventDefault();
      closeCalendar(true);
    }
  });
  return {
    toggleLauncher,
    closePopups: () => {
      closeLauncher();
      closeCalendar();
    },
  };
}
