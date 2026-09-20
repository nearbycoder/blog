import css from "../styles/desktop-tasks.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("tasks", css);

type Stage = "todo" | "doing" | "done";
type Task = { id: string; title: string; details: string; stage: Stage };
type TaskStore = { version: 1; tasks: Task[] };
const STORAGE_KEY = "nearby-desktop-tasks-v1";
const MAX_TASKS = 300;
// JSON can use six characters per UTF-16 code unit. Allow all 300 bounded
// records (100-character IDs, 160-character titles, 2,000-character details).
const MAX_SERIALIZED_LENGTH = 4_200_000;
const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "todo", label: "To do", hint: "Room for the next idea." },
  { id: "doing", label: "Doing", hint: "One small step at a time." },
  { id: "done", label: "Done", hint: "Your finished work lands here." },
];

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
        STAGES.some((stage) => stage.id === task.stage),
    ) ||
    new Set(data.tasks.map((task) => task.id)).size !== data.tasks.length
  ) {
    throw new Error("Invalid tasks");
  }
  return { version: 1, tasks: data.tasks };
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let store: TaskStore = { version: 1, tasks: [] };
  let filter: Stage | "all" = "all";
  let editingId: string | null = null;
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
    </div>
    <div class="tasks-overview" data-tasks-overview>
      <div class="tasks-filters" role="group" aria-label="Filter tasks by stage">
        <button type="button" data-tasks-filter="all" aria-pressed="true">All <span data-tasks-count="all">0</span></button>
        <button type="button" data-tasks-filter="todo" aria-pressed="false">To do <span data-tasks-count="todo">0</span></button>
        <button type="button" data-tasks-filter="doing" aria-pressed="false">Doing <span data-tasks-count="doing">0</span></button>
        <button type="button" data-tasks-filter="done" aria-pressed="false">Done <span data-tasks-count="done">0</span></button>
      </div>
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
        button.disabled = store.tasks.length >= MAX_TASKS || !editor.hidden;
        button.title =
          store.tasks.length >= MAX_TASKS
            ? "Task limit reached (300)"
            : "Create a task";
      });
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
      count.textContent = String(counts[stage.id]);
      heading.append(dot, label, count);
      column.append(heading);
      const tasks = store.tasks.filter((task) => task.stage === stage.id);
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
    query("[data-tasks-undo-row]").hidden = !deleted;
    query("[data-tasks-deleted]").textContent = deleted
      ? `Deleted “${deleted.task.title}”`
      : "";
    query<HTMLButtonElement>("[data-tasks-undo]").disabled =
      counts.all >= MAX_TASKS;
  }

  function setEditor(task?: Task) {
    editingId = task?.id ?? null;
    title.value = task?.title ?? "";
    details.value = task?.details ?? "";
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
      if (button.hasAttribute("data-tasks-new")) {
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
      const savedTask = existing ?? { id: crypto.randomUUID(), ...values };
      if (existing) Object.assign(existing, values);
      else store.tasks.push(savedTask);
      if (filter !== "all" && filter !== stage) filter = stage;
      closeEditor(savedTask.id);
      save(existing ? "Task updated." : "Task added.");
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
  return () => {
    controller.abort();
    root.classList.remove("tasks-app");
  };
}
