"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "./ContentProvider";
import { waUrl } from "@/lib/content";

type Cmd = { label: string; run: () => void };
const go = (to: string) => () => window.dispatchEvent(new CustomEvent("fahri:go", { detail: to }));
const ext = (u: string) => () => window.open(u, "_blank", "noopener,noreferrer");

export default function CommandCenter() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const c = useContent();
  const cmds: Cmd[] = useMemo(() => [
    { label: "Buka Tentang Saya", run: go("about") }, { label: "Buka Keahlian", run: go("skills") },
    { label: "Buka Hobi dan Minat", run: go("hobbies") }, { label: "Buka Proyek", run: go("projects") },
    { label: "Buka Media Sosial", run: go("social") }, { label: "Buka Kontak", run: go("contact") },
    { label: "Buka WhatsApp", run: ext(waUrl(c)) }, { label: "Buka Instagram", run: ext(c.profile.instagram) },
    { label: "Buka GitHub", run: ext(c.profile.github) }, { label: "Buka TikTok", run: ext(c.profile.tiktok) }, { label: "Buka Musik", run: go("music") }, { label: "Buka FAHRI AI", run: go("ai") },
  ], [c]);
  const list = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    const o = () => setOpen(true);
    window.addEventListener("keydown", k); window.addEventListener("fahri:cmd", o);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("fahri:cmd", o); };
  }, []);
  useEffect(() => { if (open) { setQ(""); setI(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);
  useEffect(() => setI(0), [q]);

  if (!open) return null;
  const run = (c?: Cmd) => { if (!c) return; setOpen(false); setTimeout(c.run, 120); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
    else if (e.key === "Enter") run(list[i]);
  };
  return (
    <div className="fixed inset-0 z-[90] bg-space/70 backdrop-blur-sm grid items-start justify-items-center pt-[15vh] px-4" onClick={() => setOpen(false)} role="dialog" aria-modal aria-label="Command Center">
      <div className="glass rounded-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bagian atau tautan…" className="w-full bg-transparent px-5 py-4 outline-none border-b border-white/10 text-sm" />
        <ul className="max-h-72 overflow-auto p-2" role="listbox">
          {list.length === 0 && <li className="px-4 py-3 text-sm text-mute">Tidak ada hasil.</li>}
          {list.map((c, n) => (
            <li key={c.label} role="option" aria-selected={n === i}>
              <button onMouseEnter={() => setI(n)} onClick={() => run(c)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm ${n === i ? "bg-electric/25 text-ink" : "text-mute"}`}>{c.label}</button>
            </li>
          ))}
        </ul>
        <p className="px-5 py-2 border-t border-white/10 text-[11px] text-mute font-mono">↑↓ pilih · Enter buka · Esc tutup</p>
      </div>
    </div>
  );
}
