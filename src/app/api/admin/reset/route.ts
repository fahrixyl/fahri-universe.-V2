import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { DEFAULTS } from "@/lib/content";
import { bustCache } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  if (b?.confirm !== "RESET") return json({ error: "Ketik RESET untuk konfirmasi." }, 400);
  for (const k of ["fahri:content:live", "fahri:content:draft", "fahri:photo", "fahri:photo:draft"]) await redis(["DEL", k]);
  bustCache();
  return json({ ok: true, content: DEFAULTS });
}
