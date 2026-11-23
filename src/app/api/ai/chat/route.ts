import { NextResponse } from "next/server";
import { askGemini, GeminiError } from "@/lib/gemini";
import { validateMessages } from "@/lib/validation";
import { limited } from "@/lib/ratelimit";
import { clientIp } from "@/lib/utils";
import { redis, redisReady } from "@/lib/redis";
import { dayKey } from "@/lib/content-server";
import { FALLBACK_ANSWER } from "@/data/fahri-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (await limited(`chat:${ip}`, 12, 60) || await limited(`chatday:${ip}`, 120, 86400)) {
    return NextResponse.json({ error: "Terlalu banyak pesan. Coba lagi sebentar lagi." }, { status: 429 });
  }
  if (Number(req.headers.get("content-length") || 0) > 20000) {
    return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }
  const messages = validateMessages(body);
  if (!messages) return NextResponse.json({ error: "Pesan tidak valid atau kosong." }, { status: 400 });

  try {
    const reply = await askGemini(messages);
    if (redisReady) {
      try {
        await redis(["INCR", "fahri:ai:total"]);
        const dk = `fahri:ai:day:${dayKey()}`;
        if (Number(await redis(["INCR", dk])) === 1) await redis(["EXPIRE", dk, 3456000]);
        if (reply.includes(FALLBACK_ANSWER.slice(0, 40))) {
          await redis(["LPUSH", "fahri:ai:unanswered", JSON.stringify({ q: messages[messages.length - 1].content.slice(0, 200), at: new Date().toISOString() })]);
          await redis(["LTRIM", "fahri:ai:unanswered", 0, 99]);
        }
      } catch {}
    }
    return NextResponse.json({ reply });
  } catch (e) {
    const s = e instanceof GeminiError ? e.status : 500;
    console.error("[ai-chat]", s);
    const msg = s === 429 ? "FAHRI AI sedang ramai. Coba lagi beberapa saat lagi."
      : s === 503 ? "FAHRI AI belum dikonfigurasi di server."
      : "FAHRI AI sedang tidak tersedia. Coba lagi nanti.";
    return NextResponse.json({ error: msg }, { status: s === 503 ? 503 : s === 429 ? 429 : 502 });
  }
}
