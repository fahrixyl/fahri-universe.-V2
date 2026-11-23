"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, ExternalLink, SkipBack, SkipForward } from "lucide-react";
import { loadYT } from "@/lib/youtube";
import { useContent } from "./ContentProvider";

const fmt = (s: number) => (isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const ERR: Record<number, string> = {
  2: "ID video tidak valid.", 5: "Pemutar mengalami kendala. Coba lagi.", 100: "Video tidak ditemukan atau bersifat privat.",
  101: "Pemilik video tidak mengizinkan diputar di website lain.", 150: "Pemilik video tidak mengizinkan diputar di website lain.",
};

export default function MusicView({ active }: { active: boolean }) {
  const c = useContent();
  const tracks = c.playlist;
  const idsKey = tracks.map((t) => t.id).join(",");
  const wrap = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const want = useRef(false);
  const started = useRef(false);
  const tracksRef = useRef(tracks); tracksRef.current = tracks;
  const idxRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  const [vol, setVol] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  const go = (n: number, autoplay = true) => {
    const list = tracksRef.current; if (!list.length || !player.current) return;
    const i = ((n % list.length) + list.length) % list.length;
    idxRef.current = i; setIdx(i); setLiveTitle(""); setError(""); setT(0);
    try { autoplay ? player.current.loadVideoById(list[i].id) : player.current.cueVideoById(list[i].id); } catch {}
  };

  useEffect(() => {
    const enter = () => { want.current = true; try { player.current?.playVideo?.(); } catch {} };
    window.addEventListener("fahri:enter", enter);
    let dead = false; let poll: ReturnType<typeof setInterval> | undefined;
    loadYT().then(() => {
      if (dead || !wrap.current) return;
      const el = document.createElement("div");
      wrap.current.appendChild(el);
      player.current = new window.YT.Player(el, {
        videoId: tracksRef.current[0]?.id, width: "100%", height: "100%",
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, origin: window.location.origin },
        events: {
          onReady: () => {
            const p = player.current; setReady(true);
            try { p.setVolume(60); setD(p.getDuration() || 0); } catch {}
            if (want.current) p.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            const p = player.current; const s = e.data;
            if (s === 0) { go(idxRef.current + 1); return; } // lanjut lagu berikutnya (berputar)
            setPlaying(s === 1 || s === 3);
            if (s === 1) { started.current = true; setError(""); try { const n = p.getVideoData?.().title; if (n) setLiveTitle(n); setD(p.getDuration() || 0); } catch {} }
            window.dispatchEvent(new CustomEvent("fahri:music", { detail: s === 1 }));
          },
          onError: (e: { data: number }) => {
            setError(ERR[e.data] || "Video tidak bisa diputar."); setPlaying(false);
            window.dispatchEvent(new CustomEvent("fahri:music", { detail: false }));
            if (tracksRef.current.length > 1) setTimeout(() => go(idxRef.current + 1), 1500);
          },
        },
      });
      poll = setInterval(() => { try { const x = player.current?.getCurrentTime?.(); if (typeof x === "number") setT(x); } catch {} }, 500);
    }).catch(() => setError("Pemutar YouTube gagal dimuat. Periksa koneksi lalu muat ulang halaman."));
    return () => { dead = true; if (poll) clearInterval(poll); window.removeEventListener("fahri:enter", enter); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Playlist dari server tiba setelah pemutar dibuat: ganti lagu pertama bila belum diputar
  useEffect(() => { if (ready && !started.current) go(0, false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [idsKey, ready]);

  const toggle = () => { const p = player.current; if (!p) return; try { playing ? p.pauseVideo() : p.playVideo(); } catch {} };
  const applyVol = (v: number) => { setVol(v); setMuted(false); try { player.current?.unMute?.(); player.current?.setVolume(Math.round(v * 100)); } catch {} };
  const toggleMute = () => { const m = !muted; setMuted(m); try { m ? player.current?.mute() : player.current?.unMute(); } catch {} };
  const bars = [10, 22, 14, 28, 18, 8, 24, 16, 12, 26];
  const cur = tracks[idx] || tracks[0];
  const title = liveTitle || cur?.title || "Lagu pilihan Fahri";

  return (
    <div aria-hidden={!active} className={`absolute inset-0 px-5 flex flex-col ${active ? "view-in" : "-translate-x-[300%] pointer-events-none"}`}>
      <h2 className="font-display text-[26px] font-bold">Musik</h2>
      <p className="text-[13px] text-mute mb-3">Playlist pilihan Fahri.</p>
      <div className="glass glow-border rounded-3xl p-4">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy2 border border-cyan/20">
          <div ref={wrap} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:pointer-events-none" />
          {!ready && !error && <div className="absolute inset-0 grid place-items-center text-xs text-mute">Memuat pemutar…</div>}
          <button onClick={toggle} aria-label={playing ? "Jeda" : "Putar"} className="absolute inset-0" />
        </div>
        <p className="font-display font-semibold mt-3 truncate">{title}</p>
        <p className="text-xs text-mute">Diputar lewat pemutar resmi YouTube</p>
        <input type="range" min={0} max={d || 1} step={1} value={Math.min(t, d || 1)} onChange={(e) => { const v = Number(e.target.value); setT(v); try { player.current?.seekTo(v, true); } catch {} }} aria-label="Progres musik" className="w-full mt-3" />
        <div className="flex justify-between text-[11px] font-mono text-mute mt-1"><span>{fmt(t)}</span><span>{fmt(d)}</span></div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-end gap-[3px] h-8" aria-hidden>
            {bars.map((h, i) => <i key={i} className="w-1 rounded-sm bg-cyan" style={{ height: playing ? undefined : "20%", animation: playing ? `eq ${0.7 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite` : "none", minHeight: 4, maxHeight: h + 4 }} />)}
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => go(idx - 1)} disabled={!ready || tracks.length < 2} aria-label="Lagu sebelumnya" className="h-11 w-11 grid place-items-center text-mute disabled:opacity-30"><SkipBack size={20} /></button>
            <button onClick={toggle} disabled={!ready} aria-label={playing ? "Jeda" : "Putar"} className="h-14 w-14 rounded-full bg-gradient-to-br from-electric to-cyan text-space grid place-items-center disabled:opacity-40 shadow-[0_0_28px_-4px_rgb(var(--cyan))]">{playing ? <Pause size={24} /> : <Play size={24} />}</button>
            <button onClick={() => go(idx + 1)} disabled={!ready || tracks.length < 2} aria-label="Lagu berikutnya" className="h-11 w-11 grid place-items-center text-mute disabled:opacity-30"><SkipForward size={20} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={toggleMute} aria-label={muted ? "Aktifkan suara" : "Bisukan"} className="text-mute">{muted || vol === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : vol} onChange={(e) => applyVol(Number(e.target.value))} aria-label="Volume" className="flex-1" />
        </div>
      </div>
      {tracks.length > 1 && (
        <ul className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5">
          {tracks.map((tr, i) => (
            <li key={tr.id + i}><button onClick={() => go(i)} className={`w-full text-left rounded-2xl px-3.5 py-2.5 text-sm flex items-center gap-2.5 ${i === idx ? "glass text-cyan" : "text-mute"}`}><span className="font-mono text-[11px] w-5">{i + 1}</span><span className="truncate">{tr.title || `Lagu ${i + 1}`}</span></button></li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-xs text-red-200 bg-red-500/10 border border-red-400/20 rounded-2xl px-3.5 py-2.5">{error}</p>}
      {cur && <a href={`https://youtu.be/${cur.id}`} target="_blank" rel="noopener noreferrer" className="mt-3 self-start inline-flex items-center gap-2 text-xs text-cyan"><ExternalLink size={14} />Buka di YouTube</a>}
    </div>
  );
}
