import css from "../styles/desktop-texttools.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("texttools", css);

const LIMIT = 100_000;
function encodeUtf8(value: string) {
  // TextEncoder otherwise silently replaces isolated UTF-16 surrogates.
  if (/[\uD800-\uDFFF]/u.test(value)) {
    throw new Error("The text contains an incomplete Unicode character.");
  }
  return new TextEncoder().encode(value);
}
const transforms: Record<string, (value: string) => string> = {
  upper: (value) => value.toLocaleUpperCase(),
  lower: (value) => value.toLocaleLowerCase(),
  title: (value) =>
    value
      .toLocaleLowerCase()
      .replace(
        /(^|\s)(\p{L})/gu,
        (_, space, letter) => space + letter.toLocaleUpperCase(),
      ),
  trim: (value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .join("\n"),
  unique: (value) => [...new Set(value.split("\n"))].join("\n"),
  sort: (value) =>
    value
      .split("\n")
      .sort((a, b) => a.localeCompare(b))
      .join("\n"),
  encode: (value) => encodeURIComponent(value),
  decode: (value) => decodeURIComponent(value),
  base64: (value) =>
    btoa(
      Array.from(encodeUtf8(value), (byte) => String.fromCharCode(byte)).join(
        "",
      ),
    ),
  unbase64: (value) =>
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      Uint8Array.from(atob(value.replace(/\s/g, "")), (character) =>
        character.charCodeAt(0),
      ),
    ),
};

export function mountApp(root: HTMLElement): () => void {
  root.classList.add("texttools-app");
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const history: string[] = [];
  let alive = true;
  const downloads = new Map<string, number>();
  root.innerHTML = `
    <div class="desk-app-toolbar texttools-toolbar">
      <label>Transformation<select data-texttools-transform>
        <option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option>
        <option value="trim">Trim each line</option><option value="unique">Remove duplicate lines</option><option value="sort">Sort lines</option>
        <option value="encode">URL encode</option><option value="decode">URL decode</option><option value="base64">Base64 encode</option><option value="unbase64">Base64 decode</option>
      </select></label><button type="button" data-texttools-apply>Apply</button><button type="button" data-texttools-undo disabled>Undo</button>
    </div>
    <div class="texttools-metrics" aria-live="off"><span data-texttools-words>0 words</span><span data-texttools-chars>0 characters</span><span data-texttools-lines>0 lines</span><span data-texttools-bytes>0 bytes</span></div>
    <label class="texttools-editor">Text<textarea data-texttools-input spellcheck="false" maxlength="100000" placeholder="Paste a little text to work with…"></textarea></label>
    <form class="texttools-replace"><label>Find literal text<input data-texttools-find maxlength="10000" autocomplete="off"></label><label>Replace with<input data-texttools-replacement maxlength="10000" autocomplete="off"></label><button type="submit">Replace all</button></form>
    <div class="desk-app-toolbar texttools-actions"><button type="button" data-texttools-copy>Copy text</button><button type="button" data-texttools-download>Download .txt</button><button type="button" data-texttools-clear>Clear</button></div>
    <p class="desk-app-status" role="status" data-texttools-status>Local only. Text is not saved or sent. Up to 100,000 characters.</p>
  `;
  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const input = find<HTMLTextAreaElement>("[data-texttools-input]");
  const status = find<HTMLElement>("[data-texttools-status]");
  const undo = find<HTMLButtonElement>("[data-texttools-undo]");
  function say(message: string) {
    if (alive) status.textContent = message;
  }
  function stats() {
    const value = input.value;
    find<HTMLElement>("[data-texttools-words]").textContent =
      `${value.trim() ? value.trim().split(/\s+/).length : 0} words`;
    find<HTMLElement>("[data-texttools-chars]").textContent =
      `${[...value].length.toLocaleString()} characters`;
    find<HTMLElement>("[data-texttools-lines]").textContent =
      `${value ? value.split("\n").length : 0} lines`;
    find<HTMLElement>("[data-texttools-bytes]").textContent =
      `${new TextEncoder().encode(value).length.toLocaleString()} bytes`;
    undo.disabled = history.length === 0;
    for (const action of ["copy", "download", "clear", "apply"])
      find<HTMLButtonElement>(`[data-texttools-${action}]`).disabled = !value;
  }
  function replace(value: string, message: string) {
    if (value.length > LIMIT) {
      say(
        "The result exceeds 100,000 characters. Your original text is unchanged.",
      );
      return;
    }
    if (value === input.value) {
      say("No changes were needed.");
      return;
    }
    history.push(input.value);
    if (history.length > 20) history.shift();
    input.value = value;
    stats();
    say(message);
  }
  input.addEventListener(
    "input",
    () => {
      if (input.value.length > LIMIT) {
        say(
          "Text exceeds the 100,000-character limit. Shorten it before transforming.",
        );
        return;
      }
      stats();
    },
    options,
  );
  find<HTMLButtonElement>("[data-texttools-apply]").addEventListener(
    "click",
    () => {
      if (input.value.length > LIMIT) {
        say("Shorten the text to 100,000 characters first.");
        return;
      }
      const action = find<HTMLSelectElement>(
        "[data-texttools-transform]",
      ).value;
      try {
        replace(
          transforms[action](input.value),
          "Transformation applied. Undo restores the previous text.",
        );
      } catch {
        say(
          action === "decode" || action === "unbase64"
            ? "That text could not be decoded. Check the encoding; your original text is unchanged."
            : "That text could not be transformed. Check the text; your original text is unchanged.",
        );
      }
    },
    options,
  );
  undo.addEventListener(
    "click",
    () => {
      const previous = history.pop();
      if (previous !== undefined) {
        input.value = previous;
        stats();
        say("Previous text restored.");
      }
    },
    options,
  );
  find<HTMLFormElement>(".texttools-replace").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const search = find<HTMLInputElement>("[data-texttools-find]").value;
      const replacement = find<HTMLInputElement>(
        "[data-texttools-replacement]",
      ).value;
      if (!search) {
        say("Enter text to find first.");
        return;
      }
      if (input.value.length > LIMIT) {
        say("Shorten the text to 100,000 characters first.");
        return;
      }
      const parts = input.value.split(search);
      if (
        input.value.length +
          (parts.length - 1) * (replacement.length - search.length) >
        LIMIT
      ) {
        say(
          "The result exceeds 100,000 characters. Your original text is unchanged.",
        );
        return;
      }
      replace(
        parts.join(replacement),
        `${parts.length - 1} replacements made.`,
      );
    },
    options,
  );
  find<HTMLButtonElement>("[data-texttools-clear]").addEventListener(
    "click",
    () => replace("", "Text cleared. Undo restores it."),
    options,
  );
  find<HTMLButtonElement>("[data-texttools-copy]").addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(input.value);
        say("Text copied.");
      } catch {
        say(
          "Clipboard access is unavailable. Select the text and copy it manually.",
        );
      }
    },
    options,
  );
  find<HTMLButtonElement>("[data-texttools-download]").addEventListener(
    "click",
    () => {
      try {
        const url = URL.createObjectURL(
          new Blob([encodeUtf8(input.value)], {
            type: "text/plain;charset=utf-8",
          }),
        );
        downloads.set(
          url,
          window.setTimeout(() => {
            URL.revokeObjectURL(url);
            downloads.delete(url);
          }, 1000),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "text-workshop.txt";
        link.hidden = true;
        document.body.append(link);
        try {
          link.click();
        } finally {
          link.remove();
        }
        say("Text download started.");
      } catch {
        say("The download could not start. Copy the text instead.");
      }
    },
    options,
  );
  stats();
  return () => {
    alive = false;
    controller.abort();
    downloads.forEach((timer, url) => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
    });
    downloads.clear();
  };
}
