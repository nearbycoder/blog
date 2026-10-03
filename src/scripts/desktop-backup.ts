import css from "../styles/desktop-backup.css?inline";
import { installAppStyle } from "./desktop-app-style";
import { getDesktopHost } from "./desktop-host";
import { downloadDesktopFile } from "./desktop-local-state";
import type { CategorySnapshot } from "./desktop-backup-data";
installAppStyle("backup", css);

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  let generation = 0;
  root.classList.add("backup-app");
  root.innerHTML = `
    <header class="backup-heading"><p class="backup-eyebrow">DATA CENTER</p><h2>Your desktop, on your terms.</h2><p>See what this browser remembers. Download a backup, restore selected categories, or start fresh.</p></header>
    <p class="backup-notice">Backups stay on your device. They include saved desktop data only—not terminal connections, credentials, browser history, or other website storage. Unsaved documents are not included.</p>
    <div class="backup-tabs" role="group" aria-label="Data Center views"><button type="button" data-backup-view="device" aria-pressed="true">On this device</button><button type="button" data-backup-view="import" aria-pressed="false">Import a backup</button></div>
    <section data-backup-device aria-label="Saved desktop data">
      <div class="backup-summary"><strong data-backup-total>Reading storage…</strong><span>UTF-8 value bytes · browser quota accounting may differ</span></div>
      <div class="backup-actions"><button type="button" data-backup-export-all disabled>Export all desktop data</button><button type="button" data-backup-refresh disabled>Refresh usage</button></div>
      <fieldset class="backup-categories"><legend>Select categories</legend><div data-backup-current></div></fieldset>
      <div class="backup-actions"><button type="button" data-backup-export-selected disabled>Export selected</button><button type="button" data-backup-reset disabled>Reset selected…</button></div>
      <p class="backup-fine">Unreadable records are left untouched. Export retains their original text for recovery, but incompatible records cannot be restored here. Note recovery copies are managed in Notes and are excluded.</p>
    </section>
    <section data-backup-import hidden aria-label="Import desktop backup">
      <label class="backup-file">Choose a desktop backup <input type="file" accept=".json,application/json" data-backup-file /></label><p class="backup-fine">JSON · maximum 16 MiB. Choosing a file only opens a preview.</p>
      <div data-backup-preview hidden><p data-backup-created></p><fieldset class="backup-categories"><legend>Choose categories to replace</legend><div data-backup-imported></div></fieldset><p class="backup-notice">Restore replaces every saved record in each selected category. Records absent from that category in the backup are removed. Other categories stay as they are.</p><button type="button" data-backup-restore disabled>Review selected restore…</button></div>
    </section>
    <section class="backup-confirm" data-backup-confirm hidden aria-label="Confirm data replacement" tabindex="-1"><h3 data-backup-confirm-title></h3><p data-backup-confirm-copy></p><ul data-backup-confirm-list></ul><label><input type="checkbox" data-backup-confirm-check />I understand the selected saved data will be replaced or removed.</label><div class="backup-actions"><button type="button" data-backup-commit disabled></button><button type="button" data-backup-cancel>Cancel</button></div></section>
    <p class="backup-status" data-backup-status role="status" aria-live="polite">Loading Data Center…</p>
  `;
  const get = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const status = get<HTMLElement>("[data-backup-status]");
  const message = (text: string) => {
    status.textContent = text;
  };
  const bytes = (number: number) =>
    number < 1024
      ? `${number.toLocaleString()} B`
      : number < 1024 * 1024
        ? `${(number / 1024).toFixed(1)} KiB`
        : `${(number / (1024 * 1024)).toFixed(2)} MiB`;
  import("./desktop-backup-data")
    .then((data) => {
      if (signal.aborted) return;
      let current: CategorySnapshot[] = [];
      let imported: CategorySnapshot[] = [];
      let confirmation: {
        action: "restore" | "reset";
        snapshots: CategorySnapshot[];
      } | null = null;
      let returnFocus: HTMLElement | null = null;
      const selected = (scope: string, source: CategorySnapshot[]) => {
        const ids = [
          ...get<HTMLElement>(scope).querySelectorAll<HTMLInputElement>(
            "input:checked",
          ),
        ].map((input) => input.value);
        return source.filter((item) => ids.includes(item.category.id));
      };
      const currentSelected = () => selected("[data-backup-current]", current);
      const importedSelected = () =>
        selected("[data-backup-imported]", imported);
      function closeConfirmation() {
        confirmation = null;
        get<HTMLElement>("[data-backup-confirm]").hidden = true;
        get<HTMLInputElement>("[data-backup-confirm-check]").checked = false;
        get<HTMLButtonElement>("[data-backup-commit]").disabled = true;
      }
      function updateActions() {
        const local = currentSelected();
        get<HTMLButtonElement>("[data-backup-export-selected]").disabled =
          !local.length;
        get<HTMLButtonElement>("[data-backup-reset]").disabled = !local.length;
        get<HTMLButtonElement>("[data-backup-restore]").disabled =
          !importedSelected().length;
      }
      function renderRows(
        container: HTMLElement,
        snapshots: CategorySnapshot[],
        preview: boolean,
      ) {
        container.replaceChildren();
        for (const item of snapshots) {
          const row = document.createElement("label");
          row.className = "backup-row";
          row.dataset.backupCategory = item.category.id;
          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = item.category.id;
          input.disabled = !item.readable || (preview && !!item.issue);
          input.setAttribute(
            "aria-label",
            `${preview ? "Restore" : "Select"} ${item.category.label}`,
          );
          const detail = document.createElement("span");
          const title = document.createElement("strong");
          title.textContent = item.category.label;
          const info = document.createElement("small");
          const count = Object.keys(item.data).length;
          const existing = current.find(
            (entry) => entry.category.id === item.category.id,
          );
          info.textContent = `${count} saved ${count === 1 ? "record" : "records"}${preview ? ` · on device: ${bytes(existing?.bytes ?? 0)}` : ""}`;
          detail.append(title, info);
          if (item.issue) {
            const warning = document.createElement("small");
            warning.className = "backup-warning";
            warning.textContent = preview
              ? item.issue
              : `${item.issue} Original text is preserved.`;
            detail.append(warning);
          }
          const size = document.createElement("span");
          size.className = "backup-size";
          size.textContent = item.readable ? bytes(item.bytes) : "Unavailable";
          row.append(input, detail, size);
          container.append(row);
        }
      }
      function refresh() {
        current = data.readCategories(localStorage);
        renderRows(get("[data-backup-current]"), current, false);
        const total = current.reduce((sum, item) => sum + item.bytes, 0);
        get<HTMLElement>("[data-backup-total]").textContent =
          `${bytes(total)} across ${current.filter((item) => Object.keys(item.data).length).length} categories`;
        get<HTMLButtonElement>("[data-backup-export-all]").disabled =
          current.some((item) => !item.readable);
        get<HTMLButtonElement>("[data-backup-refresh]").disabled = false;
        closeConfirmation();
        updateActions();
      }
      function exportData(all: boolean) {
        try {
          // Read again so an app's latest saved changes are in the downloaded file.
          const ids = new Set(
            currentSelected().map((item) => item.category.id),
          );
          const snapshots = data
            .readCategories(localStorage)
            .filter((item) => all || ids.has(item.category.id));
          if (!snapshots.length) return;
          const content = data.createBackup(snapshots);
          downloadDesktopFile(
            `nearby-desktop-${new Date().toISOString().slice(0, 10)}${all ? "" : "-selected"}.json`,
            content,
            "application/json",
          );
          message(
            `Backup downloaded for ${snapshots.length} categories.${snapshots.some((item) => item.issue) ? " It includes unreadable originals for recovery; these cannot be restored until repaired." : ""}`,
          );
        } catch (error) {
          message(
            error instanceof Error
              ? error.message
              : "The backup could not be created.",
          );
        }
      }
      function review(action: "restore" | "reset") {
        const snapshots =
          action === "restore" ? importedSelected() : currentSelected();
        if (!snapshots.length) return;
        confirmation = { action, snapshots };
        returnFocus =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        get<HTMLInputElement>("[data-backup-confirm-check]").checked = false;
        get<HTMLButtonElement>("[data-backup-commit]").disabled = true;
        get<HTMLElement>("[data-backup-confirm-title]").textContent =
          action === "restore"
            ? "Replace these saved categories?"
            : "Remove these saved categories?";
        get<HTMLElement>("[data-backup-confirm-copy]").textContent =
          "Affected apps will close and the desktop will reload. Export a backup first if you want to keep the current saved data. This cannot be undone here.";
        const list = get<HTMLElement>("[data-backup-confirm-list]");
        list.replaceChildren();
        for (const item of snapshots) {
          const row = document.createElement("li");
          row.textContent = `${item.category.label} · ${action === "restore" ? `${bytes(item.bytes)} from backup` : `${bytes(item.bytes)} to remove`}`;
          list.append(row);
        }
        get<HTMLElement>("[data-backup-commit]").textContent =
          action === "restore"
            ? "Restore selected and reload"
            : "Reset selected and reload";
        get<HTMLElement>("[data-backup-confirm]").hidden = false;
        get<HTMLElement>("[data-backup-confirm]").focus();
      }
      get("[data-backup-device]").addEventListener(
        "change",
        () => {
          closeConfirmation();
          updateActions();
        },
        { signal },
      );
      get("[data-backup-imported]").addEventListener(
        "change",
        () => {
          closeConfirmation();
          updateActions();
        },
        { signal },
      );
      get("[data-backup-confirm-check]").addEventListener(
        "change",
        (event) => {
          get<HTMLButtonElement>("[data-backup-commit]").disabled = !(
            event.target as HTMLInputElement
          ).checked;
        },
        { signal },
      );
      get("[data-backup-cancel]").addEventListener(
        "click",
        () => {
          closeConfirmation();
          returnFocus?.focus();
          message("Canceled. Saved data is unchanged.");
        },
        { signal },
      );
      get("[data-backup-export-all]").addEventListener(
        "click",
        () => exportData(true),
        { signal },
      );
      get("[data-backup-export-selected]").addEventListener(
        "click",
        () => exportData(false),
        { signal },
      );
      get("[data-backup-refresh]").addEventListener(
        "click",
        () => {
          refresh();
          message("Storage usage refreshed. Saved data is unchanged.");
        },
        { signal },
      );
      get("[data-backup-reset]").addEventListener(
        "click",
        () => review("reset"),
        { signal },
      );
      get("[data-backup-restore]").addEventListener(
        "click",
        () => review("restore"),
        { signal },
      );
      root
        .querySelectorAll<HTMLButtonElement>("[data-backup-view]")
        .forEach((button) =>
          button.addEventListener(
            "click",
            () => {
              const importing = button.dataset.backupView === "import";
              get<HTMLElement>("[data-backup-device]").hidden = importing;
              get<HTMLElement>("[data-backup-import]").hidden = !importing;
              root
                .querySelectorAll("[data-backup-view]")
                .forEach((item) =>
                  item.setAttribute("aria-pressed", String(item === button)),
                );
              closeConfirmation();
            },
            { signal },
          ),
        );
      get<HTMLInputElement>("[data-backup-file]").addEventListener(
        "change",
        async (event) => {
          const ticket = ++generation;
          const file = (event.target as HTMLInputElement).files?.[0];
          imported = [];
          closeConfirmation();
          get<HTMLElement>("[data-backup-preview]").hidden = true;
          updateActions();
          if (!file) return;
          try {
            if (file.size > data.MAX_BACKUP_BYTES)
              throw new Error("Choose a backup no larger than 16 MiB.");
            const buffer = await file.arrayBuffer();
            let text: string;
            try {
              text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
            } catch {
              throw new Error(
                "This file is not valid UTF-8. Save a UTF-8 JSON backup and try again.",
              );
            }
            if (signal.aborted || ticket !== generation) return;
            const result = data.parseBackup(text);
            imported = result.snapshots;
            current = data.readCategories(localStorage);
            get<HTMLElement>("[data-backup-created]").textContent =
              `Created ${new Date(result.createdAt).toLocaleString()} · ${imported.length} categories`;
            renderRows(get("[data-backup-imported]"), imported, true);
            get<HTMLElement>("[data-backup-preview]").hidden = false;
            message(
              imported.some((item) => item.issue)
                ? "Preview ready. Incompatible categories are disabled. Nothing has changed."
                : "Preview ready. Select categories and review before restoring. Nothing has changed.",
            );
          } catch (error) {
            if (!signal.aborted && ticket === generation)
              message(
                error instanceof Error
                  ? error.message
                  : "The file could not be read.",
              );
          }
        },
        { signal },
      );
      get("[data-backup-commit]").addEventListener(
        "click",
        () => {
          if (
            !confirmation ||
            !get<HTMLInputElement>("[data-backup-confirm-check]").checked
          )
            return;
          const { action, snapshots } = confirmation;
          const host = getDesktopHost();
          if (!host?.prepareDataRestore) {
            message(
              "The desktop is not ready to reload safely. Please reload this page and try again. Nothing was changed.",
            );
            return;
          }
          const keys = snapshots.flatMap((item) => item.category.keys);
          const affected = new Set(
            snapshots.flatMap((item) => item.category.apps),
          );
          let resume: (() => void) | undefined;
          try {
            resume = host.prepareDataRestore(keys);
            for (const win of host.windows())
              if (affected.has(win.dataset.window ?? "")) host.close(win);
            const result = data.replaceCategories(
              localStorage,
              snapshots,
              action === "reset",
            );
            if (!result.ok) {
              resume();
              closeConfirmation();
              refresh();
              message(result.message);
              return;
            }
            message(`${result.message} Reloading the desktop…`);
            // Suppression remains active through pagehide so old layout memory cannot overwrite the restore.
            location.reload();
          } catch {
            resume?.();
            message(
              "The desktop could not finish this change. Check the saved categories before trying again.",
            );
          }
        },
        { signal },
      );
      refresh();
      message(
        current.some((item) => item.issue)
          ? "Some records could not be interpreted. Their original contents remain unchanged."
          : "Saved data stays in this browser. Back up anything you want to keep.",
      );
    })
    .catch(() => {
      if (!signal.aborted)
        message("Data Center could not load. Close this window and try again.");
    });
  return () => {
    generation++;
    controller.abort();
  };
}
