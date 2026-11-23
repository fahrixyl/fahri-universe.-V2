"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ICONS, PRESETS, type Content, type Skill, type Hobby, type Proj } from "@/lib/content";
import { THEMES, applyTheme } from "@/lib/theme";
import { Btn, Field, api, card } from "./ui";

export type Upd = (fn: (d: Content) => Content) => void;
const move = <T,>(a: T[], i: number, d: number) => { const n = [...a]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; };
const rm = <T,>(a: T[], i: number) => a.filter((_, k) => k !== i);

function Row({ i, n, onUp, onDown, onDel, children }: { i: number; n: number; onUp: () => void; onDown: () => void; onDel: () => void; children: React.ReactNode }) {
  return (
    <div className={`${card} p-3.5 space-y-3`}>
      {children}
      <div className="flex gap-2">
        <button onClick={onUp} disabled={i === 0} aria-label="Naikkan" className="h-11 w-11 grid place-items-center rounded-xl border border-white/10 disabled:opacity-30"><ArrowUp size={17} /></button>
        <button onClick={onDown} disabled={i === n - 1} aria-label="Turunkan" className="h-11 w-11 grid place-items-center rounded-xl border border-white/10 disabled:opacity-30"><ArrowDown size={17} /></button>
        <button onClick={onDel} aria-label="Hapus" className="ml-auto h-11 px-4 flex items-center gap-2 rounded-xl border border-red-400/40 text-red-300 text-sm"><Trash2 size={16} />Hapus</button>
      </div>
    </div>
  );
}
const IconSelect = ({ v, set }: { v: string; set: (s: string) => void }) => (
  <label className="block text-xs text-mute">Ikon
    <select value={v} onChange={(e) => set(e.target.value)} className="mt-1.5 h-12 w-full rounded-2xl border border-white/10 bg-space/60 px-3 text-base text-ink">{ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select>
  </label>
);

export function SkillsHobbies({ d, upd }: { d: Content; upd: Upd }) {
  const [tab, setTab] = useState<"skills" | "hobbies">("skills");
  const setS = (i: number, p: Partial<Skill>) => upd((c) => ({ ...c, skills: c.skills.map((x, k) => (k === i ? { ...x, ...p } : x)) }));
  const setH = (i: number, p: Partial<Hobby>) => upd((c) => ({ ...c, hobbies: c.hobbies.map((x, k) => (k === i ? { ...x, ...p } : x)) }));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">{(["skills", "hobbies"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`min-h-[44px] rounded-2xl text-sm font-semibold ${tab === t ? "bg-cyan/15 text-cyan border border-cyan/40" : "border border-white/10 text-mute"}`}>{t === "skills" ? "Keahlian" : "Hobi"}</button>)}</div>
      {tab === "skills" ? (<>
        {d.skills.map((s, i) => (
          <Row key={i} i={i} n={d.skills.length} onUp={() => upd((c) => ({ ...c, skills: move(c.skills, i, -1) }))} onDown={() => upd((c) => ({ ...c, skills: move(c.skills, i, 1) }))} onDel={() => upd((c) => ({ ...c, skills: rm(c.skills, i) }))}>
            <Field label="Nama keahlian" value={s.title} onChange={(v) => setS(i, { title: v })} maxLength={40} />
            <Field label="Keterangan" value={s.text} onChange={(v) => setS(i, { text: v })} multi rows={2} maxLength={240} />
            <Field label="Topik (pisahkan dengan koma)" value={s.tags.join(", ")} onChange={(v) => setS(i, { tags: v.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8) })} />
            <IconSelect v={s.icon} set={(v) => setS(i, { icon: v })} />
          </Row>
        ))}
        <Btn variant="ghost" className="w-full" onClick={() => upd((c) => ({ ...c, skills: [...c.skills, { icon: "tech", title: "Keahlian baru", text: "", tags: [] }] }))}><Plus size={18} />Tambah keahlian</Btn>
      </>) : (<>
        {d.hobbies.map((h, i) => (
          <Row key={i} i={i} n={d.hobbies.length} onUp={() => upd((c) => ({ ...c, hobbies: move(c.hobbies, i, -1) }))} onDown={() => upd((c) => ({ ...c, hobbies: move(c.hobbies, i, 1) }))} onDel={() => upd((c) => ({ ...c, hobbies: rm(c.hobbies, i) }))}>
            <Field label="Nama hobi" value={h.title} onChange={(v) => setH(i, { title: v })} maxLength={40} />
            <Field label="Keterangan" value={h.text} onChange={(v) => setH(i, { text: v })} maxLength={120} />
            <IconSelect v={h.icon} set={(v) => setH(i, { icon: v })} />
          </Row>
        ))}
        <Btn variant="ghost" className="w-full" onClick={() => upd((c) => ({ ...c, hobbies: [...c.hobbies, { icon: "tech", title: "Hobi baru", text: "" }] }))}><Plus size={18} />Tambah hobi</Btn>
      </>)}
    </div>
  );
}

export function Projects({ d, upd }: { d: Content; upd: Upd }) {
  const set = (i: number, p: Partial<Proj>) => upd((c) => ({ ...c, projects: c.projects.map((x, k) => (k === i ? { ...x, ...p } : x)) }));
  return (
    <div className="space-y-3">
      <p className="text-xs text-mute">Hanya isi proyek yang benar-benar milikmu. Link harus diawali https://.</p>
      {d.projects.map((p, i) => (
        <Row key={i} i={i} n={d.projects.length} onUp={() => upd((c) => ({ ...c, projects: move(c.projects, i, -1) }))} onDown={() => upd((c) => ({ ...c, projects: move(c.projects, i, 1) }))} onDel={() => upd((c) => ({ ...c, projects: rm(c.projects, i) }))}>
          <Field label="Nama proyek" value={p.name} onChange={(v) => set(i, { name: v })} maxLength={60} />
          <Field label="Kategori" value={p.category} onChange={(v) => set(i, { category: v })} maxLength={30} />
          <Field label="Deskripsi" value={p.description} onChange={(v) => set(i, { description: v })} multi rows={3} maxLength={300} />
          <Field label="Teknologi (pisahkan dengan koma)" value={p.tech.join(", ")} onChange={(v) => set(i, { tech: v.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 10) })} />
          <Field label="Link gambar pratinjau" value={p.image} onChange={(v) => set(i, { image: v })} placeholder="https://…" />
          <Field label="Link demo" value={p.demo} onChange={(v) => set(i, { demo: v })} placeholder="https://…" />
          <Field label="Link source code" value={p.source} onChange={(v) => set(i, { source: v })} placeholder="https://github.com/…" />
        </Row>
      ))}
      <Btn variant="ghost" className="w-full" onClick={() => upd((c) => ({ ...c, projects: [...c.projects, { name: "Proyek baru", category: "Web", description: "", tech: [], image: "", demo: "", source: "" }] }))}><Plus size={18} />Tambah proyek</Btn>
    </div>
  );
}

export function Messages({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [list, setList] = useState<any[] | null>(null);
  const load = async () => { const r = await api("/api/admin/messages"); if (r.status === 401) return onUnauthorized(); setList(r.data.messages || []); };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const del = async (id: string) => { await api("/api/admin/messages", "POST", { id }); setList((l) => (l || []).filter((m) => m.id !== id)); };
  if (!list) return <p className="text-sm text-mute">Memuat pesan…</p>;
  if (!list.length) return <div className={`${card} p-6 text-center text-sm text-mute`}>Belum ada pesan masuk.</div>;
  return (
    <div className="space-y-3">
      {list.map((m) => (
        <div key={m.id} className={`${card} p-4`}>
          <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-display font-semibold truncate">{m.name}</p>{m.contact && <p className="text-xs text-cyan truncate">{m.contact}</p>}</div><button onClick={() => del(m.id)} aria-label="Hapus pesan" className="h-10 w-10 grid place-items-center text-mute"><Trash2 size={17} /></button></div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message}</p>
          <p className="mt-2 text-[11px] text-mute">{new Date(m.at).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })} WITA</p>
        </div>
      ))}
    </div>
  );
}

export function Look({ d, upd }: { d: Content; upd: Upd }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold mb-2">Warna tema</p>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((p) => { const t = THEMES[p as keyof typeof THEMES]; const on = d.theme.preset === p; return (
            <button key={p} onClick={() => { upd((c) => ({ ...c, theme: { ...c.theme, preset: p } })); applyTheme(p); }} aria-pressed={on} className={`flex flex-col items-center gap-1.5 rounded-2xl border py-2.5 text-[11px] ${on ? "border-cyan bg-cyan/10" : "border-white/10 text-mute"}`}>
              <i className="h-7 w-7 rounded-full" style={{ background: `rgb(${t.cyan})`, boxShadow: `0 0 14px rgb(${t.cyan} / .6)` }} />{t.label}
            </button>); })}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-1">Kualitas grafis bawaan</p>
        <p className="text-xs text-mute mb-2">Dipakai untuk pengunjung baru. Pengunjung tetap bisa mengubahnya sendiri.</p>
        <div className="grid grid-cols-3 gap-2">
          {(["hemat", "normal", "hd"] as const).map((q) => <button key={q} onClick={() => upd((c) => ({ ...c, theme: { ...c.theme, quality: q } }))} aria-pressed={d.theme.quality === q} className={`min-h-[46px] rounded-2xl text-sm font-semibold ${d.theme.quality === q ? "bg-cyan/15 text-cyan border border-cyan/40" : "border border-white/10 text-mute"}`}>{q === "hd" ? "HD" : q === "hemat" ? "Hemat" : "Normal"}</button>)}
        </div>
      </div>
    </div>
  );
}

export function Password({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ username: "", current: "", next: "", again: "" });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (f.next !== f.again) return setMsg("Konfirmasi password tidak sama.");
    setBusy(true); const r = await api("/api/admin/password", "POST", { username: f.username, current: f.current, next: f.next }); setBusy(false);
    if (!r.ok) return setMsg(r.data.error || "Gagal mengganti password.");
    setMsg("Berhasil. Silakan login lagi dengan password baru."); setTimeout(onDone, 1600);
  };
  return (
    <div className="space-y-3">
      <Field label="Username baru (opsional)" value={f.username} onChange={(v) => setF({ ...f, username: v })} maxLength={40} hint="Kosongkan bila username tetap." />
      <Field label="Password saat ini" type="password" value={f.current} onChange={(v) => setF({ ...f, current: v })} />
      <Field label="Password baru (minimal 10 karakter)" type="password" value={f.next} onChange={(v) => setF({ ...f, next: v })} />
      <Field label="Ulangi password baru" type="password" value={f.again} onChange={(v) => setF({ ...f, again: v })} />
      <Btn className="w-full" onClick={submit} disabled={busy || !f.current || !f.next}>{busy ? "Menyimpan…" : "Ganti password"}</Btn>
      {msg && <p role="status" className="text-sm text-cyan">{msg}</p>}
    </div>
  );
}

export function Reset({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState(""); const [msg, setMsg] = useState("");
  const go = async () => { const r = await api("/api/admin/reset", "POST", { confirm: t }); if (!r.ok) return setMsg(r.data.error || "Gagal reset."); setMsg("Semua isi dikembalikan ke data awal."); onDone(); };
  return (
    <div className="space-y-3">
      <p className="text-sm text-mute leading-relaxed">Ini mengembalikan profil, keahlian, hobi, proyek, playlist, banner, tema, tanya-jawab AI, dan foto ke data awal. Pesan masuk dan statistik tidak dihapus. Tindakan ini tidak bisa dibatalkan.</p>
      <Field label="Ketik RESET untuk konfirmasi" value={t} onChange={setT} />
      <Btn variant="danger" className="w-full" onClick={go} disabled={t !== "RESET"}>Reset ke data awal</Btn>
      {msg && <p role="status" className="text-sm text-cyan">{msg}</p>}
    </div>
  );
}
