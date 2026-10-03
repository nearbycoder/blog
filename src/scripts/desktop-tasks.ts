import css from "../styles/desktop-tasks.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("tasks", css);

type Stage = "todo" | "doing" | "done";
type Priority = "low" | "normal" | "high";
type Task = {
  id: string;
  title: string;
  details: string;
  stage: Stage;
  priority?: Priority;
  dueDate?: string;
};
export type TaskStore = { version: 1; tasks: Task[] };
const STORAGE_KEY = "nearby-desktop-tasks-v1";
const MAX_TASKS = 300;
// JSON can use six characters per UTF-16 code unit. Allow all 300 bounded
// records (100-character IDs, 160-character titles, 2,000-character details).
const MAX_SERIALIZED_LENGTH = 4_200_000;
const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "high", label: "High" },
  { id: "normal", label: "Normal" },
  { id: "low", label: "Low" },
];
const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "todo", label: "To do", hint: "Room for the next idea." },
  { id: "doing", label: "Doing", hint: "One small step at a time." },
  { id: "done", label: "Done", hint: "Your finished work lands here." },
];

function validDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  )
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function today(): string {
  const date = new Date();
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function readStore(raw: string | null): TaskStore {
  if (raw === null) return { version: 1, tasks: [] };
  if (raw.length > MAX_SERIALIZED_LENGTH)
    throw new Error("Task data is too large");
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Invalid tasks");
  const data = value as Partial<TaskStore>;
  if (
    data.version !== 1 ||
    !Array.isArray(data.tasks) ||
    data.tasks.length > MAX_TASKS ||
    !data.tasks.every(
      (task) =>
        task &&
        typeof task.id === "string" &&
        task.id.length > 0 &&
        task.id.length <= 100 &&
        typeof task.title === "string" &&
        task.title.trim().length > 0 &&
        task.title.length <= 160 &&
        typeof task.details === "string" &&
        task.details.length <= 2000 &&
        STAGES.some((stage) => stage.id === task.stage) &&
        (task.priority === undefined ||
          PRIORITIES.some((priority) => priority.id === task.priority)) &&
        (task.dueDate === undefined || validDate(task.dueDate)),
    ) ||
    new Set(data.tasks.map((task) => task.id)).size !== data.tasks.length
  ) {
    throw new Error("Invalid tasks");
  }
  return {
    version: 1,
    tasks: data.tasks.map(
      ({ id, title, details, stage, priority, dueDate }) => ({
        id,
        title,
        details,
        stage,
        ...(priority === undefined ? {} : { priority }),
        ...(dueDate === undefined ? {} : { dueDate }),
      }),
    ),
  };
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let store: TaskStore = { version: 1, tasks: [] };
  let filter: Stage | "all" = "all";
  let priorityFilter: Priority | "all" = "all";
  let searchTerm = "";
  let editingId: string | null = null;
  let pendingImport: TaskStore | null = null;
  let importGeneration = 0;
  let importBusy = false;
  let exporter: import("./desktop-tasks-backup").TaskExporter | undefined;
  let exportBusy = false;
  let deleted: { task: Task; index: number } | null = null;
  let storageBlocked = false;
  let storageWarning = false;
  let storageMessage = "Saved on this device";
  try {
    store = readStore(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Never overwrite documents that this version could not read.
    storageBlocked = true;
    storageWarning = true;
    storageMessage =
      "Saved tasks could not be read. Changes stay in this session; original data is unchanged.";
  }

  root.classList.add("tasks-app");
  root.innerHTML = `
<div class="desk-app-toolbar tasks-toolbar">
<button type="button" data-tasks-new>+ New task</button>
<span class="tasks-total" data-tasks-total></span>
<details class="tasks-data-menu">
<summary>Backup &amp; export</summary>
<div class="tasks-data-actions">
<button type="button" data-tasks-export="json">Export JSON</button>
<button type="button" data-tasks-export="csv">Export CSV</button>
<button type="button" data-tasks-import>Import JSON</button>
</div>
</details>
<input type="file" accept=".json,application/json" data-tasks-file aria-label="Choose task backup" hidden />
</div>
<div class="tasks-overview" data-tasks-overview>
<div class="tasks-filters" role="group" aria-label="Filter tasks by stage">
${[{ id: "all", label: "All" }, ...STAGES].map(({ id, label }) => `<button type="button" data-tasks-filter="${id}" aria-pressed="${id === "all"}">${label} <span data-tasks-count="${id}">0</span></button>`).join("")}
</div>
<div class="tasks-search-controls">
<label class="tasks-search-label">Search tasks
<input type="search" data-tasks-search maxlength="160" placeholder="Title or details" autocomplete="off" />
</label>
<label>Priority
<select data-tasks-priority-filter><option value="all">All priorities</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select>
</label>
</div>
<p class="tasks-results" data-tasks-results role="status" aria-live="polite" hidden></p>
<div class="tasks-progress" aria-hidden="true"><span data-tasks-progress></span></div>
<div class="tasks-board" data-tasks-board></div>
<div class="tasks-empty" data-tasks-empty>
<span class="tasks-empty-mark" aria-hidden="true">✓</span>
<h2>A little plan goes a long way.</h2>
<p>Make room for what matters.<br />Add a task, take a step, mark it done.</p>
<button type="button" data-tasks-new>Add your first task</button>
<small>Your tasks stay in this browser.</small>
</div>
</div>
<section class="tasks-import" data-tasks-import-panel hidden>
</section>
<div class="tasks-editor" data-tasks-editor hidden>
<form data-tasks-form novalidate>
<h2 data-tasks-editor-heading>New task</h2>
<p class="tasks-editor-hint">Keep it small enough to start.</p>
<label for="desktop-tasks-title">Task title <span aria-hidden="true">*</span></label>
<input id="desktop-tasks-title" name="title" maxlength="160" required autocomplete="off" placeholder="What would you like to do?" aria-describedby="desktop-tasks-error" />
<label for="desktop-tasks-details">Details <span class="tasks-optional">Optional</span></label>
<textarea id="desktop-tasks-details" name="details" maxlength="2000" rows="3" placeholder="A note, a next step, a useful reminder…"></textarea>
<label for="desktop-tasks-stage">Stage</label>
<select id="desktop-tasks-stage" name="stage"><option value="todo">To do</option><option value="doing">Doing</option><option value="done">Done</option></select>
<div class="tasks-editor-metadata">
<div><label for="desktop-tasks-priority">Priority</label><select id="desktop-tasks-priority" name="priority"><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></div>
<div><label for="desktop-tasks-due">Due date <span class="tasks-optional">Optional</span></label><input type="date" id="desktop-tasks-due" name="dueDate" min="0001-01-01" max="9999-12-31" /></div>
</div>
<p class="tasks-error" id="desktop-tasks-error" role="alert" hidden></p>
<div class="tasks-editor-actions">
<button type="submit" data-tasks-submit>Add task</button>
<button type="button" data-tasks-cancel>Cancel</button>
</div>
</form>
</div>
<div class="tasks-undo" data-tasks-undo-row hidden>
<span data-tasks-deleted></span>
<button type="button" data-tasks-undo>Undo delete</button>
</div>
<div class="desk-app-status tasks-status" role="status" aria-live="polite" data-tasks-status></div>
  `;

  const query = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const board = query<HTMLDivElement>("[data-tasks-board]");
  const title = query<HTMLInputElement>("#desktop-tasks-title");
  const details = query<HTMLTextAreaElement>("#desktop-tasks-details");
  const stageInput = query<HTMLSelectElement>("#desktop-tasks-stage");
  const priorityInput = query<HTMLSelectElement>("#desktop-tasks-priority");
  const dueInput = query<HTMLInputElement>("#desktop-tasks-due");
  const importPanel = query<HTMLElement>("[data-tasks-import-panel]");
  const fileInput = query<HTMLInputElement>("[data-tasks-file]");
  const error = query<HTMLParagraphElement>("#desktop-tasks-error");
  const editor = query<HTMLDivElement>("[data-tasks-editor]");
  const status = query<HTMLDivElement>("[data-tasks-status]");

  function announce(message = "") {
    status.textContent = `${message ? `${message} ` : ""}${storageMessage}`;
    status.classList.toggle("has-warning", storageWarning);
  }

  function save(message: string) {
    if (!storageBlocked) {
      try {
        const serialized = JSON.stringify(store);
        if (serialized.length > MAX_SERIALIZED_LENGTH) {
          storageWarning = true;
          storageMessage =
            "Not saved: task data is too large. Changes stay in this session; previous saved data is unchanged.";
        } else {
          localStorage.setItem(STORAGE_KEY, serialized);
          storageWarning = false;
          storageMessage = "Saved on this device";
        }
      } catch {
        storageWarning = true;
        storageMessage =
          "Not saved: browser storage is unavailable. Changes stay in this session.";
      }
    }
    announce(message);
  }

  function resetExtraFilters() {
    priorityFilter = "all";
    searchTerm = "";
    query<HTMLSelectElement>("[data-tasks-priority-filter]").value = "all";
    query<HTMLInputElement>("[data-tasks-search]").value = "";
  }

  async function exportTasks(format: "json" | "csv") {
    if (exportBusy) return;
    exportBusy = true;
    render();
    announce("Preparing task export…");
    try {
      const module = await import("./desktop-tasks-backup");
      if (signal.aborted) return;
      exporter ??= module.createTaskExporter(root);
      exporter.download(store, format, today());
      announce(
        `Exported all ${store.tasks.length} tasks as ${format.toUpperCase()}.`,
      );
    } catch {
      if (!signal.aborted)
        announce("Export could not start. Please try again.");
    } finally {
      exportBusy = false;
      if (!signal.aborted) render();
    }
  }

  function importCandidates() {
    const ids = new Set(store.tasks.map((task) => task.id));
    return pendingImport?.tasks.filter((task) => !ids.has(task.id)) ?? [];
  }

  function renderImport() {
    if (pendingImport) exporter?.renderPreview(pendingImport, store);
  }

  function closeImport() {
    importGeneration++;
    importBusy = false;
    pendingImport = null;
    importPanel.hidden = true;
    query("[data-tasks-overview]").hidden = false;
    render();
    const menu = query<HTMLDetailsElement>(".tasks-data-menu");
    if (menu.open) query<HTMLButtonElement>("[data-tasks-import]").focus();
    else query<HTMLElement>(".tasks-data-menu summary").focus();
  }

  function makeCard(task: Task): HTMLElement {
    const card = document.createElement("article");
    card.className = "tasks-card";
    card.dataset.taskId = task.id;
    const heading = document.createElement("h3");
    heading.textContent = task.title;
    card.append(heading);
    if (task.details) {
      const description = document.createElement("p");
      description.className = "tasks-card-details";
      description.textContent = task.details;
      card.append(description);
    }
    if (task.priority || task.dueDate) {
      const metadata = document.createElement("div");
      metadata.className = "tasks-card-metadata";
      if (task.priority) {
        const priority = document.createElement("span");
        priority.className = `tasks-priority tasks-priority-${task.priority}`;
        priority.textContent = `${PRIORITIES.find((item) => item.id === task.priority)!.label} priority`;
        metadata.append(priority);
      }
      if (task.dueDate) {
        const due = document.createElement("time");
        due.dateTime = task.dueDate;
        const overdue = task.stage !== "done" && task.dueDate < today();
        due.className = overdue ? "tasks-due is-overdue" : "tasks-due";
        due.textContent = `${overdue ? "Overdue" : "Due"} ${task.dueDate}`;
        metadata.append(due);
      }
      card.append(metadata);
    }
    const controls = document.createElement("div");
    controls.className = "tasks-card-controls";
    const select = document.createElement("select");
    select.dataset.taskStage = task.id;
    select.setAttribute("aria-label", `Stage for ${task.title}`);
    for (const stage of STAGES) {
      const option = document.createElement("option");
      option.value = stage.id;
      option.textContent = stage.label;
      select.append(option);
    }
    select.value = task.stage;
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Edit";
    edit.dataset.taskEdit = task.id;
    edit.setAttribute("aria-label", `Edit ${task.title}`);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.dataset.taskDelete = task.id;
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    controls.append(select, edit, remove);
    card.append(controls);
    return card;
  }

  function render() {
    const counts = { all: store.tasks.length, todo: 0, doing: 0, done: 0 };
    for (const task of store.tasks) counts[task.stage]++;
    query("[data-tasks-total]").textContent =
      `${counts.done} of ${counts.all} complete`;
    query("[data-tasks-progress]").style.width =
      `${counts.all ? (counts.done / counts.all) * 100 : 0}%`;
    root
      .querySelectorAll<HTMLElement>("[data-tasks-count]")
      .forEach((element) => {
        element.textContent = String(
          counts[element.dataset.tasksCount as keyof typeof counts],
        );
      });
    root
      .querySelectorAll<HTMLButtonElement>("[data-tasks-filter]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.tasksFilter === filter),
        );
      });
    root
      .querySelectorAll<HTMLButtonElement>("[data-tasks-new]")
      .forEach((button) => {
        button.disabled =
          store.tasks.length >= MAX_TASKS ||
          !editor.hidden ||
          !importPanel.hidden ||
          importBusy;
        button.title =
          store.tasks.length >= MAX_TASKS
            ? "Task limit reached (300)"
            : "Create a task";
      });
    root
      .querySelectorAll<HTMLButtonElement>("[data-tasks-export]")
      .forEach((button) => {
        button.disabled = exportBusy;
      });
    query<HTMLButtonElement>("[data-tasks-import]").disabled =
      !editor.hidden || importBusy;
    const normalizedSearch = searchTerm.toLocaleLowerCase();
    const visibleTasks = store.tasks.filter(
      (task) =>
        (priorityFilter === "all" ||
          (task.priority ?? "normal") === priorityFilter) &&
        (!normalizedSearch ||
          `${task.title}\n${task.details}`
            .toLocaleLowerCase()
            .includes(normalizedSearch)),
    );
    const results = query("[data-tasks-results]");
    results.hidden = !searchTerm && priorityFilter === "all";
    const shown = visibleTasks.filter(
      (task) => filter === "all" || task.stage === filter,
    ).length;
    results.textContent = shown
      ? `${shown} matching ${shown === 1 ? "task" : "tasks"}.`
      : "No matching tasks. Try another search or priority.";
    query("[data-tasks-empty]").hidden = counts.all !== 0;
    board.hidden = counts.all === 0;
    board.classList.toggle("tasks-board-filtered", filter !== "all");
    const columns = STAGES.filter(
      (stage) => filter === "all" || filter === stage.id,
    ).map((stage) => {
      const column = document.createElement("section");
      column.className = "tasks-column";
      column.dataset.tasksColumn = stage.id;
      column.setAttribute("aria-label", `${stage.label} tasks`);
      const heading = document.createElement("h2");
      const dot = document.createElement("span");
      dot.className = "tasks-stage-dot";
      dot.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.textContent = stage.label;
      const count = document.createElement("span");
      count.className = "tasks-column-count";
      count.textContent = String(
        visibleTasks.filter((task) => task.stage === stage.id).length,
      );
      heading.append(dot, label, count);
      column.append(heading);
      const tasks = visibleTasks.filter((task) => task.stage === stage.id);
      if (!tasks.length) {
        const empty = document.createElement("p");
        empty.className = "tasks-column-empty";
        empty.textContent = stage.hint;
        column.append(empty);
      } else {
        column.append(...tasks.map(makeCard));
      }
      return column;
    });
    board.replaceChildren(...columns);
    query("[data-tasks-undo-row]").hidden = !deleted || !importPanel.hidden;
    query("[data-tasks-deleted]").textContent = deleted
      ? `Deleted “${deleted.task.title}”`
      : "";
    query<HTMLButtonElement>("[data-tasks-undo]").disabled =
      counts.all >= MAX_TASKS;
    renderImport();
  }

  function setEditor(task?: Task) {
    editingId = task?.id ?? null;
    title.value = task?.title ?? "";
    details.value = task?.details ?? "";
    priorityInput.value = task?.priority ?? "normal";
    dueInput.value = task?.dueDate ?? "";
    stageInput.value = task?.stage ?? (filter === "all" ? "todo" : filter);
    query("[data-tasks-editor-heading]").textContent = task
      ? "Edit task"
      : "New task";
    query("[data-tasks-submit]").textContent = task
      ? "Save changes"
      : "Add task";
    error.hidden = true;
    title.removeAttribute("aria-invalid");
    editor.hidden = false;
    query("[data-tasks-overview]").hidden = true;
    render();
    title.focus();
  }

  function focusTask(taskId: string | null) {
    const control = Array.from(
      root.querySelectorAll<HTMLButtonElement>("[data-task-edit]"),
    ).find((button) => button.dataset.taskEdit === taskId);
    if (control) control.focus();
    return Boolean(control);
  }

  function closeEditor(taskId = editingId) {
    editor.hidden = true;
    query("[data-tasks-overview]").hidden = false;
    editingId = null;
    render();
    if (focusTask(taskId)) return;
    const newTask = query<HTMLButtonElement>("[data-tasks-new]");
    if (!newTask.disabled) newTask.focus();
    else query<HTMLButtonElement>(`[data-tasks-filter="${filter}"]`).focus();
  }

  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!button || button.disabled) return;
      if (
        button.dataset.tasksExport === "json" ||
        button.dataset.tasksExport === "csv"
      ) {
        exportTasks(button.dataset.tasksExport);
      } else if (button.hasAttribute("data-tasks-import")) {
        fileInput.value = "";
        fileInput.click();
      } else if (button.hasAttribute("data-tasks-import-cancel")) {
        closeImport();
        announce("Import cancelled. Your tasks are unchanged.");
      } else if (button.hasAttribute("data-tasks-merge") && pendingImport) {
        const candidates = importCandidates();
        if (
          !candidates.length ||
          store.tasks.length + candidates.length > MAX_TASKS
        )
          return;
        store.tasks.push(...candidates);
        // A backup can restore the deleted ID. Its old undo must not add it twice.
        if (candidates.some((task) => task.id === deleted?.task.id))
          deleted = null;
        filter = "all";
        resetExtraFilters();
        closeImport();
        save(`Merged ${candidates.length} tasks. Existing tasks were kept.`);
      } else if (button.hasAttribute("data-tasks-new")) {
        if (store.tasks.length < MAX_TASKS) setEditor();
      } else if (button.hasAttribute("data-tasks-cancel")) {
        closeEditor();
      } else if (button.dataset.tasksFilter) {
        filter = button.dataset.tasksFilter as Stage | "all";
        render();
      } else if (button.dataset.taskEdit) {
        const task = store.tasks.find(
          (item) => item.id === button.dataset.taskEdit,
        );
        if (task) setEditor(task);
      } else if (button.dataset.taskDelete) {
        const index = store.tasks.findIndex(
          (item) => item.id === button.dataset.taskDelete,
        );
        if (index < 0) return;
        const task = store.tasks.splice(index, 1)[0];
        deleted = { task, index };
        render();
        save(`Deleted “${task.title}”. Undo is available.`);
        query<HTMLButtonElement>("[data-tasks-undo]").focus();
      } else if (
        button.hasAttribute("data-tasks-undo") &&
        deleted &&
        store.tasks.length < MAX_TASKS
      ) {
        const task = deleted.task;
        store.tasks.splice(deleted.index, 0, task);
        deleted = null;
        if (filter !== "all" && filter !== task.stage) filter = task.stage;
        resetExtraFilters();
        render();
        save(`Restored “${task.title}”.`);
        if (editor.hidden) focusTask(task.id);
        else title.focus();
      }
    },
    { signal },
  );

  root.addEventListener(
    "change",
    (event) => {
      const select = event.target as HTMLSelectElement;
      if (select.hasAttribute("data-tasks-priority-filter")) {
        priorityFilter = PRIORITIES.some((item) => item.id === select.value)
          ? (select.value as Priority)
          : "all";
        render();
        return;
      }
      if (!select.dataset.taskStage) return;
      const task = store.tasks.find(
        (item) => item.id === select.dataset.taskStage,
      );
      const stage = STAGES.find((item) => item.id === select.value);
      if (!task || !stage) return;
      task.stage = stage.id;
      render();
      save(`Moved “${task.title}” to ${stage.label}.`);
      const control = Array.from(
        root.querySelectorAll<HTMLSelectElement>("[data-task-stage]"),
      ).find((element) => element.dataset.taskStage === task.id);
      if (control) control.focus();
      else query<HTMLButtonElement>(`[data-tasks-filter="${filter}"]`).focus();
    },
    { signal },
  );

  query<HTMLFormElement>("[data-tasks-form]").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      if (!title.value.trim()) {
        error.textContent = "Give this task a title before saving.";
        error.hidden = false;
        title.setAttribute("aria-invalid", "true");
        title.focus();
        return;
      }
      if (
        dueInput.validity.badInput ||
        (dueInput.value &&
          (!validDate(dueInput.value) || !dueInput.validity.valid))
      ) {
        error.textContent = "Choose a valid due date or leave it empty.";
        error.hidden = false;
        dueInput.focus();
        return;
      }
      const stage =
        STAGES.find((item) => item.id === stageInput.value)?.id ?? "todo";
      const existing = store.tasks.find((task) => task.id === editingId);
      if (!existing && store.tasks.length >= MAX_TASKS) {
        error.textContent =
          "The board is full (300 tasks). Delete a task to make room.";
        error.hidden = false;
        return;
      }
      const values = {
        title: title.value.trim().slice(0, 160),
        details: details.value.slice(0, 2000),
        stage,
      };
      const savedTask: Task = existing ?? {
        id: crypto.randomUUID(),
        ...values,
      };
      if (existing) Object.assign(existing, values);
      else store.tasks.push(savedTask);
      const priority =
        PRIORITIES.find((item) => item.id === priorityInput.value)?.id ??
        "normal";
      if (priority !== "normal") savedTask.priority = priority;
      else delete savedTask.priority;
      if (dueInput.value) savedTask.dueDate = dueInput.value;
      else delete savedTask.dueDate;
      resetExtraFilters();
      if (filter !== "all" && filter !== stage) filter = stage;
      closeEditor(savedTask.id);
      save(existing ? "Task updated." : "Task added.");
    },
    { signal },
  );

  query<HTMLInputElement>("[data-tasks-search]").addEventListener(
    "input",
    (event) => {
      searchTerm = (event.target as HTMLInputElement).value
        .slice(0, 160)
        .trim();
      render();
    },
    { signal },
  );

  fileInput.addEventListener(
    "change",
    async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const generation = ++importGeneration;
      pendingImport = null;
      importPanel.hidden = true;
      query("[data-tasks-overview]").hidden = false;
      importBusy = true;
      render();
      announce("Reading task backup…");
      try {
        if (file.size > MAX_SERIALIZED_LENGTH * 3) throw new Error("Too large");
        const [raw, module] = await Promise.all([
          file.text(),
          import("./desktop-tasks-backup"),
        ]);
        const imported = readStore(raw);
        if (signal.aborted || generation !== importGeneration) return;
        exporter ??= module.createTaskExporter(root);
        pendingImport = imported;
        importBusy = false;
        importPanel.hidden = false;
        query("[data-tasks-overview]").hidden = true;
        render();
        query("#desktop-tasks-import-heading").focus();
        announce("Backup validated. Review the tasks before merging.");
      } catch {
        if (signal.aborted || generation !== importGeneration) return;
        importBusy = false;
        render();
        announce(
          "Import failed. Check your connection and use a valid version 1 backup (up to 300 unique tasks). Your tasks are unchanged.",
        );
      }
    },
    { signal },
  );

  title.addEventListener(
    "input",
    () => {
      if (title.value.trim()) {
        error.hidden = true;
        title.removeAttribute("aria-invalid");
      }
    },
    { signal },
  );
  render();
  announce();
  let lastDay = today();
  const dateTimer = setInterval(() => {
    if (lastDay !== today()) {
      lastDay = today();
      render();
    }
  }, 60_000);
  return () => {
    controller.abort();
    clearInterval(dateTimer);
    exporter?.dispose();
    root.classList.remove("tasks-app");
  };
}
