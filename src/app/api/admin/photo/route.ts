import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const img = String(b?.image || "");
  const m = img.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!m || m[1].length > 450000) return json({ error: "Foto harus JPG dan di bawah 330 KB." }, 400);
  await redis(["SET", "fahri:photo:draft", m[1]]);
  return json({ ok: true, version: Date.now() });
}
