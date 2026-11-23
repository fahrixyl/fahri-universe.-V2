import { json, isAdmin, isConfigured } from "@/lib/admin";
import { redisReady } from "@/lib/redis";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!redisReady) return json({ ok: false, db: false, configured: false });
  const ok = await isAdmin(req);
  return json({ ok, db: true, configured: ok ? true : await isConfigured() }, ok ? 200 : 401);
}
