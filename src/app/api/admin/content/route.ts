import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { mergeContent } from "@/lib/content";
import { getDraft, getLive } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req, false); if (g) return g;
  return json({ draft: await getDraft(), live: await getLive() });
}
export async function PUT(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const content = mergeContent(b?.content);
  await redis(["SET", "fahri:content:draft", JSON.stringify(content)]);
  return json({ ok: true, draft: content });
}
