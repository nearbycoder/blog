import type { LayoutNode } from "@danfessler/trellis";

export const COLUMN_GAP = 12;
export const COLUMN_INSET = COLUMN_GAP;
export const columnWidth = (width: number) =>
  Math.max(80 + COLUMN_GAP, Math.min(6000, width));
export const defaultColumnWidth = (viewport: number) =>
  Math.max(480, Math.min(1200, (viewport - COLUMN_INSET) / 2));

/** Horizontal splits form the strip; vertical stacks and tab groups stay intact. */
export function columnsOf(node: LayoutNode | null): LayoutNode[] {
  if (!node) return [];
  if (node.kind === "stage") return columnsOf(node.child ?? null);
  if (node.kind === "split" && node.axis === "x")
    return node.children.flatMap(columnsOf);
  return [node];
}

export function selectedViews(node: LayoutNode): string[] {
  if (node.kind === "panel") return [node.selected];
  if (node.kind === "stage") return node.child ? selectedViews(node.child) : [];
  return node.children.flatMap(selectedViews);
}

export function containsView(node: LayoutNode, id?: string): boolean {
  if (!id) return false;
  if (node.kind === "panel") return node.views.includes(id);
  if (node.kind === "stage")
    return !!node.child && containsView(node.child, id);
  return node.children.some((child) => containsView(child, id));
}

/** A newly stacked column inherits its existing window's width. */
export function inheritedWidth(
  node: LayoutNode,
  widths: Record<string, number>,
): number | undefined {
  if (widths[node.id]) return widths[node.id];
  if (node.kind === "split") {
    for (const child of node.children) {
      const width = inheritedWidth(child, widths);
      if (width) return width;
    }
  }
}

export function columnRoot(
  columns: LayoutNode[],
  widths: Record<string, number>,
  id: string,
): LayoutNode | null {
  if (columns.length < 2) return columns[0] ?? null;
  const total = columns.reduce((sum, column) => sum + widths[column.id], 0);
  return {
    kind: "split",
    id,
    axis: "x",
    children: columns,
    weights: columns.map((column) => widths[column.id] / total),
  };
}
