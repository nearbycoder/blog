/**
 * Volcanic Ink & Liquid Glass motion choreography:
 * - Scroll-triggered staggered reveals (progressive enhancement, never traps content invisible)
 * - Pointer-tracked specular glass rim light on interactive surfaces
 * - Magnetic micro-lift on primary molten-chartreuse CTA pills
 * - Hairline luminous reading progress ribbon on long-form pages
 */
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

if (!reduced.matches && !document.documentElement.dataset.desktopReader) {
  initReveals();
  initSpecularGlass();
  initMagneticButtons();
  initReadingProgress();
}

function initReveals() {
  const targets = [
    ...document.querySelectorAll<HTMLElement>(
      ".home-section, .article-card, .project-card, .door, .timeline li, .log-card, .path-card, .lab-entry, .uses-section, .now-grid > *",
    ),
  ];
  if (!targets.length || !("IntersectionObserver" in window)) return;

  const viewportH = window.innerHeight || 900;
  const pending: HTMLElement[] = [];

  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewportH * 0.92) continue;
    el.dataset.atelierReveal = "pending";
    pending.push(el);
  }

  if (!pending.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      let batch = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.setProperty("--reveal-delay", `${Math.min(batch * 65, 260)}ms`);
        el.dataset.atelierReveal = "visible";
        observer.unobserve(el);
        batch++;
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
  );

  for (const el of pending) observer.observe(el);

  document.addEventListener("atelier:grid-updated", (event) => {
    const scope =
      event.target instanceof Element ? event.target : document;
    const h = window.innerHeight || 900;
    let batch = 0;
    for (const el of scope.querySelectorAll<HTMLElement>(
      '[data-atelier-reveal="pending"]',
    )) {
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0) continue;
      if (rect.top < h * 1.1) {
        el.style.setProperty("--reveal-delay", `${Math.min(batch * 28, 160)}ms`);
        el.dataset.atelierReveal = "visible";
        observer.unobserve(el);
        batch++;
      }
    }
  });
}

function initSpecularGlass() {
  if (!matchMedia("(pointer: fine)").matches) return;
  const selector = [
    ".featured-story",
    ".article-card",
    ".project-card",
    ".door",
    ".hero-profile",
    ".timeline li",
    ".path-card",
    ".story-connections > a",
    ".sticker-note",
    ".lab-workbench",
    ".article-context",
  ].join(",");

  let activeCard: HTMLElement | null = null;
  let rafId = 0;
  let px = 0;
  let py = 0;

  const flush = () => {
    rafId = 0;
    if (!activeCard) return;
    const rect = activeCard.getBoundingClientRect();
    activeCard.style.setProperty("--mx", `${(px - rect.left).toFixed(1)}px`);
    activeCard.style.setProperty("--my", `${(py - rect.top).toFixed(1)}px`);
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        selector,
      );
      if (target !== activeCard) {
        if (activeCard) activeCard.removeAttribute("data-specular-active");
        activeCard = target ?? null;
        if (activeCard) activeCard.dataset.specularActive = "true";
      }
      if (!activeCard) return;
      px = event.clientX;
      py = event.clientY;
      if (!rafId) rafId = requestAnimationFrame(flush);
    },
    { passive: true },
  );

  document.addEventListener(
    "pointerleave",
    () => {
      if (activeCard) {
        activeCard.removeAttribute("data-specular-active");
        activeCard = null;
      }
    },
    { passive: true },
  );
}

function initMagneticButtons() {
  if (!matchMedia("(pointer: fine)").matches) return;
  const buttons = document.querySelectorAll<HTMLElement>(".btn-accent");
  for (const btn of buttons) {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 7;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 5;
      btn.style.setProperty("--mag-x", `${dx.toFixed(1)}px`);
      btn.style.setProperty("--mag-y", `${dy.toFixed(1)}px`);
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--mag-x", "0px");
      btn.style.setProperty("--mag-y", "0px");
    });
  }
}

function initReadingProgress() {
  const article = document.querySelector<HTMLElement>(".article-content");
  if (!article) return;

  const bar = document.createElement("div");
  bar.className = "reading-progress-ribbon";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);

  let rafId = 0;
  const update = () => {
    rafId = 0;
    const rect = article.getBoundingClientRect();
    const total = Math.max(1, article.offsetHeight - window.innerHeight * 0.6);
    const traveled = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), total);
    const pct = traveled / total;
    bar.style.transform = `scaleX(${pct.toFixed(4)})`;
    bar.style.opacity = pct > 0.01 && pct < 0.995 ? "1" : "0";
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
