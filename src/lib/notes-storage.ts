export const NOTES_KEY = "nearbycoder:notes:v1";
export type Notes = Record<string, { text: string; updated: number }>;
export function parseNotes(raw: string | null): Notes {
  const clean: Notes = Object.create(null);
  try {
    if (!raw || raw.length > 1200000) return clean;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return clean;
    for (const [id, note] of Object.entries(data).slice(0, 100)) {
      const n = note as any;
      if (
        /^[a-z0-9][a-z0-9-]{0,199}$/.test(id) &&
        n &&
        typeof n.text === "string" &&
        n.text.length <= 10000 &&
        Number.isFinite(n.updated) &&
        n.updated >= 0
      )
        clean[id] = { text: n.text, updated: n.updated };
    }
  } catch {}
  return clean;
}
export function readNotes(): Notes {
  try {
    return parseNotes(localStorage.getItem(NOTES_KEY));
  } catch {
    return Object.create(null);
  }
}
export function saveNote(id: string, text: string): boolean {
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(id) || text.length > 10000)
    return false;
  const notes = readNotes();
  if (text.trim()) notes[id] = { text, updated: Date.now() };
  else delete notes[id];
  if (Object.keys(notes).length > 100) return false;
  const bounded = Object.fromEntries(
    Object.entries(notes)
      .sort((a, b) => b[1].updated - a[1].updated)
      .slice(0, 100),
  );
  const serialized = JSON.stringify(bounded);
  if (serialized.length > 1000000) return false;
  try {
    localStorage.setItem(NOTES_KEY, serialized);
    window.dispatchEvent(new CustomEvent("noteschange"));
    return true;
  } catch {
    return false;
  }
}
