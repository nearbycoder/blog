import css from "../styles/desktop-markdown.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("markdown", css);

const STORAGE_KEY = "nearby-desktop-markdown-v1";
const MAX_LENGTH = 100_000;
type View = "editor" | "split" | "preview";
type StorageState = "ready" | "invalid" | "unavailable";

// Every user-controlled fragment becomes text or an explicitly allowed DOM node.
// Bounded link tokens also keep incomplete links inexpensive to parse.
function appendInline(parent: HTMLElement, source: string, depth = 0) {
  const tokens =
    /`([^`\n]+)`|\[([^\[\]\n]{1,500})\]\(([^)\s]{1,2048})\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_/g;
  let offset = 0;
  for (const match of source.matchAll(tokens)) {
    parent.append(document.createTextNode(source.slice(offset, match.index)));
    const [
      whole,
      code,
      label,
      destination,
      bold,
      boldUnder,
      italic,
      italicUnder,
    ] = match;
    let node: HTMLElement | undefined;
    let contents = "";
    if (code !== undefined) {
      node = document.createElement("code");
      node.textContent = code;
    } else if (label !== undefined) {
      try {
        const url = new URL(destination);
        if (
          /^https?:\/\//i.test(destination) &&
          (url.protocol === "https:" || url.protocol === "http:")
        ) {
          const link = document.createElement("a");
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          node = link;
          contents = label;
        }
      } catch {
        // Invalid and disallowed URLs remain visible as literal Markdown.
      }
    } else {
      node = document.createElement(
        bold !== undefined || boldUnder !== undefined ? "strong" : "em",
      );
      contents = bold ?? boldUnder ?? italic ?? italicUnder;
    }
    if (node) {
      if (contents) {
        if (depth < 3) appendInline(node, contents, depth + 1);
        else node.textContent = contents;
      }
      parent.append(node);
    } else parent.append(document.createTextNode(whole));
    offset = match.index! + whole.length;
  }
  parent.append(document.createTextNode(source.slice(offset)));
}

function renderMarkdown(source: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  // The optional language must be nonempty: two adjacent optional whitespace
  // runs otherwise backtrack quadratically on a long, incomplete fence.
  const fence = (line: string) =>
    /^ {0,3}(`{3,}|~{3,})(?:[ \t]*[\w+-]+)?[ \t]*$/.exec(line);
  const heading = (line: string) => /^ {0,3}(#{1,6})[ \t]+(.+)$/.exec(line);
  const item = (line: string) =>
    /^ {0,3}([-+*]|\d{1,9}\.)[ \t]+(.+)$/.exec(line);
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }
    const opening = fence(line);
    if (opening) {
      const marker = opening[1];
      const contents: string[] = [];
      index++;
      while (index < lines.length) {
        const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[index]);
        if (
          closing &&
          closing[1][0] === marker[0] &&
          closing[1].length >= marker.length
        ) {
          index++;
          break;
        }
        contents.push(lines[index++]);
      }
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = contents.join("\n");
      pre.append(code);
      fragment.append(pre);
      continue;
    }
    const title = heading(line);
    if (title) {
      const node = document.createElement(`h${title[1].length}`);
      const text = title[2];
      let end = text.length;
      while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t"))
        end--;
      const markerEnd = end;
      while (end > 0 && text[end - 1] === "#") end--;
      if (
        end < markerEnd &&
        end > 0 &&
        (text[end - 1] === " " || text[end - 1] === "\t")
      ) {
        // Scan backwards once instead of retrying a suffix regex at every
        // space in a potentially 100,000-character heading.
        while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t"))
          end--;
        appendInline(node, text.slice(0, end));
      } else appendInline(node, text);
      fragment.append(node);
      index++;
      continue;
    }
    const firstItem = item(line);
    if (firstItem) {
      const ordered = /\d/.test(firstItem[1][0]);
      const list = document.createElement(ordered ? "ol" : "ul");
      if (ordered)
        (list as HTMLOListElement).start = Number.parseInt(firstItem[1], 10);
      while (index < lines.length) {
        const nextItem = item(lines[index]);
        if (!nextItem || /\d/.test(nextItem[1][0]) !== ordered) break;
        const li = document.createElement("li");
        appendInline(li, nextItem[2]);
        list.append(li);
        index++;
      }
      fragment.append(list);
      continue;
    }
    const paragraph: string[] = [line];
    index++;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !fence(lines[index]) &&
      !heading(lines[index]) &&
      !item(lines[index])
    ) {
      paragraph.push(lines[index++]);
    }
    const node = document.createElement("p");
    appendInline(node, paragraph.join("\n"));
    fragment.append(node);
  }
  return fragment;
}

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const downloads = new Map<string, ReturnType<typeof setTimeout>>();
  let storageState: StorageState = "ready";
  let original: string | null = null;
  let initialText = "";
  let view: View = root.clientWidth < 560 ? "editor" : "split";
  let saveMessage = "Draft stays in this browser";

  try {
    original = localStorage.getItem(STORAGE_KEY);
    if (original !== null) {
      if (original.length > MAX_LENGTH * 6 + 100)
        throw new Error("Draft is too large");
      const saved: unknown = JSON.parse(original);
      if (
        !saved ||
        typeof saved !== "object" ||
        !("version" in saved) ||
        saved.version !== 1 ||
        !("text" in saved) ||
        typeof saved.text !== "string" ||
        saved.text.length > MAX_LENGTH
      ) {
        throw new Error("Invalid saved draft");
      }
      initialText = saved.text;
      saveMessage = "Saved in this browser";
    }
  } catch {
    storageState = original === null ? "unavailable" : "invalid";
  }

  root.classList.add("markdown-app");
  root.innerHTML = `
    <div class="desk-app-toolbar markdown-toolbar">
      <div class="markdown-views" role="group" aria-label="Markdown view">
        <button type="button" data-markdown-view="editor">Editor</button>
        <button type="button" data-markdown-view="split">Split</button>
        <button type="button" data-markdown-view="preview">Preview</button>
      </div>
      <span class="markdown-toolbar-spacer"></span>
      <button type="button" data-markdown-download>Download .md</button>
      <button type="button" data-markdown-clear>Clear draft</button>
    </div>
    <div class="markdown-recovery" data-markdown-recovery hidden>
      <span>Original saved data is preserved. Autosave is paused.</span>
      <div>
        <button type="button" data-markdown-backup>Download saved data</button>
        <button type="button" data-markdown-replace>Replace saved draft</button>
      </div>
    </div>
    <div class="markdown-workspace">
      <section class="markdown-editor-pane" aria-label="Markdown editor">
        <label class="markdown-pane-label" for="desktop-markdown-source">MARKDOWN</label>
        <textarea id="desktop-markdown-source" data-markdown-source maxlength="100000" aria-label="Markdown source" spellcheck="true" placeholder="# A fresh page\n\nWrite something worth keeping.\n\n- A thought\n- A little plan"></textarea>
        <p class="markdown-hint"># Heading · **bold** · *italic* · [link](https://…) · &#96;code&#96;</p>
      </section>
      <section class="markdown-preview-pane" aria-label="Markdown preview">
        <div class="markdown-pane-label">PREVIEW</div>
        <div class="markdown-preview" data-markdown-preview role="region" aria-label="Rendered Markdown" tabindex="0"></div>
      </section>
    </div>
    <div class="desk-app-status markdown-status">
      <span data-markdown-status role="status" aria-live="polite"></span>
      <span data-markdown-count></span>
    </div>
  `;
  const query = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const editor = query<HTMLTextAreaElement>("[data-markdown-source]");
  const preview = query<HTMLDivElement>("[data-markdown-preview]");
  const status = query("[data-markdown-status]");
  const clear = query<HTMLButtonElement>("[data-markdown-clear]");
  editor.value = initialText;

  function showStatus() {
    status.textContent =
      storageState === "invalid"
        ? "Saved draft is unreadable. Autosave is paused."
        : storageState === "unavailable"
          ? "Not saved: browser storage is unavailable. Download a copy."
          : saveMessage;
    query("[data-markdown-recovery]").hidden = storageState !== "invalid";
  }

  function save() {
    if (storageState !== "ready") {
      showStatus();
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, text: editor.value }),
      );
      saveMessage = "Saved in this browser";
    } catch {
      // A failed write must never prevent editing or downloading the draft.
      saveMessage =
        "Not saved: browser storage is full or unavailable. Download a copy.";
    }
    showStatus();
  }

  function render() {
    if (editor.value.length > MAX_LENGTH)
      editor.value = editor.value.slice(0, MAX_LENGTH);
    if (editor.value.trim())
      preview.replaceChildren(renderMarkdown(editor.value));
    else {
      const empty = document.createElement("div");
      empty.className = "markdown-empty";
      const title = document.createElement("strong");
      title.textContent = "Your words, formatted.";
      const hint = document.createElement("p");
      hint.textContent =
        "Write in the editor to preview headings, lists, emphasis, links, and code. HTML stays plain text.";
      empty.append(title, hint);
      preview.replaceChildren(empty);
    }
    const words =
      editor.value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
    query("[data-markdown-count]").textContent =
      `${words.toLocaleString()} ${words === 1 ? "word" : "words"}`;
    clear.disabled = !editor.value;
  }

  function updateView() {
    const narrow = root.clientWidth < 560;
    if (narrow && view === "split") view = "editor";
    root.dataset.markdownView = view;
    root
      .querySelectorAll<HTMLButtonElement>("[data-markdown-view]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.markdownView === view),
        );
        button.hidden = narrow && button.dataset.markdownView === "split";
      });
  }

  function download(text: string, filename: string, type: string) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type }));
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
    } catch {
      status.textContent =
        "Download could not start. Select and copy your draft to keep it.";
    }
  }

  editor.addEventListener(
    "input",
    () => {
      render();
      save();
    },
    { signal },
  );
  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "button",
      );
      if (!button || button.disabled) return;
      if (button.dataset.markdownView) {
        view = button.dataset.markdownView as View;
        updateView();
      } else if (button.hasAttribute("data-markdown-download")) {
        const heading = /^ {0,3}#\s+(.+)$/m.exec(editor.value)?.[1] ?? "draft";
        const filename =
          heading
            .replace(/[^a-zA-Z0-9 _-]/g, "")
            .trim()
            .slice(0, 70) || "draft";
        download(editor.value, `${filename}.md`, "text/markdown;charset=utf-8");
      } else if (
        button.hasAttribute("data-markdown-clear") &&
        window.confirm(
          "Clear this draft? Download a copy first if you want to keep it.",
        )
      ) {
        editor.value = "";
        render();
        save();
        view = "editor";
        updateView();
        editor.focus();
      } else if (
        button.hasAttribute("data-markdown-backup") &&
        original !== null
      ) {
        download(
          original,
          "markdown-saved-data.json",
          "application/json;charset=utf-8",
        );
      } else if (
        button.hasAttribute("data-markdown-replace") &&
        window.confirm(
          "Replace the unreadable saved draft with this text? Download saved data first to keep the original.",
        )
      ) {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ version: 1, text: editor.value }),
          );
          original = null;
          storageState = "ready";
          saveMessage = "Saved in this browser";
          showStatus();
        } catch {
          status.textContent =
            "Could not save this draft. Original saved data is still preserved.";
        }
      }
    },
    { signal },
  );

  const observer = new ResizeObserver(updateView);
  observer.observe(root);
  updateView();
  render();
  showStatus();

  return () => {
    controller.abort();
    observer.disconnect();
    downloads.forEach((timer, url) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    });
    downloads.clear();
  };
}
