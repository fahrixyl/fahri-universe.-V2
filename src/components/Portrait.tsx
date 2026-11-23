"use client";
import { useEffect, useState } from "react";
import { useContent, usePreview } from "./ContentProvider";

const STATIC = "/images/fahri-portrait.jpg?v=2";

export default function Portrait({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const c = useContent(); const preview = usePreview();
  const wanted = c.photoVersion > 0 ? `/api/photo?v=${c.photoVersion}${preview ? "&draft=1" : ""}` : STATIC;
  const [src, setSrc] = useState(wanted);
  const [err, setErr] = useState(false);
  useEffect(() => { setSrc(wanted); setErr(false); }, [wanted]);
  return (
    <div className={`relative overflow-hidden border-2 border-cyan/50 bg-navy2 ${className}`} style={style}>
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Foto ${c.profile.name}`} onError={() => (src !== STATIC ? setSrc(STATIC) : setErr(true))} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full grid place-items-center font-display text-5xl text-cyan/70">F</div>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg,rgb(var(--cyan)/.14),transparent 45%,rgb(var(--electric)/.2))", mixBlendMode: "screen" }} />
    </div>
  );
}
