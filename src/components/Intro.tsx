"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Intro() {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);
  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 4)), 70);
    return () => clearInterval(t);
  }, []);
  const enter = () => { window.dispatchEvent(new Event("fahri:enter")); setShow(false); };
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-space" exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }} transition={{ duration: 0.9 }}>
          <div className="absolute inset-0 stars-css opacity-70" />
          <div className="relative text-center px-6">
            <motion.h1 initial={{ opacity: 0, letterSpacing: "0.9em" }} animate={{ opacity: 1, letterSpacing: "0.35em" }} transition={{ duration: 1.6, ease: "easeOut" }} className="font-display font-bold text-5xl sm:text-7xl bg-gradient-to-r from-ink via-cyan to-electric bg-clip-text text-transparent pl-[0.35em]">FAHRI</motion.h1>
            <p className="font-mono text-xs text-mute mt-4">{pct < 100 ? `Memuat semesta… ${pct}%` : "Semesta siap dijelajahi"}</p>
            <div className="mx-auto mt-3 h-[3px] w-56 rounded bg-navy2 overflow-hidden"><div className="h-full bg-gradient-to-r from-electric to-cyan transition-[width] duration-100" style={{ width: `${pct}%` }} /></div>
            <button onClick={enter} disabled={pct < 100} className="btn btn-primary mt-8 disabled:opacity-30 disabled:shadow-none">MASUK KE SEMESTA</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
