export type ChatMsg = { role: "user" | "model"; content: string };
export const MAX_MSG = 500;
export const MAX_TURNS = 12;

export function validateMessages(body: unknown): ChatMsg[] | null {
  const m = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(m) || m.length === 0) return null;
  const out: ChatMsg[] = [];
  for (const x of m.slice(-MAX_TURNS)) {
    if (!x || (x.role !== "user" && x.role !== "model") || typeof x.content !== "string") return null;
    const c = x.content.trim().slice(0, MAX_MSG);
    if (!c) return null;
    out.push({ role: x.role, content: c });
  }
  if (out[out.length - 1].role !== "user") return null;
  while (out[0].role !== "user") out.shift();
  return out;
}
