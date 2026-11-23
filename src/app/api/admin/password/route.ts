import { json, guard, verifyCreds, currentUsername, setCreds } from "@/lib/admin";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const g = await guard(req, true); if (g) return g;
  let b: any; try { b = await req.json(); } catch { return json({ error: "Format tidak valid." }, 400); }
  const cur = String(b?.current || ""), next = String(b?.next || ""), nu = String(b?.username || "").trim().slice(0, 40);
  const user = await currentUsername();
  if (!user) return json({ error: "Admin belum dikonfigurasi." }, 503);
  const key = "fahri:pwchange:fail";
  if ((Number(await redis(["GET", key])) || 0) >= 5) return json({ error: "Terlalu banyak percobaan. Coba lagi 15 menit." }, 429);
  if (!(await verifyCreds(user, cur))) {
    const n = Number(await redis(["INCR", key])); if (n === 1) await redis(["EXPIRE", key, 900]);
    return json({ error: "Password saat ini salah." }, 401);
  }
  if (next.length < 10) return json({ error: "Password baru minimal 10 karakter." }, 400);
  if (next === cur) return json({ error: "Password baru harus berbeda." }, 400);
  await setCreds(nu.length >= 3 ? nu : user, next);
  return json({ ok: true });
}
