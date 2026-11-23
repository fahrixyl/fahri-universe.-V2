"use client";
import { useEffect, useState } from "react";
export default function VisitorCounter() {
  const [total, setTotal] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const counted = sessionStorage.getItem("fahri-counted");
    fetch("/api/visitors", { method: counted ? "GET" : "POST" })
      .then((r) => r.json()).then((d) => { if (typeof d.total === "number") { setTotal(d.total); sessionStorage.setItem("fahri-counted", "1"); } })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (total === null) return;
    let n = 0; const step = Math.max(1, Math.ceil(total / 30));
    const t = setInterval(() => { n = Math.min(total, n + step); setShown(n); if (n >= total) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, [total]);
  if (total === null) return null;
  return <p className="text-center text-[11px] text-mute font-mono">Total kunjungan: <span className="text-cyan tabular-nums">{shown.toLocaleString("id-ID")}</span></p>;
}
