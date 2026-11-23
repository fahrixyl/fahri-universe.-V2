import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req, false); if (g) return g;
  const raw = ((await redis(["LRANGE", "fahri:msgs", 0, 49])) as string[]) || [];
  const messages = raw.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
  await redis(["SET", "fahri:msgs:unread", 0]);
  return json({ messages });
}
export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const raw = ((await redis(["LRANGE", "fahri:msgs", 0, 199])) as string[]) || [];
  const hit = raw.find((r) => { try { return JSON.parse(r).id === b?.id; } catch { return false; } });
  if (hit) await redis(["LREM", "fahri:msgs", 0, hit]);
  return json({ ok: true });
}
