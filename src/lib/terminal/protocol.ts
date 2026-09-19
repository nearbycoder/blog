export const MAX_PANES = 8;
export const MAX_TABS = 4;
export type Connection = { endpoint: string; target: string };
export function connectionSettings(
  endpoint: string,
  target: string,
): Connection {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("Enter a complete WebSocket URL, starting with wss://.");
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "wss:" && !(url.protocol === "ws:" && loopback))
    throw new Error(
      "Use wss:// for remote connections. ws:// is only allowed on localhost.",
    );
  if (url.username || url.password || url.search || url.hash)
    throw new Error(
      "Use a URL without credentials, query parameters, or a fragment. Enter the access token separately.",
    );
  if (!/^[a-zA-Z0-9_-]{1,48}$/.test(target))
    throw new Error(
      "Target names use 1–48 letters, numbers, hyphens, or underscores.",
    );
  return { endpoint: url.href, target };
}
export type ServerMessage =
  | { type: "ready"; title: string }
  | { type: "output"; data: string }
  | { type: "error"; message: string }
  | { type: "exit"; code: number };
export function serverMessage(data: unknown): ServerMessage | undefined {
  if (typeof data !== "string" || data.length > 131072) return;
  try {
    const message = JSON.parse(data);
    if (
      message?.type === "output" &&
      typeof message.data === "string" &&
      message.data.length <= 65536
    )
      return message;
    if (
      message?.type === "ready" &&
      typeof message.title === "string" &&
      message.title.length <= 120
    )
      return message;
    if (
      message?.type === "error" &&
      typeof message.message === "string" &&
      message.message.length <= 256
    )
      return message;
    if (message?.type === "exit" && Number.isInteger(message.code))
      return message;
  } catch {
    /* Invalid protocol frames are rejected, never rendered as markup. */
  }
}
