import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "fahri:ai:unanswered";
export async function GET(req: Request) {
  const g = await guard(req, false); if (g) return g;
  const raw = ((await redis(["LRANGE", KEY, 0, 29])) as string[]) || [];
  return json({ items: raw.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) });
}
export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const raw = ((await redis(["LRANGE", KEY, 0, 99])) as string[]) || [];
  for (const r of raw) { try { if (JSON.parse(r).q === b?.q) await redis(["LREM", KEY, 0, r]); } catch {} }
  return json({ ok: true });
}
