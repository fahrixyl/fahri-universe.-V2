"use client";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { useContent } from "./ContentProvider";
import Portrait from "./Portrait";
import SmartClock from "./SmartClock";
import VisitorCounter from "./VisitorCounter";

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
    const t = setInterval(() => setN((x) => (x >= text.length ? x : x + 1)), 45);
    return () => clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}<span className="animate-pulse text-cyan">|</span></>;
}

export default function HomeView({ go }: { go: (t: string) => void }) {
  const c = useContent();
  const size = "clamp(168px, 29dvh, 240px)";
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = (x: number, y: number) => { if (box.current) box.current.style.transform = `perspective(800px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`; };
    const pm = (e: PointerEvent) => apply((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const dev = (e: DeviceOrientationEvent) => { if (e.gamma != null && e.beta != null) apply(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30))); };
    window.addEventListener("pointermove", pm); window.addEventListener("deviceorientation", dev);
    return () => { window.removeEventListener("pointermove", pm); window.removeEventListener("deviceorientation", dev); };
  }, []);
  return (
    <div className="h-full flex flex-col gap-2.5 px-5 pb-1">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center">
        <div ref={box} className="relative grid place-items-center" style={{ width: size, height: size, transformStyle: "preserve-3d", transition: "transform .18s ease-out" }}>
          <div className="absolute inset-0" style={{ transform: "translateZ(-30px)" }}>
            <div className="absolute inset-0 rounded-full border border-cyan/30" />
            <div className="absolute inset-0 orbit"><i className="absolute left-1/2 -top-[5px] -ml-[5px] h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_14px_rgb(var(--cyan))]" /></div>
          </div>
          <div className="absolute inset-[9%]" style={{ transform: "translateZ(-10px)" }}>
            <div className="absolute inset-0 rounded-full border border-dashed border-white/20" />
            <div className="absolute inset-0 orbit-r"><i className="absolute left-1/2 -bottom-[4px] -ml-1 h-2 w-2 rounded-full bg-electric shadow-[0_0_12px_rgb(var(--electric))]" /></div>
          </div>
          <div className="absolute inset-[14%] rounded-full holo" style={{ transform: "translateZ(20px)" }} />
          <Portrait className="rounded-full breath" style={{ width: "66%", height: "66%", transform: "translateZ(40px)" }} />
        </div>
        <h1 className="font-display font-bold tracking-tight text-[28px] leading-none mt-3 shimmer-text">{c.profile.name.toUpperCase()}</h1>
        <p className="font-display text-[13px] text-cyan mt-2 min-h-5"><Typewriter text={c.profile.tagline} /></p>
        <p className="text-[12px] leading-relaxed text-mute mt-1.5 max-w-[19rem]">{c.profile.bio}</p>
      </div>
      <SmartClock />
      <div className="flex gap-2.5">
        <button onClick={() => go("explore")} data-magnetic className="btn btn-primary flex-1 !rounded-2xl !h-12">JELAJAHI DUNIA SAYA</button>
        <button onClick={() => go("contact")} aria-label="Hubungi saya" className="btn btn-ghost !rounded-2xl !h-12 !w-12 !p-0"><Mail size={19} /></button>
      </div>
      <VisitorCounter />
    </div>
  );
}
