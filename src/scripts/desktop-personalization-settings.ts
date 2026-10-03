import {
  CUSTOMIZATION_EVENT,
  customizationDefaults,
  getCustomization,
  saveCustomization,
  type Customization,
} from "./desktop-customization";
import { wallpapers } from "./desktop-wallpapers";
import { getDesktopHost } from "./desktop-host";
import { installAppStyle } from "./desktop-app-style";
import css from "../styles/desktop-personalization-settings.css?inline";

export function mountPersonalizationSettings(root: HTMLElement) {
  installAppStyle("personalization-settings", css);
  const range = (
    key: string,
    label: string,
    min: number,
    max: number,
    unit: string,
  ) =>
    `<label class="personal-range"><span>${label} <output data-value="${key}"></output></span><input type="range" aria-label="${label}" name="${key}" min="${min}" max="${max}" step="1" data-unit="${unit}"></label>`;
  const toggle = (key: string, label: string) =>
    `<label class="personal-toggle"><input type="checkbox" name="${key}"><span>${label}</span></label>`;
  const select = (key: string, label: string, options: [string, string][]) =>
    `<label class="personal-select"><span>${label}</span><select name="${key}">${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select></label>`;
  root.innerHTML = `
    <nav class="personal-nav" aria-label="Settings sections"><button type="button" data-section="sizing">Size</button><button type="button" data-section="backdrops">Wallpaper</button><button type="button" data-section="sleep">Sleep</button><button type="button" data-section="behavior">Desktop</button><button type="button" data-section="apps">Apps & data</button></nav>
    <label class="personal-search">Find a setting<input type="search" placeholder="Try clock, size, motion…" data-settings-search></label>
    <p data-settings-empty hidden>No matching settings. Try another word.</p>
    <fieldset data-personal-section="sizing"><legend>Size, from tiny to spacious</legend><p>Size app content independently of its window. Settings stays at a readable size so you can always change it back.</p>
      <div class="personal-presets" aria-label="Size presets"><button type="button" data-size="60">Tiny</button><button type="button" data-size="85">Small</button><button type="button" data-size="100">Default</button><button type="button" data-size="140">Large</button><button type="button" data-size="200">Huge</button></div>
      ${range("contentScale", "App content scale", 60, 200, "%")}
      ${range("windowSize", "Floating window size", 30, 100, "%")}
      ${toggle("useDefaultWindowSize", "Use each app’s default opening size")}
      <p>Changing this slider sets the opening size for new floating apps, within their minimum size. Apply it to open floating windows below; tiled panels keep their layout. On phones, windows fill the workspace.</p>
      <button type="button" data-resize-windows>Resize open floating windows</button>
      ${range("iconSize", "Desktop icon size", 24, 112, "px")}
      ${range("dockSize", "Dock height", 44, 100, "px")}
      ${range("titleSize", "Window title bar height", 32, 72, "px")}
      ${range("cornerRadius", "Window corner radius", 0, 24, "px")}
      <p>Touch screens keep comfortable title bars and dock controls.</p>
      <button type="button" data-reset-size>Reset sizes</button>
    </fieldset>
    <fieldset data-personal-section="backdrops"><legend>A view for every mood</legend><p>29 extra wallpapers, made locally in your browser. Animated scenes pause while the tab is hidden or the screensaver is on.</p>
      <div class="wallpaper-gallery" role="group" aria-label="Wallpaper gallery">${wallpapers.map(([id, title, , animation]) => `<button type="button" data-wallpaper="${id}" aria-pressed="false"><span class="wallpaper-sample" aria-hidden="true"></span><span>${title}</span>${animation ? "<small>Animated</small>" : ""}</button>`).join("")}</div>
      ${range("brightness", "Wallpaper brightness", 20, 140, "%")}
      ${range("wallpaperBlur", "Wallpaper blur", 0, 20, "px")}
      ${toggle("animateWallpaper", "Animate live wallpapers")}
      ${range("motionSpeed", "Wallpaper animation cycle", 10, 120, "s")}
      ${select("wallpaperCycle", "Rotate wallpaper automatically", [
        ["0", "Off"],
        ["1", "Every minute"],
        ["5", "Every 5 minutes"],
        ["15", "Every 15 minutes"],
        ["30", "Every 30 minutes"],
        ["60", "Every hour"],
      ])}
      <p>Choose Theme wallpaper to use the original wallpaper controls below. Reduced motion is always respected.</p>
    </fieldset>
    <fieldset data-personal-section="sleep"><legend>Step away</legend><p>A quiet screensaver for this browser desktop. Your apps stay open. It does not lock your device or put the computer to sleep.</p>
      ${select("idleMinutes", "Start after inactivity", [
        ["0", "Never"],
        ["1", "1 minute"],
        ["2", "2 minutes"],
        ["5", "5 minutes"],
        ["10", "10 minutes"],
        ["15", "15 minutes"],
        ["30", "30 minutes"],
        ["60", "1 hour"],
        ["120", "2 hours"],
      ])}
      ${select("saver", "Screensaver scene", [
        ["clock", "Minimal clock"],
        ["aurora", "Aurora light"],
        ["stars", "Star field"],
        ["drift", "Drifting rings"],
        ["blank", "Dark screen"],
      ])}
      ${select("saverColor", "Screensaver color", [
        ["mint", "Mint"],
        ["blue", "Ice blue"],
        ["rose", "Rose"],
        ["amber", "Amber"],
        ["white", "White"],
      ])}
      ${toggle("saverClock", "Show screensaver clock")}${toggle("saverDate", "Show screensaver date")}
      <label class="personal-select"><span>Screensaver message</span><input type="text" name="saverMessage" maxlength="120"></label>
      ${range("saverSpeed", "Screensaver animation cycle", 10, 120, "s")}${range("saverBrightness", "Screensaver scene brightness", 20, 100, "%")}
      ${toggle("wakeOnMove", "Wake when the pointer moves")}
      <p>Click or press any key to wake. Dark screen hides the clock, date, and message. Idle time pauses in background tabs.</p>
      <button type="button" data-sleep-now>Start screensaver</button>
    </fieldset>
    <fieldset data-personal-section="behavior"><legend>Desktop details</legend>
      ${toggle("showBranding", "Show wallpaper caption")}${toggle("showIconLabels", "Show shortcut labels")}${toggle("windowShadows", "Show window shadows")}${toggle("showDate", "Show dock date")}${toggle("clockSeconds", "Show clock seconds")}${toggle("clock12", "Use a 12-hour clock")}
      ${range("toastSeconds", "Notification display time", 3, 30, "s")}
      <p>Use Activity for Do Not Disturb, notification history, and favorite apps.</p><button type="button" data-settings-app="activity">Open Activity</button>
    </fieldset>
    <fieldset data-personal-section="apps"><legend>Apps & data</legend><p>Each app keeps its own controls. Jump to the tools you want to customize.</p>
      <div class="personal-presets"><button type="button" data-settings-app="workspaces">Workspaces & tiling</button><button type="button" data-settings-app="windows">Window Overview</button><button type="button" data-settings-app="focus">Focus timer</button><button type="button" data-settings-app="soundscape">Soundscape</button><button type="button" data-settings-app="backup">Data Center</button></div>
      <p>Appearance backups include these settings. Changes stay in this browser.</p><button type="button" data-reset-personal>Reset personalization</button>
    </fieldset>
    <p class="desk-app-status" role="status" data-personal-status></p>`;
  root.querySelectorAll<HTMLElement>("[data-wallpaper]").forEach((button) => {
    const scene = wallpapers.find(([id]) => id === button.dataset.wallpaper)!;
    (
      button.querySelector(".wallpaper-sample") as HTMLElement
    ).style.background = scene[2];
  });
  const status = root.querySelector<HTMLElement>("[data-personal-status]")!;
  function draw() {
    const p = getCustomization().value;
    root
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[name]")
      .forEach((input) => {
        const value = p[input.name as keyof Customization];
        if (input instanceof HTMLInputElement && input.type === "checkbox")
          input.checked = value === true;
        else input.value = String(value);
        const output = root.querySelector<HTMLOutputElement>(
          `[data-value="${input.name}"]`,
        );
        if (output) {
          output.value = `${value}${input.dataset.unit}`;
          input.setAttribute("aria-valuetext", output.value);
        }
      });
    root
      .querySelectorAll<HTMLElement>("[data-wallpaper]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.wallpaper === p.wallpaper),
        ),
      );
    root
      .querySelectorAll<HTMLElement>("[data-size]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.size) === p.contentScale),
        ),
      );
    status.textContent = getCustomization().message;
  }
  const search = root.querySelector<HTMLInputElement>(
    "[data-settings-search]",
  )!;
  const fieldsets = () => [
    ...root
      .closest(".settings-app")!
      .querySelectorAll<HTMLFieldSetElement>("fieldset"),
  ];
  function filter() {
    const query = search.value.toLowerCase().trim();
    const sections = fieldsets();
    sections.forEach((section) => {
      section.hidden = !section.textContent!.toLowerCase().includes(query);
    });
    root.querySelector<HTMLElement>("[data-settings-empty]")!.hidden =
      sections.some((section) => !section.hidden);
  }
  function change(event: Event) {
    const input = event.target;
    if (
      !(
        input instanceof HTMLInputElement || input instanceof HTMLSelectElement
      ) ||
      !input.name
    )
      return;
    const fallback = customizationDefaults()[input.name as keyof Customization];
    const value =
      typeof fallback === "number"
        ? Number(input.value)
        : input instanceof HTMLInputElement && input.type === "checkbox"
          ? input.checked
          : input.value;
    saveCustomization({
      [input.name]: value,
      ...(input.name === "windowSize" ? { useDefaultWindowSize: false } : {}),
    });
  }
  function click(event: Event) {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "button",
    );
    if (!button) return;
    if (button.dataset.wallpaper)
      saveCustomization({
        wallpaper: button.dataset.wallpaper as Customization["wallpaper"],
      });
    if (button.dataset.size)
      saveCustomization({ contentScale: Number(button.dataset.size) });
    if (button.dataset.section) {
      search.value = "";
      filter();
      root
        .querySelector<HTMLElement>(
          `[data-personal-section="${button.dataset.section}"]`,
        )!
        .scrollIntoView({ block: "start", behavior: "instant" });
    }
    if (button.hasAttribute("data-sleep-now"))
      document.dispatchEvent(new Event("desktop-sleep"));
    if (button.hasAttribute("data-resize-windows"))
      document.dispatchEvent(new Event("desktop-resize-floating"));
    if (button.hasAttribute("data-reset-size")) {
      const {
        contentScale,
        iconSize,
        dockSize,
        titleSize,
        cornerRadius,
        windowSize,
      } = customizationDefaults();
      saveCustomization({
        contentScale,
        iconSize,
        dockSize,
        titleSize,
        cornerRadius,
        windowSize,
        useDefaultWindowSize: true,
      });
    }
    if (button.hasAttribute("data-reset-personal"))
      saveCustomization(customizationDefaults());
    if (button.dataset.settingsApp)
      getDesktopHost().openApp(
        button.dataset.settingsApp as Parameters<
          ReturnType<typeof getDesktopHost>["openApp"]
        >[0],
      );
  }
  root.addEventListener("change", change);
  root.addEventListener("click", click);
  search.addEventListener("input", filter);
  document.addEventListener(CUSTOMIZATION_EVENT, draw);
  draw();
  return () => {
    root.removeEventListener("change", change);
    root.removeEventListener("click", click);
    document.removeEventListener(CUSTOMIZATION_EVENT, draw);
    search.removeEventListener("input", filter);
  };
}
