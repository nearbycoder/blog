import css from "../styles/desktop-markdown.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("markdown", css);

const STORAGE_KEY = "nearby-desktop-markdown-v1";
const MAX_LENGTH = 100_000;
type View = "editor" | "split" | "preview";
type StorageState = "ready" | "invalid" | "unavailable";
type Format = "bold" | "italic" | "heading" | "list" | "link" | "code";

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
  // Keep source positions for outline navigation, including CRLF imports.
  const sourceOffsets: number[] = [];
  let sourceOffset = 0;
  for (const line of source.split(/\r\n?|\n/)) {
    sourceOffsets.push(sourceOffset);
    sourceOffset += line.length;
    sourceOffset +=
      source.slice(sourceOffset, sourceOffset + 2) === "\r\n" ? 2 : 1;
  }
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
      node.dataset.sourceStart = String(sourceOffsets[index]);
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
  let importGeneration = 0;

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
      <button type="button" data-markdown-import>Import file</button>
      <button type="button" data-markdown-download>Download .md</button>
      <button type="button" data-markdown-html>Export HTML</button>
      <button type="button" data-markdown-clear>Clear draft</button>
    </div>
    <input type="file" data-markdown-file accept=".md,.txt,text/markdown,text/plain" aria-label="Import Markdown or text file" hidden>
    <div class="desk-app-toolbar markdown-format-toolbar" role="group" aria-label="Markdown editing tools">
      <button type="button" data-markdown-format="bold" title="Bold (Ctrl or ⌘ B)"><strong>Bold</strong></button>
      <button type="button" data-markdown-format="italic" title="Italic (Ctrl or ⌘ I)"><em>Italic</em></button>
      <button type="button" data-markdown-format="heading" title="Heading (Ctrl or ⌘ Shift H)">Heading</button>
      <button type="button" data-markdown-format="list" title="List (Ctrl or ⌘ Shift L)">List</button>
      <button type="button" data-markdown-format="link" title="Link (Ctrl or ⌘ K)">Link</button>
      <button type="button" data-markdown-format="code" title="Inline code (Ctrl or ⌘ E)">Code</button>
      <button type="button" data-markdown-find-toggle aria-expanded="false" aria-controls="desktop-markdown-find">Find &amp; replace</button>
      <button type="button" data-markdown-outline-toggle aria-expanded="false" aria-controls="desktop-markdown-outline">Outline</button>
    </div>
    <div id="desktop-markdown-find" class="markdown-find" data-markdown-find hidden>
      <label>Find<input type="text" data-markdown-find-text maxlength="100000" spellcheck="false"></label>
      <label>Replace with<input type="text" data-markdown-replacement maxlength="100000" spellcheck="false"></label>
      <div class="markdown-find-actions">
        <button type="button" data-markdown-find-next>Find next</button>
        <button type="button" data-markdown-replace-one>Replace</button>
        <button type="button" data-markdown-replace-all>Replace all</button>
        <button type="button" data-markdown-find-close aria-label="Close find and replace">Close</button>
      </div>
      <p data-markdown-find-status role="status">Matches are case-sensitive, literal text.</p>
    </div>
    <nav id="desktop-markdown-outline" class="markdown-outline" aria-label="Document outline" data-markdown-outline hidden></nav>
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
  const fileInput = query<HTMLInputElement>("[data-markdown-file]");
  const findInput = query<HTMLInputElement>("[data-markdown-find-text]");
  const replacementInput = query<HTMLInputElement>(
    "[data-markdown-replacement]",
  );
  const findStatus = query("[data-markdown-find-status]");
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
    renderOutline();
  }

  function renderOutline() {
    const outline = query("[data-markdown-outline]");
    if (outline.hidden) return;
    const headings = preview.querySelectorAll<HTMLElement>(
      "[data-source-start]",
    );
    outline.replaceChildren();
    if (!headings.length) {
      outline.textContent = "Add a # heading to build your outline.";
      return;
    }
    const list = document.createElement("ol");
    headings.forEach((heading, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.markdownJump = String(index);
      button.style.paddingInlineStart = `${8 + (Number(heading.tagName[1]) - 1) * 10}px`;
      button.textContent = heading.textContent || "Untitled heading";
      item.append(button);
      list.append(item);
    });
    outline.append(list);
  }

  function editText(
    text: string,
    start = editor.selectionStart,
    end = editor.selectionEnd,
  ) {
    if (editor.value.length - (end - start) + text.length > MAX_LENGTH) {
      status.textContent =
        "That edit would exceed the 100,000-character limit. Your draft is unchanged.";
      return false;
    }
    editor.setRangeText(text, start, end, "select");
    render();
    save();
    return true;
  }

  function focusEditor() {
    if (view === "preview") {
      view = "editor";
      updateView();
    }
    editor.focus();
  }

  function format(kind: Format) {
    focusEditor();
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    if (kind === "heading" || kind === "list") {
      start = start === 0 ? 0 : editor.value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = editor.value.indexOf("\n", Math.max(start, end - 1));
      end = lineEnd === -1 ? editor.value.length : lineEnd;
      const selected =
        editor.value.slice(start, end) ||
        (kind === "heading" ? "Heading" : "List item");
      const prefix =
        kind === "heading" ? /^ {0,3}#{1,6}[ \t]+/ : /^ {0,3}[-+*][ \t]+/;
      const lines = selected.split("\n");
      const remove = lines.every((line) => prefix.test(line));
      editText(
        lines
          .map((line) =>
            remove
              ? line.replace(prefix, "")
              : `${kind === "heading" ? "## " : "- "}${line.replace(prefix, "")}`,
          )
          .join("\n"),
        start,
        end,
      );
      return;
    }
    const selected = editor.value.slice(start, end);
    const marker = kind === "bold" ? "**" : kind === "italic" ? "*" : "`";
    const label =
      selected ||
      (kind === "link" ? "link text" : kind === "code" ? "code" : "text");
    const before = kind === "link" ? "[" : marker;
    const after = kind === "link" ? "](https://example.com)" : marker;
    if (editText(`${before}${label}${after}`, start, end)) {
      editor.setSelectionRange(
        start + before.length,
        start + before.length + label.length,
      );
    }
  }

  function toggleFind(open: boolean) {
    query("[data-markdown-find]").hidden = !open;
    query("[data-markdown-find-toggle]").setAttribute(
      "aria-expanded",
      String(open),
    );
    if (open) {
      const selected = editor.value.slice(
        editor.selectionStart,
        editor.selectionEnd,
      );
      if (selected && !selected.includes("\n")) findInput.value = selected;
      findInput.focus();
      findInput.select();
    } else focusEditor();
  }

  function findNext(from = editor.selectionEnd) {
    const needle = findInput.value;
    if (!needle) {
      findStatus.textContent = "Enter text to find.";
      return false;
    }
    let index = editor.value.indexOf(needle, from);
    const wrapped = index === -1 && from > 0;
    if (wrapped) index = editor.value.indexOf(needle);
    if (index === -1) {
      findStatus.textContent = "No matches. Search is case-sensitive.";
      return false;
    }
    focusEditor();
    editor.setSelectionRange(index, index + needle.length);
    findStatus.textContent = `${wrapped ? "Wrapped to the beginning. " : ""}Match selected at character ${index + 1}.`;
    return true;
  }

  function replaceMatches(all: boolean) {
    const needle = findInput.value;
    if (!needle) {
      findStatus.textContent = "Enter text to find before replacing.";
      return;
    }
    if (all) {
      const parts = editor.value.split(needle);
      const count = parts.length - 1;
      if (!count) {
        findStatus.textContent = "No matches. Search is case-sensitive.";
        return;
      }
      // Check the result size before constructing a potentially huge replacement.
      const length =
        editor.value.length +
        count * (replacementInput.value.length - needle.length);
      if (length > MAX_LENGTH) {
        findStatus.textContent =
          "Replacement would exceed 100,000 characters. Draft unchanged.";
        return;
      }
      editText(parts.join(replacementInput.value), 0, editor.value.length);
      findStatus.textContent = `Replaced ${count} ${count === 1 ? "match" : "matches"}.`;
    } else {
      if (
        editor.value.slice(editor.selectionStart, editor.selectionEnd) !==
        needle
      ) {
        findNext();
        return;
      }
      if (editText(replacementInput.value)) {
        editor.setSelectionRange(editor.selectionEnd, editor.selectionEnd);
        findStatus.textContent = "Replaced 1 match.";
      }
    }
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

  function filename() {
    const heading = /^ {0,3}#[ \t]+(.+)$/m.exec(editor.value)?.[1] ?? "draft";
    return (
      heading
        .replace(/[^a-zA-Z0-9 _-]/g, "")
        .trim()
        .slice(0, 70) || "draft"
    );
  }

  function exportHTML() {
    const doc = document.implementation.createHTMLDocument(filename());
    doc.documentElement.lang = "en";
    const charset = doc.createElement("meta");
    charset.setAttribute("charset", "utf-8");
    const viewport = doc.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    const policy = doc.createElement("meta");
    policy.httpEquiv = "Content-Security-Policy";
    policy.content =
      "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";
    const style = doc.createElement("style");
    style.textContent =
      "body{max-width:760px;margin:40px auto;padding:0 24px;font:17px/1.7 system-ui,sans-serif;color:#202823;background:#fff;overflow-wrap:anywhere}h1,h2,h3,h4,h5,h6{line-height:1.3}p{white-space:pre-wrap}pre{white-space:pre-wrap;padding:16px;background:#f0f3ef;border-radius:8px}code{font-family:monospace;background:#f0f3ef}a{color:#165b36}li{margin:.3em 0}@media print{body{margin:0;max-width:none}}";
    doc.head.prepend(charset, viewport, policy);
    doc.head.append(style);
    const main = doc.createElement("main");
    // Serialize only nodes produced by the same allowlisted renderer as preview.
    main.append(renderMarkdown(editor.value));
    main
      .querySelectorAll<HTMLElement>("[data-source-start]")
      .forEach((node) => delete node.dataset.sourceStart);
    doc.body.append(main);
    download(
      `<!doctype html>\n${doc.documentElement.outerHTML}`,
      `${filename()}.html`,
      "text/html;charset=utf-8",
    );
  }

  fileInput.addEventListener(
    "change",
    async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;
      const generation = ++importGeneration;
      if (!/\.(md|txt)$/i.test(file.name) || file.size > MAX_LENGTH * 4) {
        status.textContent =
          "Choose a .md or .txt file with at most 100,000 characters (400 KB maximum). Draft unchanged.";
        return;
      }
      try {
        // Reject malformed bytes instead of silently replacing them with U+FFFD.
        // A successful import must preserve the author's actual text.
        const bytes = await file.arrayBuffer();
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        if (signal.aborted || generation !== importGeneration) return;
        if (text.length > MAX_LENGTH || text.includes("\0")) {
          status.textContent =
            "File is too large or contains binary data. Choose a text file of at most 100,000 characters. Draft unchanged.";
          return;
        }
        if (
          editor.value &&
          !window.confirm(
            "Replace this draft with the imported file? Download a copy first if you want to keep it.",
          )
        )
          return;
        if (editText(text, 0, editor.value.length)) {
          focusEditor();
          editor.setSelectionRange(0, 0);
        }
      } catch {
        if (!signal.aborted && generation === importGeneration)
          status.textContent =
            "Could not read that file as UTF-8 text. Your draft is unchanged.";
      }
    },
    { signal },
  );

  editor.addEventListener(
    "keydown",
    (event) => {
      if (
        event.isComposing ||
        event.altKey ||
        !(event.ctrlKey || event.metaKey)
      )
        return;
      const key = event.key.toLowerCase();
      const kind: Format | undefined = event.shiftKey
        ? key === "h"
          ? "heading"
          : key === "l"
            ? "list"
            : undefined
        : (
            { b: "bold", i: "italic", k: "link", e: "code" } as Record<
              string,
              Format
            >
          )[key];
      if (!kind && key !== "f") return;
      event.preventDefault();
      event.stopPropagation();
      if (kind) format(kind);
      else toggleFind(true);
    },
    { signal },
  );

  query("[data-markdown-find]").addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        toggleFind(false);
      } else if (
        event.key === "Enter" &&
        event.target instanceof HTMLInputElement
      ) {
        event.preventDefault();
        findNext();
      }
    },
    { signal },
  );

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
      if (button.dataset.markdownFormat) {
        format(button.dataset.markdownFormat as Format);
      } else if (button.hasAttribute("data-markdown-import")) {
        fileInput.click();
      } else if (button.hasAttribute("data-markdown-html")) {
        exportHTML();
      } else if (button.hasAttribute("data-markdown-find-toggle")) {
        toggleFind(query("[data-markdown-find]").hidden);
      } else if (button.hasAttribute("data-markdown-find-close")) {
        toggleFind(false);
      } else if (button.hasAttribute("data-markdown-find-next")) {
        findNext();
      } else if (button.hasAttribute("data-markdown-replace-one")) {
        replaceMatches(false);
      } else if (button.hasAttribute("data-markdown-replace-all")) {
        replaceMatches(true);
      } else if (button.hasAttribute("data-markdown-outline-toggle")) {
        const outline = query("[data-markdown-outline]");
        outline.hidden = !outline.hidden;
        button.setAttribute("aria-expanded", String(!outline.hidden));
        renderOutline();
      } else if (button.dataset.markdownJump !== undefined) {
        const heading = preview.querySelectorAll<HTMLElement>(
          "[data-source-start]",
        )[Number(button.dataset.markdownJump)];
        if (!heading) return;
        if (view === "preview") {
          heading.tabIndex = -1;
          heading.focus();
          heading.scrollIntoView({ block: "nearest" });
        } else {
          const start = Number(heading.dataset.sourceStart);
          const end = editor.value.indexOf("\n", start);
          focusEditor();
          editor.setSelectionRange(
            start,
            end === -1 ? editor.value.length : end,
          );
        }
      } else if (button.dataset.markdownView) {
        view = button.dataset.markdownView as View;
        updateView();
      } else if (button.hasAttribute("data-markdown-download")) {
        download(
          editor.value,
          `${filename()}.md`,
          "text/markdown;charset=utf-8",
        );
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
