"use client";
import { useEffect, useRef, useState } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";

const TZ = "Asia/Makassar";
const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
const dateFmt = new Intl.DateTimeFormat("id-ID", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });

function hms(d: Date) {
  const o: Record<string, number> = {};
  fmt.formatToParts(d).forEach((p) => { if (p.type !== "literal") o[p.type] = parseInt(p.value, 10); });
  return { h: (o.hour || 0) % 24, m: o.minute || 0, s: o.second || 0 };
}
function moon(d: Date) {
  const syn = 29.530588853;
  const jd = d.getTime() / 86400000 + 2440587.5;
  const age = (((jd - 2451550.1) % syn) + syn) % syn;
  const names = ["Bulan baru", "Sabit awal", "Perbani awal", "Cembung awal", "Purnama", "Cembung akhir", "Perbani akhir", "Sabit akhir"];
  return { name: names[Math.floor((age / syn) * 8 + 0.5) % 8], lit: Math.round(((1 - Math.cos((2 * Math.PI * age) / syn)) / 2) * 100) };
}
function phase(h: number) {
  if (h >= 4 && h <= 10) return { greet: "Selamat pagi", I: Sunrise };
  if (h >= 11 && h <= 14) return { greet: "Selamat siang", I: Sun };
  if (h >= 15 && h <= 17) return { greet: "Selamat sore", I: Sunset };
  return { greet: "Selamat malam", I: Moon };
}

export default function SmartClock() {
  const [now, setNow] = useState<Date | null>(null);
  const hr = useRef<SVGLineElement>(null), mn = useRef<SVGLineElement>(null), sc = useRef<SVGLineElement>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    let raf = 0, last = 0;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < 33) return;
      last = ts;
      const d = new Date(); const { h, m, s } = hms(d);
      const sec = s + d.getMilliseconds() / 1000, min = m + sec / 60, hour = (h % 12) + min / 60;
      hr.current?.setAttribute("transform", `rotate(${hour * 30} 60 60)`);
      mn.current?.setAttribute("transform", `rotate(${min * 6} 60 60)`);
      sc.current?.setAttribute("transform", `rotate(${sec * 6} 60 60)`);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearInterval(t); cancelAnimationFrame(raf); };
  }, []);

  const t = now ? hms(now) : { h: 0, m: 0, s: 0 };
  const p = phase(t.h);
  const prog = (t.h * 3600 + t.m * 60 + t.s) / 86400;
  const mo = now ? moon(now) : { name: "", lit: 0 };
  const two = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="glass glow-border rounded-3xl p-3 flex items-center gap-3.5">
      <svg viewBox="0 0 120 120" className="h-[100px] w-[100px] shrink-0" role="img" aria-label="Jam analog">
        <defs><filter id="clk-glow"><feGaussianBlur stdDeviation="1.6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <circle cx="60" cy="60" r="53" fill="rgba(5,7,13,.55)" stroke="rgba(148,163,184,.25)" />
        <circle className="text-cyan" cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray={`${prog * 358} 358`} transform="rotate(-90 60 60)" filter="url(#clk-glow)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="60" y1="9" x2="60" y2={i % 3 === 0 ? 16 : 13} stroke={i % 3 === 0 ? "#F8FAFC" : "#64748B"} strokeWidth={i % 3 === 0 ? 2 : 1} transform={`rotate(${i * 30} 60 60)`} />
        ))}
        <line ref={hr} x1="60" y1="60" x2="60" y2="35" stroke="#F8FAFC" strokeWidth="3.4" strokeLinecap="round" />
        <line ref={mn} x1="60" y1="60" x2="60" y2="22" stroke="#CBD5E1" strokeWidth="2.4" strokeLinecap="round" />
        <line className="text-cyan" ref={sc} x1="60" y1="68" x2="60" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" filter="url(#clk-glow)" />
        <circle className="text-cyan" cx="60" cy="60" r="3.5" fill="currentColor" />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-cyan"><p.I size={13} />{p.greet}</div>
        <div className="font-mono text-[28px] leading-none mt-1 tabular-nums tracking-tight">
          {now ? two(t.h) : "--"}<span className="animate-pulse text-cyan">:</span>{now ? two(t.m) : "--"}
          <span className="text-sm text-cyan ml-1">{now ? two(t.s) : "--"}</span>
          <span className="text-[10px] text-mute ml-1.5">WITA</span>
        </div>
        <div className="text-[11px] text-mute mt-1 truncate">{now ? dateFmt.format(now) : ""}</div>
        <div className="mt-1.5 h-1 rounded bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-electric to-cyan" style={{ width: `${prog * 100}%` }} /></div>
        <div className="flex justify-between text-[10px] text-mute mt-1"><span>Hari berjalan {Math.round(prog * 100)}%</span><span>{mo.name} · {mo.lit}%</span></div>
      </div>
    </div>
  );
}
