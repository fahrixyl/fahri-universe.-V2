import { json, guard } from "@/lib/admin";
import { askGemini, GeminiError } from "@/lib/gemini";
import { validateMessages } from "@/lib/validation";
import { mergeContent } from "@/lib/content";
import { limited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tes memakai konten DRAF (belum dipublikasikan) yang dikirim dari dashboard.
export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  if (await limited("aitest", 30, 60)) return json({ error: "Terlalu cepat. Tunggu sebentar." }, 429);
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const messages = validateMessages(b);
  if (!messages) return json({ error: "Pesan tidak valid." }, 400);
  try { return json({ reply: await askGemini(messages, mergeContent(b?.content)) }); }
  catch (e) { return json({ error: `Gemini gagal (status ${e instanceof GeminiError ? e.status : "?"}). Cek /api/health?test=1.` }, 502); }
}
