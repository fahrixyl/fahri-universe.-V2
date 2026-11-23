"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Folder, Home, KeyRound, ListMusic, LogOut, Mail, Menu as MenuIcon, Palette, Pencil, Plus, RefreshCw, RotateCcw, Send, Sparkles, Trash2, Zap, ExternalLink } from "lucide-react";
import { DEFAULTS, type Content } from "@/lib/content";
import { applyTheme } from "@/lib/theme";
import { Btn, Field, PhotoCropper, Sheet, Switch, api, card } from "./ui";
import { Look, Messages, Password, Projects, Reset, SkillsHobbies, type Upd } from "./Editors";

type Tab = "home" | "profile" | "music" | "ai" | "menu";
type Sub = null | "skills" | "projects" | "messages" | "look" | "password" | "reset";
const BG = "radial-gradient(70% 28% at 85% 0%, rgb(var(--electric)/.35), transparent 70%), radial-gradient(60% 24% at 0% 100%, rgb(var(--cyan)/.14), transparent 70%), #05070D";

export default function AdminApp() {
  const [auth, setAuth] = useState<"loading" | "out" | "in">("loading");
  const [info, setInfo] = useState({ db: true, configured: true });
  useEffect(() => {
    api("/api/admin/session").then((r) => { setInfo({ db: r.data.db !== false, configured: r.data.configured !== false }); setAuth(r.ok ? "in" : "out"); });
  }, []);
  if (auth === "loading") return <div className="fixed inset-0 grid place-items-center bg-space"><span className="h-12 w-12 rounded-full orb" /></div>;
  if (auth === "out") return <Login info={info} onDone={() => setAuth("in")} />;
  return <Panel onLogout={() => setAuth("out")} />;
}

function Login({ info, onDone }: { info: { db: boolean; configured: boolean }; onDone: () => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [show, setShow] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await api("/api/admin/login", "POST", { username: u, password: p });
    setBusy(false);
    if (r.ok) onDone(); else setErr(r.data.error || "Gagal login.");
  };
  return (
    <div className="fixed inset-0 overflow-y-auto text-ink" style={{ background: BG }}>
      <form onSubmit={submit} className="mx-auto flex min-h-full max-w-sm flex-col justify-center gap-4 px-6 py-10">
        <div className="text-center">
          <span className="orb mx-auto block h-16 w-16 rounded-full" />
          <h1 className="font-display mt-4 text-2xl font-bold">Masuk Admin</h1>
          <p className="mt-1 text-sm text-mute">Fahri Universe · Dashboard</p>
        </div>
        {!info.db && <p role="alert" className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">Database (Upstash Redis) belum terhubung. Isi UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN di Vercel, lalu Redeploy.</p>}
        {info.db && !info.configured && <p role="alert" className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">Admin belum dikonfigurasi. Isi ADMIN_USERNAME dan ADMIN_PASSWORD di Vercel (Environment Variables), lalu Redeploy.</p>}
        <Field label="Username" value={u} onChange={setU} maxLength={80} />
        <div>
          <Field label="Password" type={show ? "text" : "password"} value={p} onChange={setP} maxLength={200} />
          <button type="button" onClick={() => setShow(!show)} className="mt-2 flex items-center gap-2 text-xs text-mute">{show ? <EyeOff size={14} /> : <Eye size={14} />}{show ? "Sembunyikan" : "Tampilkan"} password</button>
        </div>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
        <Btn type="submit" disabled={busy || !u || !p} className="w-full">{busy ? "Memeriksa…" : "Masuk"}</Btn>
        <p className="text-center text-xs leading-relaxed text-mute">Maksimal 5 percobaan, lalu dikunci 15 menit.<br />Sesi berakhir otomatis setelah 2 jam tidak aktif.</p>
      </form>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [draft, setDraft] = useState<Content | null>(null);
  const [saved, setSaved] = useState(""); const [liveJson, setLiveJson] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("home"); const [sub, setSub] = useState<Sub>(null);
  const [toast, setToast] = useState(""); const [busy, setBusy] = useState(false);
  const [crop, setCrop] = useState(false); const [preview, setPreview] = useState(0);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 3800); };
  const expire = useCallback(() => { flash("Sesi berakhir. Silakan login lagi."); setTimeout(onLogout, 900); }, [onLogout]);

  const load = useCallback(async () => {
    const r = await api("/api/admin/content");
    if (r.status === 401) return expire();
    if (r.ok) { setDraft(r.data.draft); setSaved(JSON.stringify(r.data.draft)); setLiveJson(JSON.stringify(r.data.live)); }
  }, [expire]);
  const loadStats = useCallback(async () => { const r = await api("/api/admin/stats"); if (r.status === 401) return expire(); if (r.ok) setStats(r.data); }, [expire]);
  useEffect(() => { load(); loadStats(); }, [load, loadStats]);
  useEffect(() => { if (draft) applyTheme(draft.theme.preset); }, [draft?.theme.preset]); // eslint-disable-line

  const upd: Upd = (fn) => setDraft((d) => (d ? fn(d) : d));
  const dirty = !!draft && JSON.stringify(draft) !== saved;
  const unpublished = !!draft && JSON.stringify(draft) !== liveJson;

  const save = async (d: Content | null = draft): Promise<boolean> => {
    if (!d) return false; setBusy(true);
    const r = await api("/api/admin/content", "PUT", { content: d }); setBusy(false);
    if (r.status === 401) { expire(); return false; }
    if (!r.ok) { flash(r.data.error || "Gagal menyimpan."); return false; }
    setDraft(r.data.draft); setSaved(JSON.stringify(r.data.draft)); return true;
  };
  const publish = async () => {
    if (!draft) return; setBusy(true);
    const r = await api("/api/admin/publish", "POST", { content: draft }); setBusy(false);
    if (r.status === 401) return expire();
    if (!r.ok) return flash(r.data.error || "Gagal mempublikasikan.");
    setDraft(r.data.live); setSaved(JSON.stringify(r.data.live)); setLiveJson(JSON.stringify(r.data.live)); flash("Dipublikasikan. Website sudah diperbarui.");
  };
  const logout = async () => { await api("/api/admin/logout", "POST"); onLogout(); };

  if (!draft) return <div className="fixed inset-0 grid place-items-center bg-space text-mute text-sm">Memuat data…</div>;

  const nav: { id: Tab; label: string; I: typeof Home }[] = [{ id: "home", label: "Beranda", I: Home }, { id: "profile", label: "Profil", I: Pencil }, { id: "music", label: "Musik", I: ListMusic }, { id: "ai", label: "AI", I: Sparkles }, { id: "menu", label: "Menu", I: MenuIcon }];
  const showSave = tab !== "home" && !(tab === "menu" && (sub === null || sub === "messages" || sub === "password" || sub === "reset"));
  const photoSrc = draft.photoVersion > 0 ? `/api/photo?draft=1&v=${draft.photoVersion}` : "/images/fahri-portrait.jpg?v=2";

  return (
    <div className="fixed inset-0 text-ink" style={{ background: BG }}>
      <div className="mx-auto h-full max-w-md overflow-y-auto px-5 pt-6" style={{ paddingBottom: showSave ? 190 : 110 }}>
        {tab === "home" && <HomeTab draft={draft} stats={stats} reload={loadStats} unpublished={unpublished} onPreview={async () => { if (dirty) await save(); setPreview(Date.now()); }} onBanner={(nb) => { setDraft((d) => d && { ...d, banner: nb }); setSaved((s) => JSON.stringify({ ...JSON.parse(s), banner: nb })); setLiveJson((s) => JSON.stringify({ ...JSON.parse(s), banner: nb })); }} flash={flash} expire={expire} />}
        {tab === "profile" && <ProfileTab d={draft} upd={upd} photoSrc={photoSrc} onPhoto={() => setCrop(true)} />}
        {tab === "music" && <MusicTab d={draft} upd={upd} flash={flash} />}
        {tab === "ai" && <AiTab d={draft} upd={upd} flash={flash} expire={expire} />}
        {tab === "menu" && (sub === null ? (
          <MenuTab setSub={setSub} unread={stats?.unread || 0} onLogout={logout} />
        ) : (
          <div>
            <button onClick={() => setSub(null)} className="mb-3 flex min-h-[44px] items-center gap-2 text-sm text-cyan"><ArrowLeft size={18} />Menu</button>
            {sub === "skills" && <SkillsHobbies d={draft} upd={upd} />}
            {sub === "projects" && <Projects d={draft} upd={upd} />}
            {sub === "messages" && <Messages onUnauthorized={expire} />}
            {sub === "look" && <Look d={draft} upd={upd} />}
            {sub === "password" && <Password onDone={onLogout} />}
            {sub === "reset" && <Reset onDone={load} />}
          </div>
        ))}
      </div>

      {showSave && (
        <div className="fixed inset-x-0 z-40 px-4" style={{ bottom: 88 }}>
          <div className={`${card} mx-auto flex max-w-md items-center gap-2 p-2.5`}>
            <p className="min-w-0 flex-1 px-2 text-[11px] leading-tight text-mute">{dirty ? "Perubahan belum disimpan" : unpublished ? "Draf tersimpan, belum dipublikasikan" : "Sudah dipublikasikan"}</p>
            <Btn variant="ghost" onClick={async () => { if (await save()) flash("Draf tersimpan."); }} disabled={busy || !dirty} className="!min-h-[44px] !px-3">Simpan draf</Btn>
            <Btn onClick={publish} disabled={busy || (!dirty && !unpublished)} className="!min-h-[44px] !px-3">Publikasikan</Btn>
          </div>
        </div>
      )}

      <nav aria-label="Navigasi admin" className="fixed inset-x-0 bottom-0 z-50 px-3.5 pb-3.5">
        <div className={`${card} mx-auto flex h-[66px] max-w-md items-center justify-around`}>
          {nav.map(({ id, label, I }) => (
            <button key={id} onClick={() => { setTab(id); setSub(null); }} aria-label={label} aria-current={tab === id ? "page" : undefined} className={`relative flex min-h-[48px] min-w-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium ${tab === id ? "bg-cyan/10 text-cyan" : "text-mute"}`}>
              <I size={21} />{label}
              {id === "menu" && (stats?.unread || 0) > 0 && <i className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-cyan" />}
            </button>
          ))}
        </div>
      </nav>

      {toast && <div role="status" className={`${card} fixed left-1/2 top-4 z-[90] max-w-[90vw] -translate-x-1/2 px-4 py-2.5 text-sm`}>{toast}</div>}
      {crop && <PhotoCropper onClose={() => setCrop(false)} onDone={async (img) => {
        setCrop(false); setBusy(true);
        const r = await api("/api/admin/photo", "POST", { image: img }); setBusy(false);
        if (r.status === 401) return expire();
        if (!r.ok) return flash(r.data.error || "Gagal mengunggah foto.");
        const nd = { ...draft, photoVersion: r.data.version as number };
        setDraft(nd); if (await save(nd)) flash("Foto tersimpan di draf. Tekan Publikasikan agar tampil di website.");
      }} />}
      {preview > 0 && (
        <Sheet title="Pratinjau penuh (draf)" onClose={() => setPreview(0)}>
          <div className="mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[28px] border-2 border-white/20 bg-space"><iframe key={preview} src={`/?preview=1&r=${preview}`} title="Pratinjau website" className="h-full w-full" /></div>
          <div className="mt-3 flex gap-2"><Btn variant="ghost" className="flex-1" onClick={() => setPreview(Date.now())}><RefreshCw size={16} />Muat ulang</Btn><a href="/?preview=1" target="_blank" rel="noopener noreferrer" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold"><ExternalLink size={16} />Buka penuh</a></div>
        </Sheet>
      )}
    </div>
  );
}

const H = ({ t, s }: { t: string; s?: string }) => (<div className="mb-4"><h1 className="font-display text-2xl font-bold">{t}</h1>{s && <p className="mt-1 text-[13px] text-mute">{s}</p>}</div>);

function HomeTab({ draft, stats, reload, unpublished, onPreview, onBanner, flash, expire }: { draft: Content; stats: any; reload: () => void; unpublished: boolean; onPreview: () => void; onBanner: (b: Content["banner"]) => void; flash: (t: string) => void; expire: () => void }) {
  const [b, setB] = useState(draft.banner);
  useEffect(() => setB(draft.banner), [draft.banner]);
  const max = Math.max(1, ...(stats?.series || []).map((x: any) => x.visitors));
  const applyBanner = async (next: Content["banner"]) => {
    const r = await api("/api/admin/banner", "POST", next);
    if (r.status === 401) return expire();
    if (!r.ok) { flash(r.data.error || "Gagal menyimpan banner."); setB(draft.banner); return; }
    onBanner(r.data.banner); flash(r.data.banner.enabled ? "Banner aktif di website." : "Banner dinonaktifkan.");
  };
  const Stat = ({ l, v, s }: { l: string; v: number | string; s: string }) => (<div className={`${card} p-3.5`}><p className="text-[11px] text-mute">{l}</p><p className="font-display mt-1 text-2xl font-bold tabular-nums">{v}</p><p className="text-[11px] text-cyan">{s}</p></div>);
  return (
    <div className="space-y-3.5">
      <div className="flex items-start justify-between"><H t="Halo, Fahri" s="Ringkasan website kamu" /><button onClick={reload} aria-label="Muat ulang statistik" className="h-11 w-11 grid place-items-center rounded-full border border-white/10 text-mute"><RefreshCw size={17} /></button></div>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat l="Hari ini" v={stats ? stats.today : "–"} s="pengunjung" /><Stat l="Minggu ini" v={stats ? stats.week : "–"} s="pengunjung" />
        <Stat l="Total" v={stats ? stats.total : "–"} s="kunjungan" /><Stat l="Chat AI" v={stats ? stats.aiTotal : "–"} s={stats ? `${stats.aiToday} hari ini` : "pesan"} />
      </div>
      <div className={`${card} p-4`}>
        <div className="flex justify-between text-[13px] font-semibold"><span>Grafik pengunjung</span><span className="font-normal text-mute">7 hari</span></div>
        <div className="mt-4 flex h-[120px] items-end gap-2" role="img" aria-label="Grafik pengunjung 7 hari">
          {(stats?.series || Array.from({ length: 7 }, () => ({ visitors: 0, date: "" }))).map((x: any, i: number) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={`${x.date}: ${x.visitors}`}>
              <span className="text-[10px] text-mute tabular-nums">{x.visitors}</span>
              <i className="w-full rounded-t-md bg-gradient-to-t from-electric to-cyan transition-all duration-700" style={{ height: `${Math.max(4, (x.visitors / max) * 80)}px` }} />
              <span className="text-[10px] text-mute">{x.date ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][new Date(x.date + "T12:00:00").getDay()] : ""}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${card} space-y-3 p-4`}>
        <div className="flex items-center gap-3"><div className="flex-1"><p className="text-sm font-semibold">Banner pengumuman</p><p className="text-xs text-mute">Tampil di beranda website</p></div>
          <Switch on={b.enabled} label="Aktifkan banner" onChange={(v) => { const nb = { ...b, enabled: v }; setB(nb); applyBanner(nb); }} /></div>
        <Field label="Teks banner" value={b.text} onChange={(v) => setB({ ...b, text: v })} maxLength={160} placeholder="Contoh: Website baru sudah rilis!" />
        <Field label="Link (opsional)" value={b.link} onChange={(v) => setB({ ...b, link: v })} placeholder="https://…" />
        <Btn variant="ghost" className="w-full" onClick={() => applyBanner(b)} disabled={b.text === draft.banner.text && b.link === draft.banner.link}>Simpan banner</Btn>
      </div>
      <div className={`${card} flex items-center gap-3 p-4 text-sm`}><Mail size={19} className="text-cyan" /><span className="flex-1 text-mute">Pesan masuk: {stats ? stats.unread : "–"} belum dibaca</span></div>
      {unpublished && <p className="rounded-2xl border border-cyan/30 bg-cyan/10 p-3 text-xs text-cyan">Ada perubahan yang belum dipublikasikan. Buka tab Profil, Musik, atau AI lalu tekan Publikasikan.</p>}
      <div className="grid grid-cols-2 gap-2.5 pb-2"><Btn variant="ghost" onClick={onPreview}><Eye size={17} />Pratinjau penuh</Btn><a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold"><ExternalLink size={16} />Lihat website</a></div>
    </div>
  );
}

function ProfileTab({ d, upd, photoSrc, onPhoto }: { d: Content; upd: Upd; photoSrc: string; onPhoto: () => void }) {
  const p = d.profile; const set = (k: keyof Content["profile"], v: string) => upd((c) => ({ ...c, profile: { ...c.profile, [k]: v } }));
  return (
    <div className="space-y-3.5">
      <H t="Edit Profil" s="Pratinjau berubah langsung saat kamu mengetik" />
      <div className="flex items-center gap-4">
        <div className="flex h-[206px] w-[112px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[22px] border-2 border-white/25 bg-gradient-to-b from-navy2 to-space" aria-label="Live preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoSrc} alt="" className="h-[58px] w-[58px] rounded-full border-2 border-cyan object-cover bg-navy2" />
          <b className="font-display px-1 text-center text-[9px] tracking-wider">{p.name.toUpperCase()}</b>
          <i className="px-2 text-center text-[8px] not-italic text-cyan">{p.tagline}</i>
        </div>
        <div className="flex flex-1 flex-col gap-2.5"><span className="text-xs font-semibold text-cyan">Live preview</span><Btn variant="ghost" onClick={onPhoto}>Ganti foto</Btn><p className="text-[11px] leading-snug text-mute">Pilih foto, atur posisi dan zoom, lalu simpan.</p></div>
      </div>
      <Field label="Nama" value={p.name} onChange={(v) => set("name", v)} maxLength={60} />
      <Field label="Tagline" value={p.tagline} onChange={(v) => set("tagline", v)} maxLength={120} />
      <Field label="Bio" value={p.bio} onChange={(v) => set("bio", v)} multi rows={3} maxLength={400} />
      <Field label="Instagram (link)" value={p.instagram} onChange={(v) => set("instagram", v)} placeholder="https://instagram.com/…" />
      <Field label="GitHub (link)" value={p.github} onChange={(v) => set("github", v)} placeholder="https://github.com/…" />
      <Field label="TikTok (link)" value={p.tiktok} onChange={(v) => set("tiktok", v)} placeholder="https://tiktok.com/@…" />
      <Field label="Nomor WhatsApp" value={p.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} placeholder="+62…" />
      <Field label="Email" value={p.email} onChange={(v) => set("email", v)} type="email" />
    </div>
  );
}

function MusicTab({ d, upd, flash }: { d: Content; upd: Upd; flash: (t: string) => void }) {
  const [link, setLink] = useState(""); const [busy, setBusy] = useState(false);
  const add = async () => {
    setBusy(true); const r = await api(`/api/admin/yt?url=${encodeURIComponent(link)}`); setBusy(false);
    if (!r.ok) return flash(r.data.error || "Link tidak valid.");
    if (d.playlist.some((t) => t.id === r.data.id)) return flash("Lagu ini sudah ada di playlist.");
    upd((c) => ({ ...c, playlist: [...c.playlist, { id: r.data.id, title: r.data.title || "" }] })); setLink("");
    flash(r.data.title ? "Lagu ditambahkan." : "Lagu ditambahkan. Judul tidak terbaca, isi manual jika perlu.");
  };
  const mv = (i: number, dir: number) => upd((c) => { const a = [...c.playlist]; const j = i + dir; if (j < 0 || j >= a.length) return c; [a[i], a[j]] = [a[j], a[i]]; return { ...c, playlist: a }; });
  return (
    <div className="space-y-3.5">
      <H t="Kelola Musik" s="Tempel link YouTube, judul terisi otomatis" />
      <div className="flex gap-2"><div className="flex-1"><Field label="Link YouTube" value={link} onChange={setLink} placeholder="https://youtu.be/…" /></div><button onClick={add} disabled={busy || !link} aria-label="Tambah lagu" className="mt-[22px] grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric to-cyan text-space disabled:opacity-40"><Plus size={22} /></button></div>
      <p className="text-xs font-semibold text-mute">Playlist (lagu pertama diputar lebih dulu)</p>
      {d.playlist.map((t, i) => (
        <div key={t.id} className={`${card} space-y-2.5 p-3.5`}>
          <div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan/15 font-mono text-xs text-cyan">{i + 1}</span><p className="min-w-0 flex-1 truncate text-[11px] text-mute">youtu.be/{t.id}</p></div>
          <Field label="Judul" value={t.title} onChange={(v) => upd((c) => ({ ...c, playlist: c.playlist.map((x, k) => (k === i ? { ...x, title: v } : x)) }))} maxLength={120} />
          <div className="flex gap-2">
            <button onClick={() => mv(i, -1)} disabled={i === 0} aria-label="Naikkan" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 disabled:opacity-30"><ArrowUp size={17} /></button>
            <button onClick={() => mv(i, 1)} disabled={i === d.playlist.length - 1} aria-label="Turunkan" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 disabled:opacity-30"><ArrowDown size={17} /></button>
            <button onClick={() => (d.playlist.length > 1 ? upd((c) => ({ ...c, playlist: c.playlist.filter((_, k) => k !== i) })) : flash("Minimal harus ada 1 lagu."))} aria-label="Hapus lagu" className="ml-auto flex h-11 items-center gap-2 rounded-xl border border-red-400/40 px-4 text-sm text-red-300"><Trash2 size={16} />Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AiTab({ d, upd, flash, expire }: { d: Content; upd: Upd; flash: (t: string) => void; expire: () => void }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const [un, setUn] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null); const [ans, setAns] = useState("");
  const loadUn = useCallback(async () => { const r = await api("/api/admin/unanswered"); if (r.status === 401) return expire(); setUn(r.data.items || []); }, [expire]);
  useEffect(() => { loadUn(); }, [loadUn]);
  const test = async () => {
    const content = q.trim(); if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }]; setMsgs(next); setQ(""); setBusy(true);
    const r = await api("/api/admin/ai-test", "POST", { messages: next.slice(-8), content: d });
    setBusy(false);
    if (r.status === 401) return expire();
    setMsgs([...next, { role: "model", content: r.ok ? r.data.reply : `⚠ ${r.data.error || "Gagal."}` }]);
  };
  const saveAnswer = async (item: any) => {
    if (!ans.trim()) return;
    upd((c) => ({ ...c, faq: [...c.faq, { q: item.q, a: ans.trim() }] }));
    await api("/api/admin/unanswered", "POST", { q: item.q }); setOpen(null); setAns(""); loadUn();
    flash("Ditambahkan ke tanya-jawab. Simpan draf, lalu tes lagi.");
  };
  const dismiss = async (item: any) => { await api("/api/admin/unanswered", "POST", { q: item.q }); loadUn(); };
  return (
    <div className="space-y-3.5">
      <H t="Tes dan Latih AI" s="Tes memakai draf (belum dipublikasikan)" />
      <div className={`${card} space-y-2 p-3`}>
        <div className="max-h-[260px] space-y-2 overflow-y-auto">
          {msgs.length === 0 && <p className="p-2 text-xs text-mute">Tulis pertanyaan seperti pengunjung, misalnya “Apa hobi Fahri?”.</p>}
          {msgs.map((m, i) => <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${m.role === "user" ? "ml-auto bg-electric" : "border border-white/10 bg-space/60"}`}>{m.content}</div>)}
          {busy && <div className="typing px-2"><span /><span /><span /></div>}
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && test()} placeholder="Tes pertanyaan…" aria-label="Tes pertanyaan" className="h-12 min-w-0 flex-1 rounded-full border border-white/10 bg-space/60 px-4 text-base outline-none focus:border-cyan/60" />
          <button onClick={test} disabled={busy || !q.trim()} aria-label="Kirim tes" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric to-cyan text-space disabled:opacity-40"><Send size={18} /></button>
        </div>
        {msgs.length > 0 && <button onClick={() => setMsgs([])} className="text-xs text-mute underline">Bersihkan percakapan tes</button>}
      </div>
      <p className="text-xs font-semibold text-mute">Pertanyaan pengunjung yang belum terjawab</p>
      {un.length === 0 && <div className={`${card} p-4 text-center text-xs text-mute`}>Belum ada. Pertanyaan yang tidak bisa dijawab AI akan muncul di sini.</div>}
      {un.map((it) => (
        <div key={it.q + it.at} className={`${card} space-y-2.5 p-3.5`}>
          <p className="text-sm leading-snug">{it.q}</p>
          {open === it.q ? (<>
            <Field label="Jawaban resmi dari Fahri" value={ans} onChange={setAns} multi rows={3} maxLength={600} />
            <div className="flex gap-2"><Btn className="flex-1" onClick={() => saveAnswer(it)} disabled={!ans.trim()}>Tambahkan</Btn><Btn variant="ghost" onClick={() => setOpen(null)}>Batal</Btn></div>
          </>) : (
            <div className="flex gap-2"><Btn variant="ghost" className="flex-1" onClick={() => { setOpen(it.q); setAns(""); }}>Jawab</Btn><Btn variant="ghost" onClick={() => dismiss(it)}>Abaikan</Btn></div>
          )}
        </div>
      ))}
      <Field label="Catatan pengetahuan untuk AI" value={d.knowledgeNotes} onChange={(v) => upd((c) => ({ ...c, knowledgeNotes: v }))} multi rows={5} maxLength={3000} hint="Tambahan info tentang Fahri yang boleh diketahui AI. Jangan isi data rahasia." />
      <p className="text-xs font-semibold text-mute">Tanya-jawab resmi ({d.faq.length})</p>
      {d.faq.map((f, i) => (
        <div key={i} className={`${card} space-y-2.5 p-3.5`}>
          <Field label="Pertanyaan" value={f.q} onChange={(v) => upd((c) => ({ ...c, faq: c.faq.map((x, k) => (k === i ? { ...x, q: v } : x)) }))} maxLength={200} />
          <Field label="Jawaban" value={f.a} onChange={(v) => upd((c) => ({ ...c, faq: c.faq.map((x, k) => (k === i ? { ...x, a: v } : x)) }))} multi rows={3} maxLength={600} />
          <Btn variant="danger" className="w-full" onClick={() => upd((c) => ({ ...c, faq: c.faq.filter((_, k) => k !== i) }))}><Trash2 size={16} />Hapus</Btn>
        </div>
      ))}
      <Btn variant="ghost" className="w-full" onClick={() => upd((c) => ({ ...c, faq: [...c.faq, { q: "Pertanyaan baru", a: "Jawaban" }] }))}><Plus size={18} />Tambah tanya-jawab</Btn>
    </div>
  );
}

function MenuTab({ setSub, unread, onLogout }: { setSub: (s: Sub) => void; unread: number; onLogout: () => void }) {
  const Row = ({ I, t, s, to, badge }: { I: typeof Zap; t: string; s: string; to: Sub; badge?: number }) => (
    <button onClick={() => setSub(to)} className={`${card} flex min-h-[58px] w-full items-center gap-3 px-3.5 text-left`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric/25 text-cyan"><I size={19} /></span>
      <span className="flex-1"><span className="block text-sm font-semibold">{t}</span><span className="block text-[11px] text-mute">{s}</span></span>
      {!!badge && <span className="rounded-full bg-cyan px-2 py-0.5 text-[11px] font-bold text-space">{badge}</span>}
    </button>
  );
  return (
    <div className="space-y-2">
      <H t="Menu" s="Semua pengaturan website" />
      <Row I={Zap} t="Keahlian dan hobi" s="Tambah, ubah, hapus, urutkan" to="skills" />
      <Row I={Folder} t="Proyek" s="Nama, gambar, demo, source code" to="projects" />
      <Row I={Mail} t="Pesan masuk" s="Dari form kontak" to="messages" badge={unread} />
      <Row I={Palette} t="Tampilan" s="Warna tema dan kualitas grafis" to="look" />
      <Row I={KeyRound} t="Ganti password" s="Perbarui kata sandi admin" to="password" />
      <Row I={RotateCcw} t="Reset ke data awal" s="Kembalikan semua isi website" to="reset" />
      <button onClick={onLogout} className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-red-400/50 text-sm font-semibold text-red-300"><LogOut size={18} />Keluar</button>
    </div>
  );
}

export { DEFAULTS };
