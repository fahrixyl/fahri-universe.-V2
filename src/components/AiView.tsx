"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Copy, Check } from "lucide-react";

type Msg = { role: "user" | "model"; content: string };
const WELCOME = "Halo! Saya **FAHRI AI**.\n\nSaya asisten virtual Muhammad Fahri. Saya siap membantu kamu mengenal Fahri lebih dekat.\n\nSilakan tanyakan apa saja mengenai identitas, hobi, keahlian, proyek, dan media sosial Fahri.";
const QUICK = ["Siapa Muhammad Fahri?", "Apa hobi Fahri?", "Apa keahlian Fahri?", "Apa saja proyek Fahri?", "Bagaimana menghubungi Fahri?"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function md(src: string) {
  const inline = (t: string) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  const out: string[] = []; let list = false;
  for (const line of src.split("\n")) {
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) { if (!list) { out.push("<ul>"); list = true; } out.push(`<li>${inline(li[1])}</li>`); continue; }
    if (list) { out.push("</ul>"); list = false; }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("");
}

function Bubble({ role, children }: { role: "user" | "model"; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : ""}`}>
      <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${role === "user" ? "bg-electric text-white rounded-br-md" : "bg-navy2/90 border border-white/5 rounded-bl-md"}`}>{children}</div>
    </div>
  );
}

export default function AiView() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const s = sessionStorage.getItem("fahri-ai"); if (s) setMsgs(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem("fahri-ai", JSON.stringify(msgs.slice(-20))); } catch {} end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy, err]);

  const send = async (raw: string) => {
    const content = raw.trim().slice(0, 500);
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-10) }) });
      let d: { reply?: string; error?: string } = {};
      try { d = await r.json(); } catch {}
      if (!r.ok || !d.reply) throw new Error(d.error || "FAHRI AI sedang tidak tersedia. Coba lagi nanti.");
      setMsgs([...next, { role: "model", content: d.reply }]);
    } catch (e) {
      setErr(e instanceof TypeError ? "Koneksi bermasalah. Periksa internet lalu coba lagi." : e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally { setBusy(false); }
  };
  const copy = async (c: string, i: number) => { try { await navigator.clipboard.writeText(c); setCopied(i); setTimeout(() => setCopied(null), 1500); } catch {} };

  return (
    <div className="h-full flex flex-col px-5">
      <header className="flex items-center gap-3 pb-3">
        <span className="h-11 w-11 rounded-full orb" />
        <div className="flex-1 min-w-0"><p className="font-display font-bold leading-tight">FAHRI AI</p><p className="text-[11px] text-mute flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Online · Asisten Virtual Muhammad Fahri</p></div>
        <button onClick={() => { setMsgs([]); setErr(""); }} aria-label="Hapus percakapan" className="h-10 w-10 grid place-items-center rounded-full text-mute active:text-cyan"><Trash2 size={17} /></button>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pb-2" aria-live="polite">
        <Bubble role="model"><div className="md" dangerouslySetInnerHTML={{ __html: md(WELCOME) }} /></Bubble>
        {msgs.length === 0 && <div className="flex flex-wrap gap-2 pt-1">{QUICK.map((q) => <button key={q} onClick={() => send(q)} className="text-xs border border-cyan/40 text-cyan rounded-full px-3 py-2 active:bg-cyan/10">{q}</button>)}</div>}
        {msgs.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.role === "model" ? (<><div className="md" dangerouslySetInnerHTML={{ __html: md(m.content) }} /><button onClick={() => copy(m.content, i)} aria-label="Salin jawaban" className="mt-1 text-mute active:text-cyan">{copied === i ? <Check size={14} /> : <Copy size={14} />}</button></>) : m.content}
          </Bubble>
        ))}
        {busy && <Bubble role="model"><span className="typing"><span /><span /><span /></span></Bubble>}
        {err && <p role="alert" className="text-xs text-red-200 bg-red-500/10 border border-red-400/20 rounded-2xl px-3.5 py-2.5">{err}</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2 pt-2">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Tulis pertanyaanmu…" aria-label="Pesan" className="flex-1 min-w-0 glass rounded-full px-4 h-12 text-base outline-none focus:border-cyan/60" />
        <button disabled={busy || !text.trim()} aria-label="Kirim" className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-electric to-cyan text-space grid place-items-center disabled:opacity-40"><Send size={19} /></button>
      </form>
    </div>
  );
}
