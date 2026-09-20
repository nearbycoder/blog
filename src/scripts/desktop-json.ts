import css from "../styles/desktop-json.css?inline";
import { installAppStyle } from "./desktop-app-style";

installAppStyle("json", css);

const MAX_BYTES = 500 * 1024;
const encoder = new TextEncoder();
const SAMPLE =
  '{"project":"JSON Desk","ready":true,"tasks":["Validate","Format","Export"],"details":{"version":1,"notes":null}}';

function sourceBytes(source: string): number {
  // Avoid making another large allocation for inputs already beyond the limit.
  return source.length > MAX_BYTES
    ? source.length
    : encoder.encode(source).length;
}

function inspect(source: string): { description: string; bytes: number } {
  const bytes = sourceBytes(source);
  if (bytes > MAX_BYTES)
    throw new Error(
      "Input exceeds 500 KiB. Shorten it before validation or formatting.",
    );
  if (!source.trim())
    throw new Error("Enter JSON first, or load the sample to try it.");
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message.slice(0, 240)
        : "Check the syntax.";
    throw new Error(
      `Invalid JSON: ${reason} Use double-quoted keys and no trailing commas.`,
    );
  }
  let description: string;
  if (value === null) description = "Null";
  else if (Array.isArray(value))
    description = `Array · ${value.length} ${value.length === 1 ? "item" : "items"}`;
  else if (typeof value === "object") {
    const count = Object.keys(value).length;
    description = `Object · ${count} unique ${count === 1 ? "key" : "keys"}`;
  } else if (typeof value === "string")
    description = `String · ${value.length} characters`;
  else description = typeof value === "number" ? "Number" : "Boolean";
  return { description, bytes };
}

/** Only rewrite whitespace: preserve number precision, duplicate keys and escapes. */
function format(source: string, indent: string): string {
  const tokens =
    source.match(/"(?:\\.|[^"\\])*"|[{}[\],:]|[^\s{}[\],:]+/g) ?? [];
  if (!indent) return tokens.join("");
  const pieces: string[] = [];
  let size = 0;
  let depth = 0;
  function add(piece: string) {
    size += piece.length;
    if (size > MAX_BYTES)
      throw new Error(
        "Formatted output would exceed 500 KiB. Try fewer spaces or Minify.",
      );
    pieces.push(piece);
  }
  function newline() {
    if (depth > 128)
      throw new Error(
        "This JSON is too deeply nested to format. Use Minify or reduce nesting.",
      );
    add(`\n${indent.repeat(depth)}`);
  }
  tokens.forEach((token, index) => {
    if (token === "{" || token === "[") {
      add(token);
      depth++;
      if (tokens[index + 1] !== (token === "{" ? "}" : "]")) newline();
    } else if (token === "}" || token === "]") {
      depth--;
      if (tokens[index - 1] !== (token === "}" ? "{" : "[")) newline();
      add(token);
    } else if (token === ",") {
      add(token);
      newline();
    } else if (token === ":") add(": ");
    else add(token);
  });
  const result = pieces.join("");
  if (sourceBytes(result) > MAX_BYTES)
    throw new Error(
      "Formatted output would exceed 500 KiB. Try fewer spaces or Minify.",
    );
  return result;
}

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("json-app");
  const controller = new AbortController();
  const events = { signal: controller.signal };
  const objectUrls = new Set<string>();
  const revokeTimers = new Set<ReturnType<typeof setTimeout>>();
  let undoValue: string | null = null;
  let validDescription: string | null = null;

  root.innerHTML = `
    <div class="desk-app-toolbar json-toolbar" role="group" aria-label="JSON tools">
      <button type="button" data-json-action="validate">Validate</button>
      <button type="button" data-json-action="format" class="json-primary">Pretty-print</button>
      <button type="button" data-json-action="minify">Minify</button>
      <label class="json-indent">Indent <select data-json-indent aria-label="Indentation"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></label>
    </div>
    <div class="json-editor-heading">
      <label for="desktop-json-editor">JSON source</label>
      <span data-json-type>Not validated</span>
    </div>
    <div class="json-editor-wrap">
      <textarea id="desktop-json-editor" data-json-editor spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-invalid="false" aria-describedby="desktop-json-help desktop-json-status" placeholder='Paste JSON here, or choose Load sample…'></textarea>
    </div>
    <div class="json-document-bar"><span data-json-size>0 B · 1 line</span><span id="desktop-json-help">Local only · 500 KiB limit</span></div>
    <div class="desk-app-toolbar json-actions" role="group" aria-label="JSON document actions">
      <button type="button" data-json-action="sample">Load sample</button>
      <button type="button" data-json-action="clear" disabled>Clear</button>
      <button type="button" data-json-action="undo" disabled>Undo</button>
      <span class="json-toolbar-gap"></span>
      <button type="button" data-json-action="copy" disabled>Copy</button>
      <button type="button" data-json-action="download" disabled>Download</button>
    </div>
    <p id="desktop-json-status" class="desk-app-status json-status" data-json-status role="status">Paste a document to begin. Nothing is stored or sent.</p>
  `;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const editor = find<HTMLTextAreaElement>("[data-json-editor]");
  const indent = find<HTMLSelectElement>("[data-json-indent]");
  const status = find<HTMLElement>("[data-json-status]");
  const type = find<HTMLElement>("[data-json-type]");
  const size = find<HTMLElement>("[data-json-size]");
  const button = (action: string) =>
    find<HTMLButtonElement>(`[data-json-action="${action}"]`);

  function feedback(message: string, error = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  }

  function update() {
    const bytes = sourceBytes(editor.value);
    const overLimit = bytes > MAX_BYTES;
    const lines = overLimit ? 0 : editor.value.split("\n").length;
    const displaySize =
      bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KiB`;
    size.textContent = overLimit
      ? "Over 500 KiB"
      : `${displaySize} · ${lines} ${lines === 1 ? "line" : "lines"}`;
    type.textContent = validDescription ?? "Not validated";
    button("clear").disabled = !editor.value;
    button("undo").disabled = undoValue === null;
    button("copy").disabled = !editor.value || overLimit;
    button("download").disabled = !editor.value || overLimit;
  }

  function replace(value: string) {
    if (editor.value !== value) undoValue = editor.value;
    editor.value = value;
    editor.setAttribute("aria-invalid", "false");
  }

  function validate(): boolean {
    try {
      validDescription = inspect(editor.value).description;
      editor.setAttribute("aria-invalid", "false");
      update();
      return true;
    } catch (error) {
      validDescription = null;
      editor.setAttribute("aria-invalid", "true");
      feedback(
        error instanceof Error
          ? error.message
          : "Unable to validate this document.",
        true,
      );
      update();
      return false;
    }
  }

  editor.addEventListener(
    "input",
    () => {
      undoValue = null;
      validDescription = null;
      editor.setAttribute("aria-invalid", "false");
      const overLimit = sourceBytes(editor.value) > MAX_BYTES;
      feedback(
        overLimit
          ? "Input exceeds 500 KiB. Shorten it before validation or formatting."
          : "Edited. Validate to check the current document.",
        overLimit,
      );
      update();
    },
    events,
  );

  root.addEventListener(
    "click",
    async (event) => {
      const action = (event.target as Element).closest<HTMLButtonElement>(
        "[data-json-action]",
      )?.dataset.jsonAction;
      if (!action) return;
      if (action === "clear" || action === "sample") {
        replace(action === "clear" ? "" : format(SAMPLE, "  "));
        validDescription =
          action === "sample" ? inspect(editor.value).description : null;
        feedback(
          action === "clear"
            ? "Document cleared. Undo restores it."
            : "Sample loaded. Undo restores your previous document.",
        );
        update();
        return;
      }
      if (action === "undo") {
        if (undoValue === null) return;
        editor.value = undoValue;
        undoValue = null;
        validDescription = null;
        editor.setAttribute("aria-invalid", "false");
        feedback("Previous document restored. Validate to check it.");
        update();
        return;
      }
      if (!validate()) return;
      if (action === "validate")
        feedback(
          "Valid JSON. Values and key order are preserved when formatting.",
        );
      if (action === "format" || action === "minify") {
        try {
          const spacing =
            indent.value === "tab" ? "\t" : " ".repeat(Number(indent.value));
          replace(format(editor.value, action === "minify" ? "" : spacing));
          update();
          feedback(
            action === "minify"
              ? "JSON minified. Undo restores the previous layout."
              : "JSON formatted. Undo restores the previous layout.",
          );
        } catch (error) {
          feedback(
            error instanceof Error
              ? error.message
              : "Unable to format this document.",
            true,
          );
        }
      }
      if (action === "copy") {
        const copiedValue = editor.value;
        try {
          await navigator.clipboard.writeText(copiedValue);
          if (!controller.signal.aborted)
            feedback(
              editor.value === copiedValue
                ? "JSON copied to the clipboard."
                : "Previous document copied. The editor has changed since then.",
            );
        } catch {
          if (!controller.signal.aborted)
            feedback(
              "Clipboard access is unavailable. Select the text in the editor and copy it manually.",
              true,
            );
        }
      }
      if (action === "download") {
        let url: string | undefined;
        let link: HTMLAnchorElement | undefined;
        try {
          url = URL.createObjectURL(
            new Blob([editor.value], {
              type: "application/json;charset=utf-8",
            }),
          );
          objectUrls.add(url);
          link = document.createElement("a");
          link.href = url;
          link.download = "document.json";
          link.hidden = true;
          root.append(link);
          link.click();
          const downloadUrl = url;
          const timer = setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
            objectUrls.delete(downloadUrl);
            revokeTimers.delete(timer);
          }, 1000);
          revokeTimers.add(timer);
          feedback("Download requested: document.json.");
        } catch {
          if (url) {
            URL.revokeObjectURL(url);
            objectUrls.delete(url);
          }
          feedback(
            "Download is unavailable. Copy the JSON or select it in the editor.",
            true,
          );
        } finally {
          link?.remove();
        }
      }
    },
    events,
  );

  return () => {
    controller.abort();
    revokeTimers.forEach(clearTimeout);
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}
