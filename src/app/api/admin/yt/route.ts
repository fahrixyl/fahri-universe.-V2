import { json, guard } from "@/lib/admin";
import { ytId } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req, false); if (g) return g;
  const id = ytId(new URL(req.url).searchParams.get("url") || "");
  if (!id) return json({ error: "Link YouTube tidak valid." }, 400);
  let title = "";
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://youtu.be/${id}`)}&format=json`, { cache: "no-store" });
    if (r.ok) title = String((await r.json()).title || "").slice(0, 120);
  } catch {}
  return json({ id, title });
}
