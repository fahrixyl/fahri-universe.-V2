"use client";
import { useEffect, useRef } from "react";

// Partikel konstelasi: titik melayang yang terhubung garis dan mengikuti sentuhan.
export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let on = true, W = 0, H = 0, raf = 0, last = 0, frames = 0, col = "34 211 238";
    const N = window.innerWidth < 768 ? 30 : 56;
    const pts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00018, vy: (Math.random() - 0.5) * 0.00018, r: Math.random() * 1.4 + 0.6 }));
    const ptr = { x: -999, y: -999 };
    const size = () => { const d = Math.min(window.devicePixelRatio || 1, 1.5); W = cv.width = Math.floor(window.innerWidth * d); H = cv.height = Math.floor(window.innerHeight * d); };
    size();
    const pm = (e: PointerEvent) => { const d = W / window.innerWidth; ptr.x = e.clientX * d; ptr.y = e.clientY * d; };
    const pl = () => { ptr.x = -999; ptr.y = -999; };
    const q = (e: Event) => { on = (e as CustomEvent<string>).detail !== "hemat"; if (!on) ctx.clearRect(0, 0, W, H); };
    try { if (localStorage.getItem("fahri-q") === "hemat") on = false; } catch {}
    window.addEventListener("resize", size); window.addEventListener("pointermove", pm); window.addEventListener("pointerup", pl); window.addEventListener("fahri:quality", q);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!on || document.hidden || now - last < 33) return;
      const dt = now - last; last = now;
      if (++frames % 90 === 0) col = getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim() || col;
      ctx.clearRect(0, 0, W, H);
      const link = Math.min(W, H) * 0.16;
      for (const p of pts) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1;
        const dx = p.x * W - ptr.x, dy = p.y * H - ptr.y, d = Math.hypot(dx, dy);
        if (d < link * 1.3 && d > 0) { p.x += (dx / d) * 0.0012; p.y += (dy / d) * 0.0012; }
      }
      for (let i = 0; i < N; i++) {
        const a = pts[i], ax = a.x * W, ay = a.y * H;
        ctx.fillStyle = `rgb(${col} / .75)`; ctx.beginPath(); ctx.arc(ax, ay, a.r * (W / 400 + 0.6), 0, 6.283); ctx.fill();
        for (let j = i + 1; j < N; j++) {
          const b = pts[j], d = Math.hypot(ax - b.x * W, ay - b.y * H);
          if (d < link) { ctx.strokeStyle = `rgb(${col} / ${(1 - d / link) * 0.28})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(b.x * W, b.y * H); ctx.stroke(); }
        }
        const pd = Math.hypot(ax - ptr.x, ay - ptr.y);
        if (pd < link * 1.4) { ctx.strokeStyle = `rgb(${col} / ${(1 - pd / (link * 1.4)) * 0.5})`; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ptr.x, ptr.y); ctx.stroke(); }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pl); window.removeEventListener("fahri:quality", q); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full pointer-events-none" />;
}
