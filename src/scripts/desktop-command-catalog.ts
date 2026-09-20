import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
import type { DesktopCommand } from "./desktop-commands";
import type { ArcadeActivity } from "./desktop-arcade";
import type { WindowLayout } from "./desktop-window-layout";

type CommandContext = {
  desktop: HTMLElement;
  windows: HTMLElement[];
  readers: HTMLAnchorElement[];
  mobile: boolean;
  showingDesktop: boolean;
  app: (id: DesktopAppId) => void;
  arcade: (activity?: ArcadeActivity) => void;
  ghostty: () => void;
  file: (link: HTMLAnchorElement) => void;
  activate: (win: HTMLElement, focus: boolean) => void;
  layout: (win: HTMLElement, layout?: WindowLayout) => void;
};

/** Build a fresh menu from shell metadata; never import application code here. */
export function createDesktopCommands(
  context: CommandContext,
): DesktopCommand[] {
  const { desktop } = context;
  const icon = (selector: string) =>
    desktop.querySelector(`${selector} .desktop-icon`) ?? undefined;
  const click = (selector: string) =>
    desktop.querySelector<HTMLButtonElement>(selector)?.click();
  const commands: DesktopCommand[] = desktopApps.map((app) => ({
    id: `app:${app.id}`,
    title: app.title,
    description: app.description,
    keywords: app.keywords,
    group: "Applications",
    icon: icon(`[data-launch-app="${app.id}"]`),
    run: () => context.app(app.id),
  }));
  commands.push(
    {
      id: "arcade",
      title: "Arcade",
      description: "Classic games and a pocket terminal",
      keywords: "games play",
      group: "Applications",
      icon: icon("[data-open-arcade]"),
      run: () => context.arcade(),
    },
    {
      id: "ghostty",
      title: "Ghostty",
      description: "Connected terminal · tabs and split panes",
      keywords: "ghosty ssh terminal multiplexer remote shell",
      group: "Applications",
      icon: icon("[data-open-ghostty]"),
      run: context.ghostty,
    },
    ...(
      [
        ["terminal", "Terminal", "Pocket shell · type help to explore"],
        ["doom", "DOOM", "Shareware Episode One"],
        ["snake", "Snake", "Eat, grow, avoid your tail"],
        ["pong", "Pong", "You versus the computer"],
        ["puzzle", "15 Puzzle", "Slide fifteen tiles into order"],
        ["memory", "Memory", "Find the matching pairs"],
        ["sweep", "Bug Sweep", "Clear the field without finding a bug"],
      ] as const
    ).map(([id, title, description]): DesktopCommand => ({
      id: `arcade:${id}`,
      title,
      description,
      group: "Applications",
      keywords: "classic games play arcade",
      icon: icon("[data-open-arcade]"),
      run: () => context.arcade(id),
    })),
  );
  for (const win of context.windows.sort(
    (a, b) => Number(b.style.zIndex) - Number(a.style.zIndex),
  )) {
    if (win.dataset.window === "library" && win.dataset.opened !== "true")
      continue;
    commands.push({
      id: `window:${win.dataset.window}`,
      title: `Switch to ${win.dataset.title ?? "Library"}`,
      description: win.hidden
        ? "Restore minimized window"
        : "Bring window to front",
      group: "Open windows",
      icon: win.querySelector(".desktop-icon") ?? undefined,
      run: () => context.activate(win, true),
    });
  }
  for (const [id, title, description, selector] of [
    [
      "library",
      "Open Library",
      "Browse all blog content",
      "[data-show-library]",
    ],
    [
      "theme",
      "Toggle color theme",
      "Switch between light and dark",
      "[data-desktop-theme]",
    ],
    [
      "show",
      context.showingDesktop ? "Restore windows" : "Show desktop",
      "Toggle all visible windows",
      "[data-show-desktop]",
    ],
    [
      "arrange",
      "Arrange windows",
      "Reset window positions and open Library",
      "[data-desktop-reset]",
    ],
  ]) {
    commands.push({
      id: `desktop:${id}`,
      title,
      description,
      group: "Desktop",
      icon: icon(selector),
      run: () => click(selector),
    });
  }
  const active = context.windows.find(
    (win) => !win.hidden && win.classList.contains("is-active"),
  );
  if (active) {
    const description = active.dataset.title ?? "Library";
    for (const action of ["minimize", "close"] as const) {
      commands.push({
        id: `active:${action}`,
        title: action === "minimize" ? "Minimize window" : "Close window",
        description,
        group: "Desktop",
        run: () =>
          active
            .querySelector<HTMLButtonElement>(
              `[data-window-action="${action}"]`,
            )
            ?.click(),
      });
    }
    if (!context.mobile) {
      const maximized = active.classList.contains("is-maximized");
      commands.push({
        id: "active:maximize",
        title: maximized ? "Restore window" : "Maximize window",
        description,
        group: "Desktop",
        run: () => context.layout(active, maximized ? undefined : "maximized"),
      });
      if (!maximized && active.dataset.snap)
        commands.push({
          id: "active:restore",
          title: "Restore window",
          description,
          group: "Desktop",
          run: () => context.layout(active),
        });
      for (const layout of [
        "left",
        "right",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ] as const) {
        commands.push({
          id: `active:${layout}`,
          title: `Snap ${layout.replace("-", " ")}`,
          description,
          group: "Desktop",
          keywords: "tile split window",
          run: () => context.layout(active, layout),
        });
      }
    }
  }
  for (const link of context.readers) {
    commands.push({
      id: `file:${link.pathname}`,
      title: link.dataset.fileTitle!,
      description: link.pathname,
      group: "Files",
      keywords: link.closest<HTMLElement>("[data-file]")?.dataset.fileSearch,
      icon: link.querySelector(".desktop-icon") ?? undefined,
      run: () => context.file(link),
    });
  }
  return commands;
}
