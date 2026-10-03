import type { DesktopAppId } from "../lib/desktop-apps";
import type { WindowLayout } from "./desktop-window-layout";

/** A small shared adapter: lazy tools use the real window lifecycle. */
export type DesktopHost = {
  desktop: HTMLElement;
  windows: () => HTMLElement[];
  activate: (win: HTMLElement) => void;
  minimize: (win: HTMLElement) => void;
  close: (win: HTMLElement) => void;
  layout: (win: HTMLElement, layout?: WindowLayout) => void;
  openApp: (id: DesktopAppId) => void;
  openFile: (path: string) => void;
  pin: (win: HTMLElement, pinned: boolean) => void;
  reopen: () => boolean;
  canReopen: () => boolean;
  announce: (message: string) => void;
  changed: () => void;
  prepareDataRestore: (keys: readonly string[]) => () => void;
};

let host: DesktopHost;
export function setDesktopHost(value: DesktopHost) {
  host = value;
}
export function getDesktopHost() {
  return host;
}
export function desktopChanged() {
  document.dispatchEvent(new CustomEvent("desktop-windows-changed"));
}

export function notifyDesktop(
  message: string,
  kind: "system" | "app" | "reminder" = "app",
) {
  document.dispatchEvent(
    new CustomEvent("desktop-notify", { detail: { message, kind } }),
  );
}
