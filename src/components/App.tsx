"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LayoutGrid, Sparkles, Music2, Mail, X } from "lucide-react";
import { useContent } from "./ContentProvider";
import Particles from "./Particles";
import Cosmos from "./Cosmos";
import HomeView from "./HomeView";
import ExploreView, { type SheetId } from "./ExploreView";
import ContactView from "./ContactView";
import MusicView from "./MusicView";
import AiView from "./AiView";

type View = "home" | "explore" | "ai" | "music" | "contact";
const SHEETS = ["about", "skills", "hobbies", "projects"];
const DOCK: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Beranda", icon: Home }, { id: "explore", label: "Jelajah", icon: LayoutGrid },
  { id: "ai", label: "FAHRI AI", icon: Sparkles }, { id: "music", label: "Musik", icon: Music2 }, { id: "contact", label: "Kontak", icon: Mail },
];

export default function App() {
  const c = useContent();
  const [bannerOff, setBannerOff] = useState(false);
  const bannerOn = c.banner.enabled && !!c.banner.text && !bannerOff;
  const [view, setView] = useState<View>("home");
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const go = useCallback((to: string) => {
    if (SHEETS.includes(to)) { setView("explore"); setSheet(to as SheetId); }
    else if (to === "social") { setView("explore"); setSheet(null); }
    else { setView(to as View); setSheet(null); }
  }, []);

  useEffect(() => {
    const g = (e: Event) => go((e as CustomEvent<string>).detail);
    const m = (e: Event) => setPlaying(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("fahri:go", g); window.addEventListener("fahri:music", m);
    return () => { window.removeEventListener("fahri:go", g); window.removeEventListener("fahri:music", m); };
  }, [go]);

  const [q, setQ] = useState<"hemat" | "normal" | "hd">("normal");
  useEffect(() => { try { const s = localStorage.getItem("fahri-q"); if (s === "hemat" || s === "normal" || s === "hd") setQ(s); } catch {} }, []);
  useEffect(() => { window.dispatchEvent(new CustomEvent("fahri:view", { detail: view })); }, [view]);
  const cycleQ = () => {
    const n = q === "normal" ? "hd" : q === "hd" ? "hemat" : "normal";
    setQ(n); try { localStorage.setItem("fahri-q", n); } catch {}
    window.dispatchEvent(new CustomEvent("fahri:quality", { detail: n }));
  };
  useEffect(() => {
    try { if (localStorage.getItem("fahri-q")) return; } catch {}
    setQ(c.theme.quality); window.dispatchEvent(new CustomEvent("fahri:quality", { detail: c.theme.quality }));
  }, [c.theme.quality]);
  const nav = (v: View) => { try { navigator.vibrate?.(8); } catch {} go(v); };
  const content = view === "home" ? <HomeView go={go} />
    : view === "explore" ? <ExploreView sheet={sheet} setSheet={setSheet} go={go} />
    : view === "ai" ? <AiView /> : view === "contact" ? <ContactView /> : null;

  return (
    <div className="fixed inset-0" onPointerDown={(e) => {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700);
    }}>
      <Cosmos />
      <Particles />
      {ripples.map((r) => <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />)}
      <div className="relative mx-auto h-full w-full max-w-[460px] overflow-hidden md:border-x md:border-white/10 md:shadow-[0_0_80px_-20px_#2563EB88]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <header className="absolute top-[env(safe-area-inset-top)] inset-x-0 h-14 px-5 flex items-center justify-between z-30">
          <span className="font-display font-bold text-[15px] tracking-[0.32em]">FAHRI</span>
          <div className="flex items-center gap-2">
          <button onClick={cycleQ} aria-label="Ganti kualitas grafis" className="glass rounded-full h-9 px-3 text-[11px] font-mono text-cyan">{q === "hd" ? "HD" : q === "hemat" ? "Hemat" : "Normal"}</button>
          <button onClick={() => nav("music")} aria-label="Buka musik" className="glass rounded-full h-9 px-3 flex items-center gap-2 text-xs text-mute">
            <span className={`eq ${playing ? "" : "paused"}`}><i /><i /><i /><i /></span>{playing ? "Memutar" : "Musik"}
          </button>
          </div>
        </header>
        {bannerOn && (
          <div className="absolute left-3.5 right-3.5 z-30 glass glow-border rounded-2xl pl-3.5 pr-1 py-1 flex items-center gap-2 text-xs" style={{ top: "calc(3.4rem + env(safe-area-inset-top))" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse shrink-0" />
            {c.banner.link ? <a href={c.banner.link} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate hover:underline">{c.banner.text}</a> : <span className="flex-1 min-w-0 truncate">{c.banner.text}</span>}
            <button onClick={() => setBannerOff(true)} aria-label="Tutup banner" className="h-9 w-9 grid place-items-center text-mute"><X size={14} /></button>
          </div>
        )}
        <main className="absolute inset-x-0 bottom-[92px]" style={{ top: `calc(3.5rem + env(safe-area-inset-top) + ${bannerOn ? "3rem" : "0px"})` }}>
          <AnimatePresence mode="wait">
            {content && (
              <motion.div key={view} className="absolute inset-0" initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.26 }}>
                {content}
              </motion.div>
            )}
          </AnimatePresence>
          <MusicView active={view === "music"} />
        </main>
        <nav aria-label="Navigasi utama" className="absolute left-3.5 right-3.5 z-30 h-[68px] rounded-[26px] glass flex items-center justify-around px-1.5" style={{ bottom: "calc(14px + env(safe-area-inset-bottom))" }}>
          {DOCK.map(({ id, label, icon: I }) => {
            const on = view === id;
            if (id === "ai") {
              return (
                <button key={id} onClick={() => nav(id)} aria-label={label} aria-current={on} className="-mt-7 h-[60px] w-[60px] rounded-full orb grid place-items-center border-2 border-white/25 text-space active:scale-95 transition-transform"><I size={26} /></button>
              );
            }
            return (
              <button key={id} onClick={() => nav(id)} aria-label={label} aria-current={on ? "page" : undefined} className={`relative min-w-[54px] min-h-[48px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${on ? "text-cyan" : "text-mute"}`}>
                {on && <motion.span layoutId="dock-pill" className="absolute inset-0 rounded-2xl bg-cyan/10" transition={{ type: "spring", damping: 26, stiffness: 320 }} />}
                <I size={21} className="relative" /><span className="relative">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
