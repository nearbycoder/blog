import css from "../styles/desktop-notes.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("notes", css);

type Note = { id: string; title: string; body: string; updatedAt: number };
type Notebook = { version: 1; activeId: string | null; notes: Note[] };

const STORAGE_KEY = "desktop-notes:v1";
const RECOVERY_KEY = `${STORAGE_KEY}:recovery`;
const MAX_NOTES = 200;

function readNotebook(value: string | null): Notebook {
  const empty: Notebook = { version: 1, activeId: null, notes: [] };
  if (!value) return empty;
  const data: unknown = JSON.parse(value);
  if (!data || typeof data !== "object") throw new Error("Invalid notebook");
  const book = data as Partial<Notebook>;
  if (
    book.version !== 1 ||
    !Array.isArray(book.notes) ||
    book.notes.length > MAX_NOTES ||
    !book.notes.every(
      (note) =>
        note &&
        typeof note.id === "string" &&
        note.id.length > 0 &&
        note.id.length < 100 &&
        typeof note.title === "string" &&
        note.title.length <= 120 &&
        typeof note.body === "string" &&
        note.body.length <= 100_000 &&
        Number.isFinite(note.updatedAt) &&
        note.updatedAt >= 0 &&
        note.updatedAt <= 8.64e15,
    ) ||
    new Set(book.notes.map((note) => note.id)).size !== book.notes.length
  ) {
    throw new Error("Invalid notebook");
  }
  return {
    version: 1,
    activeId: book.notes.some((note) => note.id === book.activeId)
      ? book.activeId!
      : (book.notes[0]?.id ?? null),
    notes: book.notes,
  };
}

export function mountNotes(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let notebook: Notebook = { version: 1, activeId: null, notes: [] };
  let storageStatus = "Saved on this device";
  let storageWarning = false;
  let unreadable: string | null = null;
  let recovery: string | null = null;
  let needsStorageRead = true;
  let deleted: { note: Note; index: number } | undefined;
  const downloads = new Map<string, ReturnType<typeof setTimeout>>();

  try {
    recovery = localStorage.getItem(RECOVERY_KEY);
  } catch {
    // Reading the notebook below reports an unavailable store to the user.
  }
  try {
    unreadable = localStorage.getItem(STORAGE_KEY);
    needsStorageRead = false;
    notebook = readNotebook(unreadable);
    unreadable = null;
  } catch {
    storageStatus =
      "Saved notes could not be read. Original data will be kept before new notes are saved.";
    storageWarning = true;
  }

  root.classList.add("notes-app");
  root.innerHTML = `
    <div class="desk-app-toolbar notes-toolbar">
      <button type="button" class="notes-new" data-notes-new>+ New note</button>
      <span class="notes-toolbar-spacer"></span>
      <button type="button" data-notes-download>Download</button>
      <button type="button" data-notes-delete>Delete</button>
    </div>
    <div class="notes-workspace">
      <aside class="notes-sidebar" aria-label="Notebook">
        <div class="notes-sidebar-heading"><span>YOUR NOTES</span><span data-notes-count></span></div>
        <div class="notes-list" role="group" aria-label="Saved notes" data-notes-list></div>
      </aside>
      <div class="notes-editor" data-notes-editor>
        <label class="notes-field-label" for="desktop-note-title">Note title</label>
        <input id="desktop-note-title" class="notes-title" type="text" maxlength="120" placeholder="Untitled note" autocomplete="off" data-notes-title />
        <label class="notes-field-label" for="desktop-note-body">Note text</label>
        <textarea id="desktop-note-body" class="notes-body" maxlength="100000" placeholder="A thought, a list, a little idea…" spellcheck="true" data-notes-body></textarea>
        <span class="notes-word-count" data-notes-words></span>
      </div>
      <div class="notes-empty" data-notes-empty>
        <span class="notes-empty-mark" aria-hidden="true">✎</span>
        <h2>A little space to think.</h2>
        <p>Capture an idea or make a list.<br />Your notes stay in this browser.</p>
        <button type="button" data-notes-new>Create your first note</button>
      </div>
    </div>
    <div class="notes-undo" data-notes-undo-row hidden>
      <span role="status" data-notes-deleted-message></span>
      <button type="button" data-notes-undo>Undo delete</button>
    </div>
    <div class="notes-recovery" data-notes-recovery-row hidden>
      <span data-notes-recovery-message></span>
      <button type="button" data-notes-backup>Download backup</button>
    </div>
    <div class="desk-app-status notes-status" role="status" aria-live="polite" data-notes-status></div>
  `;

  const query = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const list = query<HTMLDivElement>("[data-notes-list]");
  const title = query<HTMLInputElement>("[data-notes-title]");
  const body = query<HTMLTextAreaElement>("[data-notes-body]");
  const status = query<HTMLDivElement>("[data-notes-status]");
  const active = () =>
    notebook.notes.find((note) => note.id === notebook.activeId);

  function renderStatus() {
    status.textContent = storageStatus;
    status.classList.toggle("has-warning", storageWarning);
    query("[data-notes-recovery-row]").hidden =
      unreadable === null && recovery === null;
    query("[data-notes-recovery-message]").textContent =
      unreadable !== null
        ? "The original saved data is still kept."
        : "Previous saved data is kept in a backup.";
  }

  function save() {
    try {
      // If the first read was blocked, never replace unseen saved data.
      if (needsStorageRead) {
        unreadable = localStorage.getItem(STORAGE_KEY);
        needsStorageRead = false;
      }
      if (unreadable !== null) {
        const previous = localStorage.getItem(RECOVERY_KEY);
        if (previous !== null && previous !== unreadable) {
          localStorage.setItem(
            `${RECOVERY_KEY}:${crypto.randomUUID()}`,
            previous,
          );
        }
        // A failed backup throws before the original notebook is touched.
        if (previous !== unreadable)
          localStorage.setItem(RECOVERY_KEY, unreadable);
        recovery = unreadable;
        unreadable = null;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook));
      storageStatus = "Saved on this device";
      storageWarning = false;
    } catch {
      storageStatus =
        "Not saved: browser storage is unavailable. Download to keep a copy.";
      storageWarning = true;
    }
    renderStatus();
  }

  function download(contents: string, filename: string) {
    const url = URL.createObjectURL(
      new Blob([contents], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    root.append(link);
    link.click();
    link.remove();
    downloads.set(
      url,
      setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.delete(url);
      }, 1000),
    );
  }

  function renderList() {
    const buttons = notebook.notes.map((note) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "notes-list-item";
      button.dataset.noteId = note.id;
      button.setAttribute(
        "aria-pressed",
        String(note.id === notebook.activeId),
      );
      button.setAttribute(
        "aria-label",
        `Open note: ${note.title.trim() || "Untitled note"}`,
      );
      const heading = document.createElement("strong");
      heading.textContent = note.title.trim() || "Untitled note";
      const preview = document.createElement("span");
      preview.textContent = note.body.trim().slice(0, 80) || "Start writing…";
      const date = document.createElement("time");
      date.dateTime = new Date(note.updatedAt).toISOString();
      date.textContent = new Date(note.updatedAt).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        },
      );
      button.append(heading, preview, date);
      return button;
    });
    list.replaceChildren(...buttons);
    query("[data-notes-count]").textContent = String(notebook.notes.length);
    root
      .querySelectorAll<HTMLButtonElement>("[data-notes-new]")
      .forEach((button) => {
        button.disabled = notebook.notes.length >= MAX_NOTES;
        button.title = button.disabled
          ? "Notebook is full (200 notes)"
          : "Create a note";
      });
  }

  function renderWords() {
    const words = body.value.trim().match(/\S+/g)?.length ?? 0;
    query("[data-notes-words]").textContent =
      `${words} ${words === 1 ? "word" : "words"}`;
  }

  function renderEditor() {
    const note = active();
    query("[data-notes-editor]").hidden = !note;
    query("[data-notes-empty]").hidden = Boolean(note);
    query<HTMLButtonElement>("[data-notes-delete]").disabled = !note;
    query<HTMLButtonElement>("[data-notes-download]").disabled = !note;
    title.value = note?.title ?? "";
    body.value = note?.body ?? "";
    renderWords();
  }

  root.addEventListener(
    "click",
    (event) => {
      const target = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!target || target.disabled) return;
      if (target.hasAttribute("data-notes-new")) {
        if (notebook.notes.length >= MAX_NOTES) return;
        const note: Note = {
          id: crypto.randomUUID(),
          title: "",
          body: "",
          updatedAt: Date.now(),
        };
        notebook.notes.unshift(note);
        notebook.activeId = note.id;
        save();
        renderList();
        renderEditor();
        title.focus();
      } else if (target.dataset.noteId) {
        notebook.activeId = target.dataset.noteId;
        save();
        renderList();
        renderEditor();
        title.focus();
      } else if (target.hasAttribute("data-notes-delete")) {
        const note = active();
        if (!note) return;
        const index = notebook.notes.indexOf(note);
        deleted = { note, index };
        notebook.notes.splice(index, 1);
        notebook.activeId =
          notebook.notes[Math.min(index, notebook.notes.length - 1)]?.id ??
          null;
        query("[data-notes-deleted-message]").textContent =
          `“${note.title.trim() || "Untitled note"}” deleted.`;
        query("[data-notes-undo-row]").hidden = false;
        save();
        renderList();
        renderEditor();
        query("[data-notes-undo]").focus();
      } else if (target.hasAttribute("data-notes-undo") && deleted) {
        if (notebook.notes.length >= MAX_NOTES) {
          query("[data-notes-deleted-message]").textContent =
            "Notebook is full. Remove a note before restoring this one.";
          return;
        }
        notebook.notes.splice(deleted.index, 0, deleted.note);
        notebook.activeId = deleted.note.id;
        deleted = undefined;
        query("[data-notes-undo-row]").hidden = true;
        save();
        renderList();
        renderEditor();
        title.focus();
      } else if (target.hasAttribute("data-notes-backup")) {
        const backup = unreadable ?? recovery;
        if (backup !== null) download(backup, "Notes recovery.json");
      } else if (target.hasAttribute("data-notes-download")) {
        const note = active();
        if (!note) return;
        const heading = note.title.trim() || "Untitled note";
        const filename = `${
          heading
            .replace(/[^a-z0-9\-_ ]/gi, "")
            .trim()
            .slice(0, 80) || "note"
        }.txt`;
        download(`${heading}\n\n${note.body}\n`, filename);
      }
    },
    { signal },
  );

  function edit() {
    const note = active();
    if (!note) return;
    note.title = title.value;
    note.body = body.value;
    note.updatedAt = Date.now();
    save();
    renderList();
    renderWords();
  }
  title.addEventListener("input", edit, { signal });
  body.addEventListener("input", edit, { signal });
  renderList();
  renderEditor();
  renderStatus();

  return () => {
    controller.abort();
    downloads.forEach((timer, url) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    });
    downloads.clear();
  };
}
