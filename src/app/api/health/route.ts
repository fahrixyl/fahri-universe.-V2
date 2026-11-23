import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { redisReady } from "@/lib/redis";
import { limited } from "@/lib/ratelimit";
import { clientIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Buka /api/health untuk cek konfigurasi, /api/health?test=1 untuk tes Gemini sungguhan.
export async function GET(req: Request) {
  const out: Record<string, unknown> = {
    gemini_key: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    visitor_db: redisReady,
    site_url: process.env.NEXT_PUBLIC_SITE_URL || null,
  };
  if (new URL(req.url).searchParams.get("test") === "1") {
    if (await limited(`health:${clientIp(req)}`, 5, 60)) return NextResponse.json({ ...out, gemini_test: "rate-limited" }, { status: 429 });
    try { await askGemini([{ role: "user", content: "Sebutkan nama lengkap Fahri." }]); out.gemini_test = "ok"; }
    catch (e) { out.gemini_test = `gagal (status ${(e as { status?: number }).status ?? "?"})`; }
  }
  return NextResponse.json(out);
}
