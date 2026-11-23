import { profile as P, hobbies as H } from "@/data/fahri-profile";
import { skills as S } from "@/data/skills";
import { projects as PR } from "@/data/projects";
import { VIDEO_ID } from "@/lib/youtube";

export type Skill = { icon: string; title: string; text: string; tags: string[] };
export type Hobby = { icon: string; title: string; text: string };
export type Proj = { name: string; category: string; description: string; tech: string[]; image: string; demo: string; source: string };
export type Track = { id: string; title: string };
export type Faq = { q: string; a: string };
export type Content = {
  profile: { name: string; tagline: string; bio: string; instagram: string; github: string; tiktok: string; whatsappNumber: string; email: string };
  hobbies: Hobby[]; skills: Skill[]; projects: Proj[]; playlist: Track[];
  knowledgeNotes: string; faq: Faq[];
  banner: { enabled: boolean; text: string; link: string };
  theme: { preset: string; quality: "hemat" | "normal" | "hd" };
  photoVersion: number;
};

export const ICONS = ["web", "prog", "net", "mikrotik", "linux", "server", "sec", "tech", "invest", "read", "game"];
export const PRESETS = ["cyan", "ungu", "hijau", "oranye", "pink"];

export const DEFAULTS: Content = {
  profile: { name: P.name, tagline: P.tagline, bio: P.description, instagram: P.instagram, github: P.github, tiktok: P.tiktok, whatsappNumber: P.whatsappNumber, email: P.email },
  hobbies: H.map((h) => ({ icon: h.icon, title: h.title, text: h.text })),
  skills: S.map((s) => ({ icon: s.icon, title: s.title, text: s.text, tags: [...s.tags] })),
  projects: PR.map((p) => ({ name: p.name, category: p.category, description: p.description, tech: p.tech, image: p.image || "", demo: p.demo || "", source: p.source || "" })),
  playlist: [{ id: VIDEO_ID, title: "" }],
  knowledgeNotes: "", faq: [],
  banner: { enabled: false, text: "", link: "" },
  theme: { preset: "cyan", quality: "normal" },
  photoVersion: 0,
};

export function ytId(input: string): string | null {
  const s = (input || "").trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s); const h = u.hostname.replace(/^(www|m)\./, "");
    if (h === "youtu.be") { const id = u.pathname.slice(1).split("/")[0]; return /^[\w-]{11}$/.test(id) ? id : null; }
    if (h.endsWith("youtube.com")) {
      const v = u.searchParams.get("v"); if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/); if (m) return m[2];
    }
  } catch {}
  return null;
}
export const waUrl = (c: Content) => `https://wa.me/${c.profile.whatsappNumber.replace(/\D/g, "")}`;

const str = (v: unknown, max: number, d = "") => (typeof v === "string" ? v.trim().slice(0, max) : d);
const url = (v: unknown, d = "") => { const s = str(v, 300, d); return /^https:\/\//i.test(s) ? s : s.startsWith("/") ? s : d && !s ? d : ""; };
const list = <T,>(v: unknown, max: number, f: (x: any) => T | null, d: T[]): T[] =>
  Array.isArray(v) ? v.slice(0, max).map(f).filter((x): x is T => x !== null) : d;

export function mergeContent(raw: any): Content {
  const D = DEFAULTS; const r = raw && typeof raw === "object" ? raw : {};
  const p = r.profile || {};
  const icon = (v: unknown) => (ICONS.includes(v as string) ? (v as string) : "tech");
  const q = r.theme?.quality;
  return {
    profile: {
      name: str(p.name, 60, D.profile.name) || D.profile.name, tagline: str(p.tagline, 120, D.profile.tagline),
      bio: str(p.bio, 400, D.profile.bio), instagram: url(p.instagram, D.profile.instagram), github: url(p.github, D.profile.github),
      tiktok: url(p.tiktok, D.profile.tiktok), whatsappNumber: str(p.whatsappNumber, 20, D.profile.whatsappNumber).replace(/[^\d+]/g, "") || D.profile.whatsappNumber,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(p.email, 120)) ? str(p.email, 120) : D.profile.email,
    },
    hobbies: list(r.hobbies, 12, (x) => (x && str(x.title, 40) ? { icon: icon(x.icon), title: str(x.title, 40), text: str(x.text, 120) } : null), D.hobbies),
    skills: list(r.skills, 16, (x) => (x && str(x.title, 40) ? { icon: icon(x.icon), title: str(x.title, 40), text: str(x.text, 240), tags: list(x.tags, 8, (t) => (str(t, 24) ? str(t, 24) : null), []) } : null), D.skills),
    projects: list(r.projects, 20, (x) => (x && str(x.name, 60) ? { name: str(x.name, 60), category: str(x.category, 30), description: str(x.description, 300), tech: list(x.tech, 10, (t) => (str(t, 24) ? str(t, 24) : null), []), image: url(x.image), demo: url(x.demo), source: url(x.source) } : null), D.projects),
    playlist: list(r.playlist, 30, (x) => (x && /^[\w-]{11}$/.test(x.id || "") ? { id: x.id, title: str(x.title, 120) } : null), D.playlist),
    knowledgeNotes: str(r.knowledgeNotes, 3000),
    faq: list(r.faq, 40, (x) => (x && str(x.q, 200) && str(x.a, 600) ? { q: str(x.q, 200), a: str(x.a, 600) } : null), []),
    banner: { enabled: Boolean(r.banner?.enabled), text: str(r.banner?.text, 160), link: url(r.banner?.link) },
    theme: { preset: PRESETS.includes(r.theme?.preset) ? r.theme.preset : "cyan", quality: q === "hemat" || q === "hd" ? q : "normal" },
    photoVersion: Number.isFinite(r.photoVersion) && r.photoVersion > 0 ? Math.floor(r.photoVersion) : 0,
  };
}
