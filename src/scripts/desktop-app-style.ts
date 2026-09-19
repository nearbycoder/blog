/** Keep utility CSS inside its lazy module; Astro otherwise hoists CSS imports. */
export function installAppStyle(id: string, css: string) {
  const key = `desktop-app-style-${id}`;
  if (document.getElementById(key)) return;
  const style = document.createElement("style");
  style.id = key;
  style.dataset.desktopAppStyle = id;
  style.textContent = css;
  document.head.append(style);
}
