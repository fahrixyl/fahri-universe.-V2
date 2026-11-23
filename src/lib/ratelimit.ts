import { redis, redisReady } from "./redis";
const mem = new Map<string, { n: number; t: number }>();

export async function limited(key: string, max: number, windowSec: number): Promise<boolean> {
  if (redisReady) {
    try {
      const k = `fahri:rl:${key}`;
      const n = Number(await redis(["INCR", k]));
      if (n === 1) await redis(["EXPIRE", k, windowSec]);
      return n > max;
    } catch { /* jatuh ke memori */ }
  }
  const now = Date.now();
  const e = mem.get(key);
  if (!e || now - e.t > windowSec * 1000) { mem.set(key, { n: 1, t: now }); return false; }
  e.n++;
  return e.n > max;
}
