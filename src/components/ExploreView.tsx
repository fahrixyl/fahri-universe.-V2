"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, User, Zap, Heart, Folder, Instagram, Github, MessageCircle, Mail, ExternalLink, Code2 } from "lucide-react";
import { useContent } from "./ContentProvider";
import { waUrl, type Content } from "@/lib/content";
import { Ico, TikTok } from "./icons";
import Portrait from "./Portrait";

export type SheetId = "about" | "skills" | "hobbies" | "projects";
const TITLES: Record<SheetId, string> = { about: "Tentang Saya", skills: "Keahlian", hobbies: "Hobi dan Minat", projects: "Proyek Saya" };

function useContentParts() { const c = useContent(); return { profile: c.profile, hobbies: c.hobbies, skills: c.skills, projects: c.projects }; }

function Tile({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass glow-border rounded-3xl p-4 text-left h-[112px] flex flex-col gap-1.5 active:scale-[.97] transition-transform">
      <span className="h-10 w-10 rounded-xl bg-electric/25 text-cyan grid place-items-center">{icon}</span>
      <span className="font-display font-semibold text-[15px] mt-1">{title}</span>
      <span className="text-[11px] text-mute">{sub}</span>
    </button>
  );
}

const socialsOf = (c: Content) => [
  { name: "Instagram", href: c.profile.instagram, icon: <Instagram size={20} /> },
  { name: "GitHub", href: c.profile.github, icon: <Github size={20} /> },
  { name: "TikTok", href: c.profile.tiktok, icon: <TikTok size={20} /> },
  { name: "WhatsApp", href: waUrl(c), icon: <MessageCircle size={20} /> },
];

function SheetFrame({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div className="absolute inset-0 z-20 flex flex-col px-5 pt-1 bg-space/75 backdrop-blur-xl" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
      <div className="flex items-center gap-3 pb-3">
        <button onClick={onClose} aria-label="Kembali" className="h-10 w-10 grid place-items-center rounded-full glass"><ArrowLeft size={18} /></button>
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">{children}</div>
    </motion.div>
  );
}

function About() {
  const { profile, hobbies } = useContentParts();
  const info = [["Nama", profile.name], ["Domain", "fahriofficiall.my.id"], ["Fokus", "Teknologi dan dunia digital"], ["Minat", `${hobbies.length} bidang`]];
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <Portrait className="rounded-full breath" style={{ width: 132, height: 132 }} />
      <p className="text-sm text-mute leading-relaxed">{profile.bio} Website ini adalah semesta pribadi tempat kamu mengenal Fahri lebih dekat.</p>
      <dl className="grid grid-cols-2 gap-2.5 w-full text-left">
        {info.map(([k, v]) => (<div key={k} className="glass rounded-2xl p-3"><dt className="text-[11px] text-mute">{k}</dt><dd className="font-display text-sm mt-0.5 break-words">{v}</dd></div>))}
      </dl>
      <div className="flex flex-wrap justify-center gap-2">{hobbies.map((h) => <span key={h.title} className="text-xs border border-cyan/30 text-cyan rounded-full px-3 py-1">{h.title}</span>)}</div>
    </div>
  );
}

function Skills() {
  const { skills } = useContentParts();
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  return (
    <div className="h-full flex flex-col gap-3">
      <div ref={ref} onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))} className="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {skills.map((s) => (
          <div key={s.title} className="w-full shrink-0 snap-center px-0.5 flex">
            <div className="glass glow-border rounded-3xl p-6 flex-1 flex flex-col items-start">
              <span className="h-16 w-16 rounded-2xl bg-electric/25 text-cyan grid place-items-center"><Ico name={s.icon} size={32} /></span>
              <h3 className="font-display text-2xl font-bold mt-5">{s.title}</h3>
              <p className="text-sm text-mute leading-relaxed mt-2">{s.text}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">{s.tags.map((t) => <span key={t} className="font-mono text-[11px] text-cyan border border-cyan/30 rounded-full px-2.5 py-0.5">{t}</span>)}</div>
              <p className="mt-auto text-[11px] text-mute">Geser untuk melihat keahlian lain</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 pb-1">
        {skills.map((s, n) => (
          <button key={s.title} aria-label={`Keahlian ${n + 1}`} onClick={() => ref.current?.scrollTo({ left: n * ref.current.clientWidth, behavior: "smooth" })} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-cyan" : "w-2 bg-white/25"}`} />
        ))}
      </div>
    </div>
  );
}

function Hobbies() {
  const { hobbies } = useContentParts();
  return (
    <div className="grid grid-cols-2 gap-3">
      {hobbies.map((h) => (
        <div key={h.title} className="glass glow-border rounded-3xl p-4 h-[150px] flex flex-col">
          <span className="h-11 w-11 rounded-xl bg-electric/25 text-cyan grid place-items-center"><Ico name={h.icon} size={24} /></span>
          <h3 className="font-display font-semibold mt-3">{h.title}</h3>
          <p className="text-[11px] text-mute leading-snug mt-1">{h.text}</p>
        </div>
      ))}
    </div>
  );
}

function Projects() {
  const { projects } = useContentParts();
  if (projects.length === 0) return <div className="glass rounded-3xl p-8 text-center text-sm text-mute">Proyek belum ditampilkan. Karya baru akan hadir di sini.</div>;
  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => (
        <div key={p.name} className="glass glow-border rounded-3xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.image && <img src={p.image} alt={`Pratinjau ${p.name}`} className="aspect-video w-full object-cover" loading="lazy" />}
          <div className="p-4">
            <span className="font-mono text-[11px] text-cyan">{p.category}</span>
            <h3 className="font-display text-lg">{p.name}</h3>
            <p className="text-sm text-mute mt-1">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">{p.tech.map((x) => <span key={x} className="font-mono text-[11px] border border-white/10 rounded-full px-2 py-0.5">{x}</span>)}</div>
            <div className="flex gap-2 mt-3">
              {p.demo && <a className="btn btn-primary !py-2 !px-4 text-xs" href={p.demo} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} />Live Demo</a>}
              {p.source && <a className="btn btn-ghost !py-2 !px-4 text-xs" href={p.source} target="_blank" rel="noopener noreferrer"><Code2 size={14} />Source Code</a>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExploreView({ sheet, setSheet, go }: { sheet: SheetId | null; setSheet: (s: SheetId | null) => void; go: (t: string) => void }) {
  const c = useContent(); const socials = socialsOf(c);
  return (
    <div className="relative h-full px-5">
      <h2 className="font-display text-[26px] font-bold">Jelajah</h2>
      <p className="text-[13px] text-mute mb-4">Pilih tujuan, semuanya hanya satu ketukan.</p>
      <div className="grid grid-cols-2 gap-3">
        <Tile icon={<User size={20} />} title="Tentang Saya" sub="Siapa Fahri" onClick={() => setSheet("about")} />
        <Tile icon={<Zap size={20} />} title="Keahlian" sub={`${c.skills.length} bidang teknologi`} onClick={() => setSheet("skills")} />
        <Tile icon={<Heart size={20} />} title="Hobi" sub={`${c.hobbies.length} minat`} onClick={() => setSheet("hobbies")} />
        <Tile icon={<Folder size={20} />} title="Proyek" sub="Karya digital" onClick={() => setSheet("projects")} />
      </div>
      <p className="mt-5 mb-2 text-xs font-semibold text-mute">Semesta sosial</p>
      <div className="grid grid-cols-4 gap-2">
        {socials.map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="glass rounded-2xl h-[68px] flex flex-col items-center justify-center gap-1.5 text-cyan active:scale-95 transition-transform">
            {s.icon}<span className="text-[10px] text-ink">{s.name}</span>
          </a>
        ))}
      </div>
      <button onClick={() => go("contact")} className="glass glow-border w-full mt-3 h-14 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-sm active:scale-[.98] transition-transform"><Mail size={19} className="text-cyan" />Hubungi saya</button>
      <AnimatePresence>
        {sheet && (
          <SheetFrame key={sheet} title={TITLES[sheet]} onClose={() => setSheet(null)}>
            {sheet === "about" && <About />}{sheet === "skills" && <Skills />}{sheet === "hobbies" && <Hobbies />}{sheet === "projects" && <Projects />}
          </SheetFrame>
        )}
      </AnimatePresence>
    </div>
  );
}
