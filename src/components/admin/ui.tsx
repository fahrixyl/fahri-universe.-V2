"use client";
import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

export async function api<T = any>(path: string, method = "GET", body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const r = await fetch(path, { method, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", "x-fahri": "1" }, body: body !== undefined ? JSON.stringify(body) : undefined });
    let data: any = {}; try { data = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, data };
  } catch { return { ok: false, status: 0, data: { error: "Koneksi bermasalah." } as any }; }
}

export const card = "rounded-3xl border border-white/10 bg-navy2/80 backdrop-blur-md shadow-[0_12px_40px_-20px_rgba(0,0,0,.9)]";

export function Field({ label, value, onChange, multi, rows = 3, placeholder, type = "text", maxLength, hint }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean; rows?: number; placeholder?: string; type?: string; maxLength?: number; hint?: string }) {
  const id = useId();
  const cls = "mt-1.5 w-full rounded-2xl border border-white/10 bg-space/60 px-3.5 text-base text-ink outline-none focus:border-cyan/60 placeholder:text-mute/60";
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-mute">{label}</label>
      {multi ? <textarea id={id} rows={rows} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${cls} py-3 resize-none`} />
        : <input id={id} type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${cls} h-12`} autoComplete="off" />}
      {hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; className?: string; type?: "button" | "submit" }) {
  const v = variant === "primary" ? "bg-gradient-to-br from-electric to-cyan text-space font-bold" : variant === "danger" ? "border border-red-400/50 text-red-300" : "border border-white/15 text-ink";
  return <button type={type} onClick={onClick} disabled={disabled} className={`min-h-[48px] rounded-2xl px-4 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[.98] transition ${v} ${className}`}>{children}</button>;
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors ${on ? "bg-cyan" : "bg-white/20"}`}>
      <i className={`absolute top-[3px] h-6 w-6 rounded-full bg-space transition-all ${on ? "left-[25px]" : "left-[3px]"}`} />
    </button>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] bg-space/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-navy p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between mb-3"><h3 className="font-display text-lg font-bold">{title}</h3><button onClick={onClose} aria-label="Tutup" className="h-10 w-10 grid place-items-center text-mute"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

const SIZE = 800;
export function PhotoCropper({ onDone, onClose }: { onDone: (dataUrl: string) => void; onClose: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [ok, setOk] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [msg, setMsg] = useState("");

  const clamp = (o: { x: number; y: number }, z: number) => {
    const im = img.current; if (!im) return o;
    const s = Math.max(SIZE / im.width, SIZE / im.height) * z;
    const mx = Math.max(0, (im.width * s - SIZE) / 2), my = Math.max(0, (im.height * s - SIZE) / 2);
    return { x: Math.max(-mx, Math.min(mx, o.x)), y: Math.max(-my, Math.min(my, o.y)) };
  };
  useEffect(() => {
    const c = cv.current, im = img.current; if (!c || !im) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const s = Math.max(SIZE / im.width, SIZE / im.height) * zoom;
    ctx.fillStyle = "#05070D"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(im, SIZE / 2 - (im.width * s) / 2 + off.x, SIZE / 2 - (im.height * s) / 2 + off.y, im.width * s, im.height * s);
  }, [zoom, off, ok]);

  const pick = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f); const im = new Image();
    im.onload = () => { img.current = im; setZoom(1); setOff({ x: 0, y: 0 }); setOk(true); setMsg(""); URL.revokeObjectURL(url); };
    im.onerror = () => setMsg("File tidak bisa dibuka. Pilih JPG atau PNG.");
    im.src = url;
  };
  const use = async () => {
    const c = cv.current; if (!c) return;
    const blobAt = (q: number) => new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", q));
    let q = 0.9, b = await blobAt(q);
    while (b && b.size > 300 * 1024 && q > 0.45) { q -= 0.07; b = await blobAt(q); }
    if (!b || b.size > 320 * 1024) return setMsg("Foto terlalu besar. Coba zoom lebih kecil atau foto lain.");
    const fr = new FileReader(); fr.onload = () => onDone(String(fr.result)); fr.readAsDataURL(b);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !cv.current) return;
    const k = SIZE / cv.current.getBoundingClientRect().width;
    const dx = (e.clientX - drag.current.x) * k, dy = (e.clientY - drag.current.y) * k;
    drag.current = { x: e.clientX, y: e.clientY };
    setOff((o) => clamp({ x: o.x + dx, y: o.y + dy }, zoom));
  };
  return (
    <Sheet title="Ganti foto profil" onClose={onClose}>
      <label className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-cyan font-bold text-space text-sm">Pilih foto dari galeri
        <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      <div className="relative mt-3 mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-space touch-none">
        <canvas ref={cv} width={SIZE} height={SIZE} className="h-full w-full" onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)} />
        <div className="pointer-events-none absolute inset-[17%] rounded-full border-2 border-dashed border-cyan/80" />
        {!ok && <div className="absolute inset-0 grid place-items-center text-sm text-mute">Belum ada foto</div>}
      </div>
      {ok && (<>
        <p className="mt-1.5 text-center text-[11px] text-mute">Geser foto untuk mengatur posisi. Lingkaran putus-putus = bagian yang tampil.</p>
        <label className="mt-3 block text-xs text-mute">Zoom ({zoom.toFixed(1)}x)
          <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => { const z = Number(e.target.value); setZoom(z); setOff((o) => clamp(o, z)); }} className="mt-1 w-full" />
        </label>
        <button onClick={use} className="mt-3 min-h-[48px] w-full rounded-2xl bg-gradient-to-br from-electric to-cyan font-bold text-space text-sm">Gunakan foto ini</button>
      </>)}
      {msg && <p role="alert" className="mt-2 text-sm text-red-300">{msg}</p>}
    </Sheet>
  );
}
