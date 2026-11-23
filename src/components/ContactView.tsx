"use client";
import { useState } from "react";
import { MessageCircle, Mail, Copy, Send } from "lucide-react";
import { useContent } from "./ContentProvider";
import { waUrl } from "@/lib/content";

export default function ContactView() {
  const c = useContent();
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({ name: "", contact: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 4500); };
  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); flash(`${label} berhasil disalin. Siap ditempel.`); }
    catch { flash(`Gagal menyalin. Salin manual: ${text}`); }
  };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Gagal mengirim pesan.");
      setF({ name: "", contact: "", message: "", website: "" }); flash("Pesan terkirim. Terima kasih, Fahri akan segera membacanya.");
    } catch (err) { flash(err instanceof TypeError ? "Koneksi bermasalah. Coba lagi." : (err as Error).message); }
    finally { setSending(false); }
  };
  const Row = ({ icon, title, sub, href, onCopy }: { icon: React.ReactNode; title: string; sub: string; href: string; onCopy: () => void }) => (
    <div className="glass glow-border rounded-3xl p-2.5 flex items-center gap-3">
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex-1 min-w-0 flex items-center gap-3">
        <span className="h-11 w-11 shrink-0 rounded-2xl bg-electric/25 text-cyan grid place-items-center">{icon}</span>
        <span className="min-w-0"><span className="block font-display font-semibold text-sm">{title}</span><span className="block text-xs text-mute truncate">{sub}</span></span>
      </a>
      <button onClick={onCopy} aria-label={`Salin ${title}`} className="h-11 w-11 shrink-0 rounded-full border border-white/10 grid place-items-center text-mute active:text-cyan"><Copy size={16} /></button>
    </div>
  );
  const input = "w-full glass rounded-2xl px-4 h-12 text-base outline-none focus:border-cyan/60 placeholder:text-mute/70";
  return (
    <div className="h-full px-5 flex flex-col overflow-y-auto no-scrollbar">
      <h2 className="font-display text-[26px] font-bold">Hubungi Saya</h2>
      <p className="text-[13px] text-mute mb-3">Punya ide atau ingin berkolaborasi? Sapa Fahri langsung.</p>
      <div className="flex flex-col gap-2.5">
        <Row icon={<MessageCircle size={21} />} title="WhatsApp" sub={c.profile.whatsappNumber} href={waUrl(c)} onCopy={() => copy(c.profile.whatsappNumber, "Nomor WhatsApp")} />
        <Row icon={<Mail size={21} />} title="Email" sub={c.profile.email} href={`mailto:${c.profile.email}`} onCopy={() => copy(c.profile.email, "Email")} />
      </div>
      <form onSubmit={send} className="mt-4 flex flex-col gap-2.5">
        <p className="text-xs font-semibold text-mute">Atau kirim pesan di sini</p>
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} placeholder="Namamu" aria-label="Nama" className={input} required />
        <input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} maxLength={100} placeholder="WhatsApp atau email (opsional)" aria-label="Kontak" className={input} />
        <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1000} rows={3} placeholder="Tulis pesanmu…" aria-label="Pesan" className="w-full glass rounded-2xl px-4 py-3 text-base outline-none focus:border-cyan/60 resize-none placeholder:text-mute/70" required />
        <input value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button disabled={sending} className="btn btn-primary !h-12 !rounded-2xl disabled:opacity-50"><Send size={17} />{sending ? "Mengirim…" : "Kirim pesan"}</button>
      </form>
      <p role="status" className="mt-3 text-sm text-cyan min-h-[1.25rem] pb-2">{msg}</p>
    </div>
  );
}
