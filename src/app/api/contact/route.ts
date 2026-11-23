import { randomBytes } from "crypto";
import { json } from "@/lib/admin";
import { redis, redisReady } from "@/lib/redis";
import { limited } from "@/lib/ratelimit";
import { clientIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!redisReady) return json({ error: "Pesan belum bisa dikirim saat ini. Hubungi lewat WhatsApp." }, 503);
  if (await limited(`contact:${clientIp(req)}`, 3, 600)) return json({ error: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." }, 429);
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  if (b?.website) return json({ ok: true }); // honeypot anti-spam
  const name = String(b?.name || "").trim().slice(0, 60), message = String(b?.message || "").trim().slice(0, 1000);
  const contact = String(b?.contact || "").trim().slice(0, 100);
  if (name.length < 2 || message.length < 5) return json({ error: "Isi nama dan pesan dengan lengkap." }, 400);
  const item = { id: randomBytes(6).toString("hex"), name, contact, message, at: new Date().toISOString() };
  try {
    await redis(["LPUSH", "fahri:msgs", JSON.stringify(item)]);
    await redis(["LTRIM", "fahri:msgs", 0, 199]);
    await redis(["INCR", "fahri:msgs:unread"]);
  } catch { return json({ error: "Gagal mengirim pesan. Coba lagi." }, 502); }
  return json({ ok: true });
}
