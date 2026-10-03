import css from "../styles/desktop-activity.css?inline";
import { desktopApps, type DesktopAppId } from "../lib/desktop-apps";
import { installAppStyle } from "./desktop-app-style";
import { getDesktopHost } from "./desktop-host";
import {
  ACTIVITY_CHANGED,
  getActivityStore,
  updateActivity,
  type ActivityKind,
} from "./desktop-activity-service";

installAppStyle("activity", css);

export function mountApp(root: HTMLElement) {
  const store = getActivityStore();
  root.classList.add("activity-app");
  root.innerHTML = `
    <header class="activity-heading"><h2>A little more in the loop</h2><p>Recent desktop activity and the apps you reach for most.</p></header>
    <label class="activity-quiet"><input type="checkbox" data-activity-quiet><span><strong>Do not disturb</strong><small>Keep a history, without notification pop-ups.</small></span></label>
    <section aria-label="Notification history">
      <div class="activity-section-heading"><h3>Notification history</h3><span data-activity-total></span></div>
      <div class="activity-toolbar"><label>Show <select data-activity-filter aria-label="Filter notification type"><option value="all">All activity</option><option value="app">Apps</option><option value="system">System</option><option value="reminder">Reminders</option></select></label><button type="button" data-activity-read>Mark all read</button><button type="button" data-activity-clear>Clear history</button></div>
      <ul class="activity-history" data-activity-history></ul>
      <p class="activity-empty" data-activity-empty></p>
    </section>
    <section aria-label="Launcher favorites"><div class="activity-section-heading"><h3>Launcher favorites</h3><span data-favorites-total></span></div><p class="activity-help">Pin up to 8 apps. Your choices appear at the top of the launcher.</p><div class="activity-favorites" data-activity-favorites></div></section>
    <section aria-label="Recently opened apps"><div class="activity-section-heading"><h3>Recently opened apps</h3><button type="button" data-activity-recent-clear>Clear recent apps</button></div><div class="activity-recent" data-activity-recent></div></section>
    <p class="desk-app-status" data-activity-status role="status"></p>
  `;
  const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const history = find("[data-activity-history]");
  const favorites = find("[data-activity-favorites]");
  const recent = find("[data-activity-recent]");
  const filter = find<HTMLSelectElement>("[data-activity-filter]");
  const quiet = find<HTMLInputElement>("[data-activity-quiet]");
  const status = find("[data-activity-status]");
  const timeFormat = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  let feedback = "";

  function draw() {
    const focused =
      document.activeElement instanceof HTMLButtonElement &&
      root.contains(document.activeElement)
        ? document.activeElement
        : null;
    const focusKey =
      focused &&
      ["activityDismiss", "activityPin", "activityLaunch"].find(
        (key) => focused.dataset[key],
      );
    const focusValue = focusKey ? focused!.dataset[focusKey] : undefined;
    const state = store.value;
    quiet.checked = state.dnd;
    find("[data-activity-total]").textContent =
      `${state.history.length} saved · ${state.history.filter((entry) => !entry.read).length} unread`;
    find<HTMLButtonElement>("[data-activity-read]").disabled =
      state.history.every((entry) => entry.read);
    find<HTMLButtonElement>("[data-activity-clear]").disabled =
      state.history.length === 0;
    const entries = state.history.filter(
      (entry) =>
        filter.value === "all" || entry.kind === (filter.value as ActivityKind),
    );
    history.replaceChildren();
    for (const entry of entries) {
      const row = document.createElement("li");
      row.dataset.activityEntry = entry.id;
      row.dataset.activityKind = entry.kind;
      row.dataset.activityRead = String(entry.read);
      const body = document.createElement("div");
      const message = document.createElement("p");
      message.textContent = entry.message;
      const meta = document.createElement("small");
      const time = document.createElement("time");
      time.dateTime = new Date(entry.createdAt).toISOString();
      time.textContent = timeFormat.format(entry.createdAt);
      meta.append(
        document.createTextNode(
          `${entry.kind[0].toUpperCase()}${entry.kind.slice(1)} · `,
        ),
        time,
        document.createTextNode(entry.read ? "" : " · Unread"),
      );
      body.append(message, meta);
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.dataset.activityDismiss = entry.id;
      dismiss.textContent = "Dismiss";
      dismiss.setAttribute("aria-label", `Dismiss: ${entry.message}`);
      row.append(body, dismiss);
      history.append(row);
    }
    const empty = find("[data-activity-empty]");
    empty.hidden = entries.length > 0;
    empty.textContent = state.history.length
      ? "No notifications of this type."
      : "All caught up. Desktop activity will appear here.";
    find("[data-favorites-total]").textContent =
      `${state.favorites.length} / 8 pinned`;
    favorites.replaceChildren();
    for (const app of desktopApps) {
      const button = document.createElement("button");
      const pinned = state.favorites.includes(app.id);
      button.type = "button";
      button.dataset.activityPin = app.id;
      button.setAttribute("aria-pressed", String(pinned));
      button.setAttribute(
        "aria-label",
        `${pinned ? "Unpin" : "Pin"} ${app.title}`,
      );
      button.disabled = !pinned && state.favorites.length >= 8;
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = pinned ? "★" : "☆";
      button.append(icon, document.createTextNode(app.title));
      favorites.append(button);
    }
    recent.replaceChildren();
    find<HTMLButtonElement>("[data-activity-recent-clear]").disabled =
      state.recent.length === 0;
    for (const id of state.recent) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.activityLaunch = id;
      button.textContent = desktopApps.find((app) => app.id === id)!.title;
      recent.append(button);
    }
    if (!state.recent.length) {
      const empty = document.createElement("p");
      empty.className = "activity-empty";
      empty.textContent = "Apps you open will appear here.";
      recent.append(empty);
    }
    status.textContent = `${feedback ? `${feedback} ` : ""}${store.message}`;
    if (focusKey)
      [...root.querySelectorAll<HTMLButtonElement>("button")]
        .find((button) => button.dataset[focusKey] === focusValue)
        ?.focus();
  }
  function click(event: Event) {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button");
    if (!button || button.disabled) return;
    const state = store.value;
    if (button.dataset.activityDismiss) {
      const index = [...history.querySelectorAll("button")].indexOf(button);
      feedback = "Notification dismissed.";
      updateActivity({
        history: state.history.filter(
          (entry) => entry.id !== button.dataset.activityDismiss,
        ),
      });
      const remaining = history.querySelectorAll<HTMLButtonElement>("button");
      (remaining[Math.min(index, remaining.length - 1)] ?? filter).focus();
    } else if (button.hasAttribute("data-activity-read")) {
      feedback = "All notifications marked as read.";
      updateActivity({
        history: state.history.map((entry) => ({ ...entry, read: true })),
      });
      filter.focus();
    } else if (button.hasAttribute("data-activity-clear")) {
      feedback = "Notification history cleared.";
      updateActivity({ history: [] });
      filter.focus();
    } else if (button.dataset.activityPin) {
      const id = button.dataset.activityPin as DesktopAppId;
      const pinned = state.favorites.includes(id);
      if (!pinned && state.favorites.length >= 8) return;
      feedback = pinned
        ? "App removed from launcher favorites."
        : "App pinned to launcher favorites.";
      updateActivity({
        favorites: pinned
          ? state.favorites.filter((app) => app !== id)
          : [...state.favorites, id],
      });
      favorites
        .querySelector<HTMLButtonElement>(`[data-activity-pin="${id}"]`)
        ?.focus();
    } else if (button.hasAttribute("data-activity-recent-clear")) {
      feedback = "Recently opened apps cleared.";
      updateActivity({ recent: [] });
      filter.focus();
    } else if (button.dataset.activityLaunch)
      getDesktopHost()?.openApp(button.dataset.activityLaunch as DesktopAppId);
  }
  function change(event: Event) {
    if (event.target === quiet) {
      feedback = quiet.checked
        ? "Do not disturb is on."
        : "Do not disturb is off.";
      updateActivity({ dnd: quiet.checked });
    } else if (event.target === filter) draw();
  }
  root.addEventListener("click", click);
  root.addEventListener("change", change);
  document.addEventListener(ACTIVITY_CHANGED, draw);
  // Opening the history is the read action; future messages still get an unread badge.
  if (store.value.history.some((entry) => !entry.read))
    updateActivity({
      history: store.value.history.map((entry) => ({ ...entry, read: true })),
    });
  else draw();
  return () => {
    root.removeEventListener("click", click);
    root.removeEventListener("change", change);
    document.removeEventListener(ACTIVITY_CHANGED, draw);
  };
}
