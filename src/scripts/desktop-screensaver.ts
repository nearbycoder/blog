import { getCustomization } from "./desktop-customization";
import { installAppStyle } from "./desktop-app-style";
import css from "../styles/desktop-screensaver.css?inline";

export function showScreensaver(desktop: HTMLElement, onWake: () => void) {
  installAppStyle("screensaver", css);
  const p = getCustomization().value;
  const previous = document.activeElement as HTMLElement | null;
  const dialog = document.createElement("dialog");
  dialog.className = "desktop-screensaver";
  dialog.setAttribute("aria-label", "Desktop screensaver");
  dialog.dataset.scene = p.saver;
  dialog.dataset.reducedMotion = desktop.dataset.desktopReduceMotion ?? "false";
  dialog.style.setProperty(
    "--saver-color",
    {
      mint: "#b8ead8",
      blue: "#b4d5ff",
      rose: "#edbfd1",
      amber: "#eed09f",
      white: "#e7ecf0",
    }[p.saverColor],
  );
  dialog.style.setProperty("--saver-speed", `${p.saverSpeed}s`);
  dialog.style.setProperty(
    "--saver-brightness",
    String(p.saverBrightness / 100),
  );
  dialog.innerHTML = `<div class="saver-scene" aria-hidden="true"><i></i><i></i><i></i></div><div class="saver-content"><time></time><p class="saver-date"></p><p class="saver-message"></p></div><button type="button">Wake desktop</button><p class="saver-hint">Press any key or click to return. Your apps stay open.</p>`;
  dialog.querySelector(".saver-message")!.textContent = p.saverMessage;
  const clock = dialog.querySelector("time")!;
  const date = dialog.querySelector<HTMLElement>(".saver-date")!;
  clock.hidden = !p.saverClock || p.saver === "blank";
  date.hidden = !p.saverDate || p.saver === "blank";
  dialog.querySelector<HTMLElement>(".saver-message")!.hidden =
    p.saver === "blank";
  function tick() {
    if (document.hidden) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: p.clockSeconds ? "2-digit" : undefined,
      hour12: p.clock12,
    });
    clock.dateTime = now.toISOString();
    date.textContent = now.toLocaleDateString(undefined, { dateStyle: "full" });
  }
  tick();
  const timer = setInterval(tick, 1000);
  const visibility = () => {
    dialog.dataset.paused = String(document.hidden);
    tick();
  };
  document.addEventListener("visibilitychange", visibility);
  let closed = false;
  function wake(event?: Event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    if (closed) return;
    closed = true;
    clearInterval(timer);
    document.removeEventListener("visibilitychange", visibility);
    dialog.close();
    dialog.remove();
    onWake();
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  }
  dialog.addEventListener("click", wake, true);
  dialog.addEventListener("keydown", wake, true);
  dialog.addEventListener("cancel", wake);
  dialog.addEventListener("close", () => wake());
  let start: [number, number] | undefined;
  if (p.wakeOnMove)
    dialog.addEventListener("pointermove", (event) => {
      if (!start) start = [event.clientX, event.clientY];
      else if (
        Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 8
      )
        wake(event);
    });
  document.body.append(dialog);
  dialog.showModal();
}
