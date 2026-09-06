import {
  readReadingState,
  updateReadingEntry,
  READING_KEY,
} from "../lib/reading-storage";
const tools = document.querySelector<HTMLElement>("[data-reading-id]");
if (tools) {
  const id = tools.dataset.readingId!;
  const save = tools.querySelector<HTMLButtonElement>("#save-article")!;
  const remember = tools.querySelector<HTMLInputElement>("#remember-reading")!;
  const status = tools.querySelector<HTMLElement>("#reading-tool-status")!;
  const resume = document.querySelector<HTMLElement>("#reading-resume")!;
  const resumeLink = resume.querySelector<HTMLAnchorElement>("a")!;
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".article-content h2[id], .article-content h3[id]",
    ),
  );
  let tracking = false;
  // Tracking is opt-in per article. Completion stops progress updates.
  function sync() {
    const entry = readReadingState()[id];
    save.disabled = false;
    remember.disabled = false;
    save.setAttribute("aria-pressed", String(Boolean(entry?.saved)));
    save.textContent = entry?.saved ? "Article saved" : "Save article";
    tracking = Boolean(entry?.heading) && !entry?.completed;
    remember.checked = Boolean(entry?.heading);
    finish.textContent = entry?.completed ? "Marked as read" : "Mark as read";
    const heading = headings.find((h) => h.id === entry?.heading);
    if (!heading || entry?.completed || location.hash) resume.hidden = true;
    if (heading) {
      resumeLink.href = `#${encodeURIComponent(heading.id)}`;
      resumeLink.textContent = `Continue at “${heading.textContent}” →`;
    }
  }
  function write(
    patch: Parameters<typeof updateReadingEntry>[1],
    message?: string,
  ) {
    if (!updateReadingEntry(id, patch)) {
      status.textContent =
        "Your browser could not save this. Allow site storage to use reading tools.";
      return false;
    }
    if (message) status.textContent = message;
    return true;
  }
  save.addEventListener("click", () => {
    const saved = Boolean(readReadingState()[id]?.saved);
    write(
      { saved: !saved },
      saved
        ? "Removed from your saved articles."
        : "Saved to your reading list.",
    );
  });
  remember.addEventListener("change", () => {
    if (remember.checked) {
      const passed = headings.filter(
        (h) => h.getBoundingClientRect().top < innerHeight * 0.5,
      );
      const heading = passed.at(-1) ?? headings[0];
      if (!heading) {
        remember.checked = false;
        status.textContent =
          "This short article has no section headings to bookmark.";
        return;
      }
      write(
        { heading: heading.id, completed: false },
        "Reading position will be remembered.",
      );
    } else {
      write({ heading: "", completed: false }, "Reading position cleared.");
    }
    sync();
  });
  const createObserver = () =>
    new IntersectionObserver(
      (entries) => {
        if (!tracking || document.visibilityState !== "visible") return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const latest = visible[0];
        if (latest && readReadingState()[id]?.heading !== latest.target.id)
          write({ heading: latest.target.id, completed: false });
      },
      { rootMargin: `0px 0px -${Math.round(innerHeight * 0.35)}px 0px` },
    );
  let observer = createObserver();
  headings.forEach((h) => observer.observe(h));
  window.addEventListener("resize", () => {
    observer.disconnect();
    observer = createObserver();
    headings.forEach((h) => observer.observe(h));
  });
  const finish = document.querySelector<HTMLButtonElement>(
    "#mark-reading-complete",
  )!;
  finish.addEventListener("click", () => {
    if (write({ completed: true }, "Marked as read."))
      finish.textContent = "Marked as read";
  });
  finish.disabled = false;
  window.addEventListener("readingchange", sync);
  window.addEventListener("storage", (event) => {
    if (event.key === READING_KEY || event.key === null) sync();
  });
  window.addEventListener("pagehide", () => observer.disconnect());
  resumeLink.addEventListener("click", () => {
    resume.hidden = true;
  });
  sync();
  const previous = readReadingState()[id];
  resume.hidden =
    Boolean(location.hash) ||
    Boolean(previous?.completed) ||
    !headings.some((h) => h.id === previous?.heading);
}
