import type { TaskStore } from "./desktop-tasks";

export type TaskExporter = ReturnType<typeof createTaskExporter>;

function csvCell(value: string): string {
  // Quoting alone does not stop formulas in a spreadsheet. Account for a
  // formula hidden behind whitespace or control characters as well.
  const safe =
    /^[\s\u0000-\u001f]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value)
      ? `'${value}`
      : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function createTaskExporter(root: HTMLElement) {
  // The import preview is only needed after a backup action starts.
  const preview = root.querySelector<HTMLElement>("[data-tasks-import-panel]")!;
  preview.setAttribute("aria-labelledby", "desktop-tasks-import-heading");
  preview.innerHTML = `
<h2 id="desktop-tasks-import-heading" tabindex="-1">Review task backup</h2>
<p data-tasks-import-summary></p>
<p class="tasks-import-hint">New task IDs are added. Existing tasks keep all their current values.</p>
<ul data-tasks-import-preview></ul>
<p data-tasks-import-capacity></p>
<div class="tasks-editor-actions">
<button type="button" data-tasks-merge>Merge tasks</button>
<button type="button" data-tasks-import-cancel>Cancel import</button>
</div>
  `;
  const urls = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    renderPreview(pending: TaskStore, current: TaskStore) {
      const query = <T extends HTMLElement>(selector: string) =>
        root.querySelector<T>(selector)!;
      const ids = new Set(current.tasks.map((task) => task.id));
      const candidates = pending.tasks.filter((task) => !ids.has(task.id));
      const skipped = pending.tasks.length - candidates.length;
      query("[data-tasks-import-summary]").textContent =
        `${candidates.length} new tasks to add. ${skipped} existing task IDs will be skipped.`;
      const list = query<HTMLUListElement>("[data-tasks-import-preview]");
      list.replaceChildren(
        ...candidates.slice(0, 8).map((task) => {
          const item = document.createElement("li");
          const stage = { todo: "To do", doing: "Doing", done: "Done" }[
            task.stage
          ];
          item.textContent = `${task.title} · ${stage} · ${task.priority ?? "normal"} priority${task.dueDate ? ` · due ${task.dueDate}` : ""}`;
          return item;
        }),
      );
      if (candidates.length > 8) {
        const more = document.createElement("li");
        more.textContent = `And ${candidates.length - 8} more tasks.`;
        list.append(more);
      }
      const tooMany = current.tasks.length + candidates.length > 300;
      query("[data-tasks-import-capacity]").textContent = tooMany
        ? `This merge exceeds the 300-task limit. Cancel and remove ${current.tasks.length + candidates.length - 300} tasks before importing.`
        : candidates.length
          ? "Your current tasks will be kept. Nothing changes until you merge."
          : "There are no new tasks to merge.";
      query<HTMLButtonElement>("[data-tasks-merge]").disabled =
        tooMany || !candidates.length;
    },
    download(store: TaskStore, format: "json" | "csv", day: string) {
      const content =
        format === "json"
          ? JSON.stringify(store, null, 2)
          : [
              ["ID", "Title", "Details", "Stage", "Priority", "Due date"],
              ...store.tasks.map((task) => [
                task.id,
                task.title,
                task.details,
                task.stage,
                task.priority ?? "normal",
                task.dueDate ?? "",
              ]),
            ]
              .map((row) => row.map(csvCell).join(","))
              .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([content], {
          type:
            format === "json"
              ? "application/json;charset=utf-8"
              : "text/csv;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `desktop-tasks-${day}.${format}`;
      root.append(link);
      try {
        link.click();
      } finally {
        link.remove();
        urls.set(
          url,
          setTimeout(() => {
            URL.revokeObjectURL(url);
            urls.delete(url);
          }, 1000),
        );
      }
    },
    dispose() {
      for (const [url, timer] of urls) {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
      }
      urls.clear();
    },
  };
}
