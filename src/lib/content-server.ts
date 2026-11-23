import { redis, redisReady } from "./redis";
import { DEFAULTS, mergeContent, type Content } from "./content";

let cache: { t: number; c: Content } | null = null;
export const bustCache = () => { cache = null; };

export async function getRaw(which: "live" | "draft"): Promise<unknown | null> {
  const v = await redis(["GET", `fahri:content:${which}`]);
  if (!v) return null;
  try { return JSON.parse(v as string); } catch { return null; }
}
export async function getLive(): Promise<Content> {
  if (!redisReady) return DEFAULTS;
  if (cache && Date.now() - cache.t < 10000) return cache.c;
  try { const c = mergeContent(await getRaw("live")); cache = { t: Date.now(), c }; return c; } catch { return DEFAULTS; }
}
export async function getDraft(): Promise<Content> {
  try { const d = await getRaw("draft"); return d ? mergeContent(d) : mergeContent(await getRaw("live")); } catch { return DEFAULTS; }
}
export function dayKey(offset = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(new Date(Date.now() - offset * 86400000));
}
