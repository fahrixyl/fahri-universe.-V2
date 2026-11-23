import { Globe, Terminal, Network, Wifi, Server, ShieldCheck, Code2, Cpu, TrendingUp, BookOpen, Gamepad2, type LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = { web: Globe, prog: Code2, net: Network, mikrotik: Wifi, linux: Terminal, server: Server, sec: ShieldCheck, tech: Cpu, invest: TrendingUp, read: BookOpen, game: Gamepad2 };

export function Ico({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  const I = map[name] ?? Code2;
  return <I size={size} className={className} aria-hidden />;
}

export function TikTok({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.3 2.3 1.7 4 4 4.2v3.2c-1.5 0-2.9-.4-4-1.1v6.1a6.1 6.1 0 1 1-6.1-6.1c.3 0 .7 0 1 .1v3.3a2.9 2.9 0 1 0 1.9 2.7V3h3.2z" />
    </svg>
  );
}
