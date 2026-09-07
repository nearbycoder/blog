import { parseReadingState, type ReadingState } from "./reading-storage";
import { parseNotes, type Notes } from "./notes-storage";
export type BackupCatalog = { id: string; headings: { slug: string }[] }[];
export function reviewBackup(raw: string, catalog: BackupCatalog) {
  if (raw.length > 1500000) throw Error("File is too large.");
  const data = JSON.parse(raw);
  if (
    !data ||
    data.version !== 1 ||
    !data.reading ||
    typeof data.reading !== "object" ||
    Array.isArray(data.reading) ||
    !data.notes ||
    typeof data.notes !== "object" ||
    Array.isArray(data.notes)
  )
    throw Error("Choose a version 1 Nearbycoder reading backup.");
  const allowed = new Map(
    catalog.map((a) => [a.id, new Set(a.headings.map((h) => h.slug))]),
  );
  const reading: ReadingState = Object.create(null),
    notes: Notes = Object.create(null);
  for (const [id, entry] of Object.entries(
    parseReadingState(JSON.stringify(data.reading)),
  )) {
    if (allowed.has(id))
      reading[id] = {
        ...entry,
        heading: allowed.get(id)!.has(entry.heading) ? entry.heading : "",
      };
  }
  for (const [id, note] of Object.entries(
    parseNotes(JSON.stringify(data.notes)),
  ))
    if (allowed.has(id)) notes[id] = note;
  return {
    reading,
    notes,
    skipped:
      Object.keys(data.reading).length +
      Object.keys(data.notes).length -
      Object.keys(reading).length -
      Object.keys(notes).length,
  };
}

export function mergeReadingBackup(
  imported: { reading: ReadingState; notes: Notes },
  local: { reading: ReadingState; notes: Notes },
) {
  const reading: ReadingState = Object.assign(
      Object.create(null),
      local.reading,
    ),
    notes: Notes = Object.assign(Object.create(null), local.notes);
  for (const [id, entry] of Object.entries(imported.reading))
    if (!reading[id] || entry.updated > reading[id].updated)
      reading[id] = entry;
  for (const [id, note] of Object.entries(imported.notes))
    if (!notes[id] || note.updated > notes[id].updated) notes[id] = note;
  if (Object.keys(reading).length > 100 || Object.keys(notes).length > 100)
    throw new RangeError(
      "This merge would exceed the 100-entry storage limit. Export a backup and remove unneeded entries before importing.",
    );
  if (JSON.stringify(notes).length > 1000000)
    throw new RangeError(
      "These notes exceed the available note capacity. Export a backup and remove unneeded notes before importing.",
    );
  return { reading, notes };
}
