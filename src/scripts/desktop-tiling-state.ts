import type { LayoutDocument } from "@danfessler/trellis";

export const TILING_KEY = "desktop-tiling:v1";
export const TILING_LIMIT = 256 * 1024;

export type TilingDesk = {
  enabled: boolean;
  flow?: "columns" | "canvas";
  columnWidths?: Record<string, number>;
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  document: LayoutDocument | null;
  floatingKeys?: string[];
};
export type TilingState = {
  version: 1;
  desks: Record<string, TilingDesk>;
};

export const defaultTilingState = (): TilingState => ({
  version: 1,
  desks: {},
});
export const defaultTilingDesk = (): TilingDesk => ({
  enabled: false,
  width: 1600,
  height: 1100,
  scrollX: 0,
  scrollY: 0,
  document: null,
  floatingKeys: [],
});

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
const fields = (value: RecordValue, allowed: string[]) =>
  Object.keys(value).every((key) => allowed.includes(key));
const text = (value: unknown, max = 300): value is string =>
  typeof value === "string" &&
  value.length <= max &&
  !/[\u0000-\u001f\u007f]/.test(value);
const identifier = (value: unknown): value is string =>
  text(value) &&
  value.trim().length > 0 &&
  !["__proto__", "prototype", "constructor"].includes(value);
const number = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
const integer = (value: unknown, min: number, max: number) =>
  number(value, min, max) && Number.isInteger(value);

/** Validate instead of repairing: damaged or future layouts stay recoverable. */
export function validTilingDocument(value: unknown): value is LayoutDocument {
  if (
    !record(value) ||
    !fields(value, [
      "schema",
      "version",
      "root",
      "floating",
      "hidden",
      "views",
      "navigation",
    ]) ||
    value.schema !== 1 ||
    (value.version !== undefined &&
      !text(value.version, 100) &&
      !(typeof value.version === "number" && Number.isFinite(value.version))) ||
    !Array.isArray(value.floating) ||
    value.floating.length !== 0 ||
    !Array.isArray(value.hidden) ||
    value.hidden.length !== 0 ||
    !record(value.views)
  )
    return false;

  const entries = Object.entries(value.views);
  if (entries.length > 128) return false;
  const viewIds = new Set<string>();
  const windowKeys = new Set<string>();
  for (const [id, view] of entries) {
    if (
      !identifier(id) ||
      !record(view) ||
      !fields(view, ["type", "params", "title"]) ||
      view.type !== "desktop" ||
      !record(view.params) ||
      !fields(view.params, ["key"]) ||
      !identifier(view.params.key) ||
      windowKeys.has(view.params.key) ||
      (view.title !== undefined && !text(view.title))
    )
      return false;
    viewIds.add(id);
    windowKeys.add(view.params.key);
  }

  const nodeIds = new Set<string>();
  const ownedViews = new Set<string>();
  let stages = 0;
  function node(item: unknown, depth: number, insideStage = false): boolean {
    if (
      depth > 24 ||
      nodeIds.size >= 256 ||
      !record(item) ||
      !identifier(item.id) ||
      nodeIds.has(item.id) ||
      viewIds.has(item.id)
    )
      return false;
    nodeIds.add(item.id);
    if (item.kind === "panel") {
      if (
        !fields(item, ["kind", "id", "views", "selected"]) ||
        !Array.isArray(item.views) ||
        !item.views.length ||
        item.views.length > 128 ||
        !item.views.includes(item.selected)
      )
        return false;
      for (const view of item.views) {
        if (!identifier(view) || !viewIds.has(view) || ownedViews.has(view))
          return false;
        ownedViews.add(view);
      }
      return true;
    }
    if (item.kind === "split") {
      if (
        !fields(item, ["kind", "id", "axis", "weights", "children"]) ||
        !["x", "y"].includes(item.axis as string) ||
        !Array.isArray(item.children) ||
        item.children.length < 2 ||
        item.children.length > 128 ||
        !Array.isArray(item.weights) ||
        item.weights.length !== item.children.length ||
        !item.weights.every(
          (weight) =>
            typeof weight === "number" && Number.isFinite(weight) && weight > 0,
        ) ||
        !Number.isFinite(item.weights.reduce((sum, weight) => sum + weight, 0))
      )
        return false;
      return item.children.every((child) =>
        node(child, depth + 1, insideStage),
      );
    }
    if (item.kind === "stage") {
      if (!fields(item, ["kind", "id", "child"]) || insideStage || ++stages > 1)
        return false;
      return (
        item.child === undefined ||
        (record(item.child) &&
          item.child.kind !== "stage" &&
          node(item.child, depth + 1, true))
      );
    }
    return false;
  }
  if (value.root !== null && !node(value.root, 0)) return false;
  if (ownedViews.size !== viewIds.size) return false;

  if (value.navigation !== undefined) {
    const navigation = value.navigation;
    const frame = (item: unknown) =>
      Array.isArray(item) &&
      item.length <= 256 &&
      new Set(item).size === item.length &&
      item.every(
        (id) => identifier(id) && (nodeIds.has(id) || viewIds.has(id)),
      );
    if (
      !record(navigation) ||
      !fields(navigation, ["frame", "framings"]) ||
      (navigation.frame !== undefined && !frame(navigation.frame))
    )
      return false;
    if (navigation.framings !== undefined) {
      const ids = new Set<string>();
      if (
        !Array.isArray(navigation.framings) ||
        navigation.framings.length > 32
      )
        return false;
      for (const framing of navigation.framings) {
        if (
          !record(framing) ||
          !fields(framing, ["id", "name", "frame"]) ||
          !identifier(framing.id) ||
          ids.has(framing.id) ||
          !text(framing.name, 100) ||
          !frame(framing.frame)
        )
          return false;
        ids.add(framing.id);
      }
    }
  }
  return true;
}

export function validTilingState(value: unknown): value is TilingState {
  if (
    !record(value) ||
    !fields(value, ["version", "desks"]) ||
    value.version !== 1 ||
    !record(value.desks) ||
    Object.keys(value.desks).length > 8
  )
    return false;
  for (const [id, desk] of Object.entries(value.desks)) {
    if (
      !/^desk-[a-z0-9-]{1,48}$/.test(id) ||
      !record(desk) ||
      !fields(desk, [
        "enabled",
        "width",
        "height",
        "scrollX",
        "scrollY",
        "document",
        "floatingKeys",
        "flow",
        "columnWidths",
      ]) ||
      typeof desk.enabled !== "boolean" ||
      (desk.flow !== undefined &&
        desk.flow !== "columns" &&
        desk.flow !== "canvas") ||
      (desk.columnWidths !== undefined &&
        (!record(desk.columnWidths) ||
          Object.keys(desk.columnWidths).length > 128 ||
          !Object.entries(desk.columnWidths).every(
            ([key, width]) => identifier(key) && number(width, 92, 6000),
          ))) ||
      !integer(desk.width, 800, 6000) ||
      !integer(desk.height, 800, 6000) ||
      !number(desk.scrollX, 0, desk.flow === "columns" ? 768032 : 6000) ||
      !number(desk.scrollY, 0, 6000) ||
      (desk.floatingKeys !== undefined &&
        (!Array.isArray(desk.floatingKeys) ||
          desk.floatingKeys.length > 128 ||
          !desk.floatingKeys.every(identifier) ||
          new Set(desk.floatingKeys).size !== desk.floatingKeys.length)) ||
      (desk.document !== null && !validTilingDocument(desk.document))
    )
      return false;
  }
  const raw = JSON.stringify(value);
  return (
    raw.length <= TILING_LIMIT &&
    new TextEncoder().encode(raw).length <= TILING_LIMIT
  );
}
