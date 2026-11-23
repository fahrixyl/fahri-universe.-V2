import { json, COOKIE, TTL, createSession, verifyCreds } from "@/lib/admin";
import { redis, redisReady } from "@/lib/redis";
import { clientIp } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!redisReady) return json({ error: "Database belum terhubung (Upstash Redis). Cek /api/health." }, 503);
  if (req.headers.get("x-fahri") !== "1") return json({ error: "Permintaan tidak valid." }, 403);
  const key = `fahri:login:fail:${clientIp(req)}`;
  try {
    if ((Number(await redis(["GET", key])) || 0) >= 5) return json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." }, 429);
    let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
    const ok = await verifyCreds(String(b?.username || "").slice(0, 80), String(b?.password || "").slice(0, 200));
    if (ok === null) return json({ error: "Admin belum dikonfigurasi. Isi ADMIN_USERNAME dan ADMIN_PASSWORD di Vercel lalu Redeploy." }, 503);
    if (!ok) {
      const n = Number(await redis(["INCR", key]));
      if (n === 1) await redis(["EXPIRE", key, 900]);
      await new Promise((r) => setTimeout(r, 500));
      return json({ error: `Username atau password salah. Sisa percobaan: ${Math.max(0, 5 - n)}.` }, 401);
    }
    await redis(["DEL", key]);
    const token = await createSession();
    const res = json({ ok: true });
    res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL });
    return res;
  } catch { return json({ error: "Terjadi kesalahan server. Coba lagi." }, 502); }
}
