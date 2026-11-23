"use client";
import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

type BIP = Event & { prompt: () => Promise<void> };

export default function PwaManager() {
  const [prompt, setPrompt] = useState<BIP | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const bip = (e: Event) => { e.preventDefault(); setPrompt(e as BIP); };
    window.addEventListener("beforeinstallprompt", bip);
    window.addEventListener("appinstalled", () => setPrompt(null));
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          w?.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) setWaiting(w); });
        });
      }).catch(() => {});
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
    }
    return () => window.removeEventListener("beforeinstallprompt", bip);
  }, []);

  return (
    <div className="fixed left-3 top-16 z-[120] flex flex-col gap-2">
      {prompt && <button onClick={async () => { await prompt.prompt(); setPrompt(null); }} className="btn btn-primary !py-2 !px-4 text-xs"><Download size={14} />Pasang aplikasi</button>}
      {waiting && <button onClick={() => waiting.postMessage("SKIP_WAITING")} className="btn btn-ghost !py-2 !px-4 text-xs"><RefreshCw size={14} />Versi baru tersedia, perbarui</button>}
    </div>
  );
}
