import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { mergeContent } from "@/lib/content";
import { bustCache } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const content = mergeContent(b?.content);
  const s = JSON.stringify(content);
  await redis(["SET", "fahri:content:draft", s]);
  await redis(["SET", "fahri:content:live", s]);
  const photo = (await redis(["GET", "fahri:photo:draft"])) as string | null;
  if (photo && content.photoVersion > 0) await redis(["SET", "fahri:photo", photo]);
  bustCache();
  return json({ ok: true, live: content });
}
