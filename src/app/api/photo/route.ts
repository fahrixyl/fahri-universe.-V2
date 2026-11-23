import { isAdmin } from "@/lib/admin";
import { redis, redisReady } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!redisReady) return new Response("Not found", { status: 404 });
  const draft = new URL(req.url).searchParams.get("draft") === "1" && (await isAdmin(req));
  let b64: string | null = null;
  try { b64 = (await redis(["GET", draft ? "fahri:photo:draft" : "fahri:photo"])) as string | null; } catch {}
  if (!b64) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(b64, "base64"), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": draft ? "private, no-store" : "public, max-age=31536000, immutable" },
  });
}
