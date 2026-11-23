import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { mergeContent } from "@/lib/content";
import { bustCache, getRaw } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Banner langsung berlaku (draf dan live sekaligus), karena ini saklar cepat.
export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const banner = mergeContent({ banner: { enabled: b?.enabled, text: b?.text, link: b?.link } }).banner;
  if (banner.enabled && !banner.text) return json({ error: "Isi teks banner dulu." }, 400);
  for (const w of ["live", "draft"] as const) {
    const raw: any = (await getRaw(w)) || {};
    await redis(["SET", `fahri:content:${w}`, JSON.stringify({ ...raw, banner })]);
  }
  bustCache();
  return json({ ok: true, banner });
}
