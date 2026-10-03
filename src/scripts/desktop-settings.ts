import css from "../styles/desktop-settings.css?inline";
import { installAppStyle } from "./desktop-app-style";
import {
  applyDesktopPreferences,
  defaultDesktopPreferences,
  getDesktopPreferencesStore,
  type DesktopPreferences,
} from "./desktop-preferences";

installAppStyle("settings", css);

export function mountApp(root: HTMLElement) {
  const desktop = root.closest<HTMLElement>("[data-desktop]");
  if (!desktop) return;
  const store = getDesktopPreferencesStore();
  root.classList.add("settings-app");
  root.innerHTML = `
    <header class="settings-heading"><h2>Make this desktop yours</h2><p>Appearance changes apply immediately and stay in this browser.</p></header>
    <div class="settings-options">
      <fieldset><legend>Accent color</legend><p>Highlights, selected controls, and window borders.</p>
        <div class="settings-choices settings-palettes">
          <label><input type="radio" name="accent" value="emerald"><span class="settings-swatch" data-palette="emerald" aria-hidden="true"></span><span>Emerald</span></label>
          <label><input type="radio" name="accent" value="blue"><span class="settings-swatch" data-palette="blue" aria-hidden="true"></span><span>Blue</span></label>
          <label><input type="radio" name="accent" value="violet"><span class="settings-swatch" data-palette="violet" aria-hidden="true"></span><span>Violet</span></label>
          <label><input type="radio" name="accent" value="amber"><span class="settings-swatch" data-palette="amber" aria-hidden="true"></span><span>Amber</span></label>
        </div>
      </fieldset>
      <fieldset><legend>Wallpaper</legend><p>A backdrop for your workspace.</p>
        <div class="settings-choices settings-wallpapers">
          <label><input type="radio" name="wallpaper" value="glass"><span>Emerald glass</span></label>
          <label><input type="radio" name="wallpaper" value="plain"><span>Quiet solid</span></label>
          <label><input type="radio" name="wallpaper" value="grid"><span>Drafting grid</span></label>
        </div>
      </fieldset>
      <fieldset><legend>Control spacing</legend><p>Compact fits more controls on a large screen. Touch targets keep their comfortable size.</p>
        <div class="settings-choices">
          <label><input type="radio" name="density" value="comfortable"><span>Comfortable</span></label>
          <label><input type="radio" name="density" value="compact"><span>Compact</span></label>
        </div>
      </fieldset>
      <fieldset><legend>Interface text</legend><p>Larger labels and controls, without resizing your windows.</p>
        <div class="settings-choices">
          <label><input type="radio" name="textSize" value="standard"><span>Standard</span></label>
          <label><input type="radio" name="textSize" value="large"><span>Larger</span></label>
        </div>
      </fieldset>
      <fieldset><legend>Comfort & visibility</legend>
        <label class="settings-toggle"><input type="checkbox" name="reduceMotion"><span><strong>Reduce motion</strong><small>Skip window animations and control transitions. Your system’s reduced-motion preference is always respected.</small></span></label>
        <label class="settings-toggle"><input type="checkbox" name="reduceTransparency"><span><strong>Reduce transparency</strong><small>Use solid panels and menus for clearer contrast.</small></span></label>
        <label class="settings-toggle"><input type="checkbox" name="showShortcuts"><span><strong>Show desktop shortcuts</strong><small>Apps and files are still available from the launcher when shortcuts are hidden.</small></span></label>
      </fieldset>
    </div>
    <footer class="settings-footer"><button type="button" data-settings-reset>Restore default appearance</button><p class="desk-app-status" role="status" data-settings-status></p></footer>
  `;
  const status = root.querySelector<HTMLElement>("[data-settings-status]")!;
  const inputs = root.querySelectorAll<HTMLInputElement>("input");

  function draw() {
    inputs.forEach((input) => {
      const value = store.value[input.name as keyof DesktopPreferences];
      input.checked =
        input.type === "checkbox" ? value === true : value === input.value;
    });
    status.textContent = store.message;
    applyDesktopPreferences(desktop!);
  }

  function change(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const next = {
      ...store.value,
      [input.name]: input.type === "checkbox" ? input.checked : input.value,
    };
    store.save(next);
    draw();
  }

  root.addEventListener("change", change);
  const reset = root.querySelector<HTMLButtonElement>("[data-settings-reset]")!;
  const restore = () => {
    store.save(defaultDesktopPreferences());
    draw();
    status.textContent = `Default appearance restored. ${store.message}`;
  };
  reset.addEventListener("click", restore);
  draw();
  return () => {
    root.removeEventListener("change", change);
    reset.removeEventListener("click", restore);
  };
}
