import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { redis, redisReady } from "./redis";

export const COOKIE = "fahri_admin";
export const TTL = 7200; // sesi habis setelah 2 jam tidak aktif

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function getCookie(req: Request, name: string) {
  for (const p of (req.headers.get("cookie") || "").split(/;\s*/)) {
    const i = p.indexOf("=");
    if (i > 0 && p.slice(0, i) === name) return decodeURIComponent(p.slice(i + 1));
  }
  return "";
}
const sha = (s: string) => createHash("sha256").update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

export async function isAdmin(req: Request): Promise<boolean> {
  if (!redisReady) return false;
  const t = getCookie(req, COOKIE);
  if (!/^[a-f0-9]{64}$/.test(t)) return false;
  try {
    const v = await redis(["GET", `fahri:sess:${t}`]);
    if (v === null || v === undefined) return false;
    const epoch = (await redis(["GET", "fahri:epoch"])) ?? "0";
    if (String(v) !== String(epoch)) return false;
    await redis(["EXPIRE", `fahri:sess:${t}`, TTL]);
    return true;
  } catch { return false; }
}

// Lindungi endpoint admin. mutating=true: wajib header x-fahri dan origin yang sama (anti-CSRF).
export async function guard(req: Request, mutating: boolean): Promise<Response | null> {
  if (mutating) {
    if (req.headers.get("x-fahri") !== "1") return json({ error: "Permintaan tidak valid." }, 403);
    const o = req.headers.get("origin");
    if (o) { try { if (new URL(o).host !== req.headers.get("host")) return json({ error: "Asal permintaan tidak valid." }, 403); } catch { return json({ error: "Asal permintaan tidak valid." }, 403); } }
  }
  if (!(await isAdmin(req))) return json({ error: "Sesi berakhir. Silakan login lagi." }, 401);
  return null;
}

export async function createSession(): Promise<string> {
  const t = randomBytes(32).toString("hex");
  const epoch = (await redis(["GET", "fahri:epoch"])) ?? "0";
  await redis(["SET", `fahri:sess:${t}`, String(epoch), "EX", TTL]);
  return t;
}
export async function destroySession(req: Request) {
  const t = getCookie(req, COOKIE);
  if (/^[a-f0-9]{64}$/.test(t)) { try { await redis(["DEL", `fahri:sess:${t}`]); } catch {} }
}

type Stored = { user: string; salt: string; hash: string };
async function stored(): Promise<Stored | null> {
  const s = (await redis(["GET", "fahri:admin:cred"])) as string | null;
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
export async function currentUsername(): Promise<string | null> {
  const s = await stored();
  return s ? s.user : process.env.ADMIN_USERNAME || null;
}
// true/false = hasil cek, null = admin belum dikonfigurasi
export async function verifyCreds(user: string, pass: string): Promise<boolean | null> {
  const s = await stored();
  if (s) {
    try {
      const h = scryptSync(pass, Buffer.from(s.salt, "hex"), 64);
      return timingSafeEqual(h, Buffer.from(s.hash, "hex")) && safeEq(user, s.user);
    } catch { return false; }
  }
  const U = process.env.ADMIN_USERNAME, P = process.env.ADMIN_PASSWORD;
  if (!U || !P) return null;
  const a = safeEq(user, U), b = safeEq(pass, P);
  return a && b;
}
export async function isConfigured(): Promise<boolean> {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) return true;
  try { return Boolean(await stored()); } catch { return false; }
}
export async function setCreds(user: string, pass: string) {
  const salt = randomBytes(16);
  await redis(["SET", "fahri:admin:cred", JSON.stringify({ user, salt: salt.toString("hex"), hash: scryptSync(pass, salt, 64).toString("hex") })]);
  await redis(["INCR", "fahri:epoch"]); // semua sesi lama otomatis tidak berlaku
}
