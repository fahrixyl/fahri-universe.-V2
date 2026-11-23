// Klien Upstash Redis via REST (tanpa dependensi tambahan).
const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const redisReady = Boolean(URL_ && TOKEN);

export async function redis(cmd: (string | number)[]): Promise<unknown> {
  if (!redisReady) throw new Error("redis-not-configured");
  const r = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("redis-error");
  return (await r.json()).result;
}
