"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, big = false;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement | null)?.closest?.("a,button,input,[data-magnetic]") as HTMLElement | null;
      big = Boolean(t);
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((m) => (m.style.transform = ""));
      if (t?.hasAttribute("data-magnetic")) {
        const r = t.getBoundingClientRect();
        t.style.transform = `translate(${(x - (r.left + r.width / 2)) * 0.2}px, ${(y - (r.top + r.height / 2)) * 0.25}px)`;
      }
    };
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      if (dot.current) dot.current.style.transform = `translate(${cx - 16}px, ${cy - 16}px) scale(${big ? 1.7 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move); raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); document.documentElement.classList.remove("has-cursor"); };
  }, []);
  return <div ref={dot} aria-hidden className="hidden [@media(pointer:fine)]:block fixed top-0 left-0 z-[200] h-8 w-8 rounded-full border border-cyan pointer-events-none transition-[scale] shadow-[0_0_18px_rgb(var(--cyan))]" />;
}
