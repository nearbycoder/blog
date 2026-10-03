import css from "../styles/desktop-notes.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("notes", css);

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
  pinned?: boolean;
};
type Notebook = { version: 1; activeId: string | null; notes: Note[] };

const STORAGE_KEY = "desktop-notes:v1";
const RECOVERY_KEY = `${STORAGE_KEY}:recovery`;
const MAX_NOTES = 200;
const MAX_BODY_LENGTH = 100_000;
const MAX_TEXT_BYTES = MAX_BODY_LENGTH * 4;
const MAX_BACKUP_BYTES = 24 * 1024 * 1024;

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
        note.body.length <= MAX_BODY_LENGTH &&
        (note.pinned === undefined || typeof note.pinned === "boolean") &&
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
    notes: book.notes.map(({ id, title, body, updatedAt, pinned }) => ({
      id,
      title,
      body,
      updatedAt,
      ...(pinned === undefined ? {} : { pinned }),
    })),
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
  let pendingImport: Notebook | null = null;
  let importGeneration = 0;
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
      <button type="button" data-notes-pin aria-pressed="false">Pin</button>
      <button type="button" data-notes-duplicate>Duplicate</button>
      <button type="button" data-notes-download>Download</button>
      <button type="button" data-notes-delete>Delete</button>
    </div>
    <details class="notes-files" data-notes-files>
      <summary>Notebook files</summary>
      <div class="notes-file-actions">
        <button type="button" data-notes-import-text>Import text</button>
        <button type="button" data-notes-export>Export notebook</button>
        <button type="button" data-notes-import-backup>Restore notebook</button>
      </div>
      <p>Text files become new notes. Restore previews a JSON backup before merging; existing notes are kept.</p>
    </details>
    <input type="file" accept=".txt,text/plain" aria-label="Import a plain text note" data-notes-text-file hidden />
    <input type="file" accept=".json,application/json" aria-label="Restore a notebook JSON backup" data-notes-backup-file hidden />
    <section class="notes-import-preview" aria-label="Notebook import preview" data-notes-import-preview hidden>
      <strong>Review notebook import</strong>
      <p data-notes-import-summary></p>
      <ul data-notes-import-titles></ul>
      <div class="notes-file-actions">
        <button type="button" data-notes-merge>Merge notes</button>
        <button type="button" data-notes-cancel-import>Cancel import</button>
      </div>
    </section>
    <p class="notes-file-message" role="status" aria-live="polite" data-notes-file-message hidden></p>
    <div class="notes-workspace">
      <aside class="notes-sidebar" aria-label="Notebook">
        <div class="notes-sidebar-heading"><span>YOUR NOTES</span><span data-notes-count></span></div>
        <label class="notes-field-label" for="desktop-notes-search">Search notes</label>
        <input id="desktop-notes-search" class="notes-search" type="search" placeholder="Search notes…" maxlength="200" autocomplete="off" data-notes-search />
        <div class="notes-list" role="group" aria-label="Saved notes" data-notes-list></div>
        <p class="notes-no-results" data-notes-no-results hidden>No matching notes.</p>
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
  const search = query<HTMLInputElement>("[data-notes-search]");
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

  function download(contents: string, filename: string, type = "text/plain") {
    const url = URL.createObjectURL(
      new Blob([contents], { type: `${type};charset=utf-8` }),
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
    const term = search.value.trim().toLocaleLowerCase();
    const visibleNotes = notebook.notes
      .filter(
        (note) =>
          !term ||
          `${note.title}\n${note.body}`.toLocaleLowerCase().includes(term),
      )
      .sort(
        (left, right) =>
          Number(Boolean(right.pinned)) - Number(Boolean(left.pinned)),
      );
    const buttons = visibleNotes.map((note) => {
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
      if (note.pinned) {
        const marker = document.createElement("span");
        marker.className = "notes-pin-mark";
        marker.textContent = "◆ ";
        marker.setAttribute("aria-hidden", "true");
        heading.prepend(marker);
        button.setAttribute("aria-description", "Pinned note");
      }
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
    query("[data-notes-count]").textContent = term
      ? `${visibleNotes.length} / ${notebook.notes.length}`
      : String(notebook.notes.length);
    query("[data-notes-no-results]").hidden = !term || visibleNotes.length > 0;
    root
      .querySelectorAll<HTMLButtonElement>("[data-notes-new]")
      .forEach((button) => {
        button.disabled = notebook.notes.length >= MAX_NOTES;
        button.title = button.disabled
          ? "Notebook is full (200 notes)"
          : "Create a note";
      });
    query<HTMLButtonElement>("[data-notes-import-text]").disabled =
      notebook.notes.length >= MAX_NOTES;
    query<HTMLButtonElement>("[data-notes-duplicate]").disabled =
      !active() || notebook.notes.length >= MAX_NOTES;
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
    const pin = query<HTMLButtonElement>("[data-notes-pin]");
    pin.disabled = !note;
    pin.textContent = note?.pinned ? "Unpin" : "Pin";
    pin.setAttribute("aria-pressed", String(Boolean(note?.pinned)));
    title.value = note?.title ?? "";
    body.value = note?.body ?? "";
    renderWords();
  }

  function fileMessage(message: string) {
    const element = query("[data-notes-file-message]");
    element.textContent = message;
    element.hidden = !message;
  }

  function mergePlan(incoming: Notebook) {
    const fingerprint = (note: Note) =>
      JSON.stringify([note.title, note.body, Boolean(note.pinned)]);
    const contents = new Set(notebook.notes.map(fingerprint));
    const ids = new Set(notebook.notes.map((note) => note.id));
    const additions: Note[] = [];
    let skipped = 0;
    let copies = 0;
    for (const note of incoming.notes) {
      const key = fingerprint(note);
      if (contents.has(key)) {
        skipped++;
        continue;
      }
      const collision = ids.has(note.id);
      if (collision) copies++;
      const addition = {
        ...note,
        id: collision ? crypto.randomUUID() : note.id,
      };
      additions.push(addition);
      ids.add(addition.id);
      contents.add(key);
    }
    return {
      additions,
      skipped,
      copies,
      fits: notebook.notes.length + additions.length <= MAX_NOTES,
    };
  }

  function renderImportPreview() {
    query("[data-notes-import-preview]").hidden = !pendingImport;
    if (!pendingImport) return;
    const plan = mergePlan(pendingImport);
    query("[data-notes-import-summary]").textContent =
      `${plan.additions.length} new ${plan.additions.length === 1 ? "note" : "notes"}; ${plan.skipped} identical ${plan.skipped === 1 ? "note" : "notes"} skipped. ` +
      (plan.copies
        ? `${plan.copies} changed ${plan.copies === 1 ? "note keeps" : "notes keep"} both versions as separate copies. `
        : "") +
      (plan.fits
        ? "Your existing notes stay unchanged. Checked again before merging."
        : `Not enough space: the notebook limit is ${MAX_NOTES} notes. Remove notes or use a smaller backup.`);
    const previews = plan.additions.slice(0, 5).map((note) => {
      const item = document.createElement("li");
      item.textContent = note.title.trim() || "Untitled note";
      return item;
    });
    if (plan.additions.length > 5) {
      const more = document.createElement("li");
      more.textContent = `And ${plan.additions.length - 5} more…`;
      previews.push(more);
    }
    query("[data-notes-import-titles]").replaceChildren(...previews);
    query<HTMLButtonElement>("[data-notes-merge]").disabled =
      !plan.fits || !plan.additions.length;
  }

  function addNote(note: Note) {
    notebook.notes.unshift(note);
    notebook.activeId = note.id;
    search.value = "";
    save();
    renderList();
    renderEditor();
    renderImportPreview();
    title.focus();
  }

  async function importFile(input: HTMLInputElement, kind: "text" | "backup") {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const generation = ++importGeneration;
    if (kind === "backup") {
      pendingImport = null;
      renderImportPreview();
    }
    fileMessage("Reading file…");
    try {
      if (file.size > (kind === "text" ? MAX_TEXT_BYTES : MAX_BACKUP_BYTES)) {
        throw new Error(
          kind === "text"
            ? "Text files must be at most 400 KB and 100,000 characters."
            : "Notebook backups must be at most 24 MB.",
        );
      }
      if (
        kind === "text" &&
        !file.name.toLowerCase().endsWith(".txt") &&
        file.type !== "text/plain"
      ) {
        throw new Error("Choose a plain text (.txt) file.");
      }
      const contents = new TextDecoder("utf-8", { fatal: true }).decode(
        await file.arrayBuffer(),
      );
      if (signal.aborted || generation !== importGeneration) return;
      if (kind === "text") {
        if (contents.length > MAX_BODY_LENGTH || contents.includes("\0")) {
          throw new Error(
            "Text files must contain plain text with at most 100,000 characters.",
          );
        }
        if (notebook.notes.length >= MAX_NOTES)
          throw new Error(
            "Notebook is full (200 notes). Remove a note before importing.",
          );
        addNote({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.txt$/i, "").slice(0, 120),
          body: contents,
          updatedAt: Date.now(),
        });
        query<HTMLDetailsElement>("[data-notes-files]").open = false;
        fileMessage("Text imported as a new note.");
      } else {
        if (!contents.trim())
          throw new Error("This file is empty. Choose a notebook JSON backup.");
        pendingImport = readNotebook(contents);
        renderImportPreview();
        fileMessage("Backup validated. Review it before merging.");
        query<HTMLDetailsElement>("[data-notes-files]").open = false;
        query("[data-notes-cancel-import]").focus();
      }
    } catch (error) {
      if (signal.aborted || generation !== importGeneration) return;
      const detail =
        error instanceof Error &&
        !(error instanceof SyntaxError) &&
        !(error instanceof TypeError)
          ? error.message
          : "The file is not a valid UTF-8 notebook or text file.";
      fileMessage(`Import failed: ${detail} Your notebook was not changed.`);
    }
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
        addNote({
          id: crypto.randomUUID(),
          title: "",
          body: "",
          updatedAt: Date.now(),
        });
      } else if (target.hasAttribute("data-notes-pin")) {
        const note = active();
        if (!note) return;
        note.pinned = !note.pinned;
        save();
        renderList();
        renderEditor();
        renderImportPreview();
      } else if (target.hasAttribute("data-notes-duplicate")) {
        const note = active();
        if (!note || notebook.notes.length >= MAX_NOTES) return;
        addNote({
          ...note,
          id: crypto.randomUUID(),
          title: `${(note.title.trim() || "Untitled note").slice(0, 113)} (copy)`,
          updatedAt: Date.now(),
        });
        fileMessage("Note duplicated. Edit this copy independently.");
      } else if (target.hasAttribute("data-notes-import-text")) {
        query<HTMLInputElement>("[data-notes-text-file]").click();
      } else if (target.hasAttribute("data-notes-import-backup")) {
        query<HTMLInputElement>("[data-notes-backup-file]").click();
      } else if (target.hasAttribute("data-notes-export")) {
        download(
          JSON.stringify(notebook, null, 2),
          "Notebook.json",
          "application/json",
        );
        fileMessage(
          `Exported ${notebook.notes.length} ${notebook.notes.length === 1 ? "note" : "notes"} as a JSON backup.`,
        );
      } else if (target.hasAttribute("data-notes-cancel-import")) {
        pendingImport = null;
        renderImportPreview();
        fileMessage("Import canceled. Notebook unchanged.");
        query<HTMLDetailsElement>("[data-notes-files]")
          .querySelector("summary")
          ?.focus();
      } else if (target.hasAttribute("data-notes-merge") && pendingImport) {
        const plan = mergePlan(pendingImport);
        if (!plan.fits || !plan.additions.length) {
          renderImportPreview();
          return;
        }
        notebook.notes.push(...plan.additions);
        notebook.activeId ??= plan.additions[0].id;
        pendingImport = null;
        search.value = "";
        save();
        renderList();
        renderEditor();
        renderImportPreview();
        fileMessage(
          `Merged ${plan.additions.length} ${plan.additions.length === 1 ? "note" : "notes"}. Existing notes were kept.`,
        );
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
        renderImportPreview();
        query("[data-notes-undo]").focus();
      } else if (target.hasAttribute("data-notes-undo") && deleted) {
        if (notebook.notes.length >= MAX_NOTES) {
          query("[data-notes-deleted-message]").textContent =
            "Notebook is full. Remove a note before restoring this one.";
          return;
        }
        // A backup may have restored this ID since the delete. Keep both notes.
        if (notebook.notes.some((note) => note.id === deleted!.note.id)) {
          deleted.note = { ...deleted.note, id: crypto.randomUUID() };
        }
        notebook.notes.splice(deleted.index, 0, deleted.note);
        notebook.activeId = deleted.note.id;
        deleted = undefined;
        query("[data-notes-undo-row]").hidden = true;
        save();
        renderList();
        renderEditor();
        renderImportPreview();
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
    renderImportPreview();
  }
  title.addEventListener("input", edit, { signal });
  body.addEventListener("input", edit, { signal });
  search.addEventListener("input", renderList, { signal });
  query<HTMLInputElement>("[data-notes-text-file]").addEventListener(
    "change",
    (event) => {
      void importFile(event.currentTarget as HTMLInputElement, "text");
    },
    { signal },
  );
  query<HTMLInputElement>("[data-notes-backup-file]").addEventListener(
    "change",
    (event) => {
      void importFile(event.currentTarget as HTMLInputElement, "backup");
    },
    { signal },
  );
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
