/** Preserve unreadable/future records; never replace them with defaults on boot. */
export function localState<T>(
  key: string,
  initial: T,
  valid: (value: unknown) => value is T,
  maxBytes = 128 * 1024,
) {
  let value = initial;
  let writable = true;
  let message = "Saved on this device.";
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      if (
        raw.length > maxBytes ||
        new TextEncoder().encode(raw).length > maxBytes
      )
        throw new Error("limit");
      const parsed: unknown = JSON.parse(raw);
      if (!valid(parsed)) throw new Error("format");
      value = parsed;
    }
  } catch {
    writable = false;
    message =
      "Saved data could not be read. Changes last for this visit; the original is preserved.";
  }
  return {
    get value() {
      return value;
    },
    get message() {
      return message;
    },
    get writable() {
      return writable;
    },
    save(next: T) {
      if (!valid(next)) return false;
      const raw = JSON.stringify(next);
      if (new TextEncoder().encode(raw).length > maxBytes) return false;
      value = next;
      if (!writable) return false;
      try {
        localStorage.setItem(key, raw);
        message = "Saved on this device.";
        return true;
      } catch {
        message =
          "Browser storage is unavailable. Changes last for this visit.";
        return false;
      }
    },
  };
}

export function downloadDesktopFile(
  name: string,
  content: string,
  type: string,
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
