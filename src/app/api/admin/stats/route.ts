import { json, guard } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { dayKey } from "@/lib/content-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req, false); if (g) return g;
  const days = Array.from({ length: 7 }, (_, i) => dayKey(6 - i));
  try {
    const [v, a, total, ai, unread] = await Promise.all([
      redis(["MGET", ...days.map((d) => `fahri:v:day:${d}`)]) as Promise<(string | null)[]>,
      redis(["MGET", ...days.map((d) => `fahri:ai:day:${d}`)]) as Promise<(string | null)[]>,
      redis(["GET", "fahri:visitors:total"]), redis(["GET", "fahri:ai:total"]), redis(["GET", "fahri:msgs:unread"]),
    ]);
    const series = days.map((d, i) => ({ date: d, visitors: Number(v[i]) || 0, ai: Number(a[i]) || 0 }));
    return json({ today: series[6].visitors, week: series.reduce((s, x) => s + x.visitors, 0), total: Number(total) || 0, aiTotal: Number(ai) || 0, aiToday: series[6].ai, unread: Number(unread) || 0, series });
  } catch { return json({ error: "Gagal membaca statistik." }, 502); }
}
