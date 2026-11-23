"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULTS, type Content } from "@/lib/content";
import { applyTheme } from "@/lib/theme";

const Ctx = createContext<{ content: Content; preview: boolean }>({ content: DEFAULTS, preview: false });
export const useContent = () => useContext(Ctx).content;
export const usePreview = () => useContext(Ctx).preview;

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content>(DEFAULTS);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("preview") === "1";
    setPreview(p);
    fetch(`/api/content${p ? "?draft=1" : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d?.content) setContent(d.content); })
      .catch(() => {});
  }, []);
  useEffect(() => { applyTheme(content.theme.preset); }, [content.theme.preset]);
  return <Ctx.Provider value={{ content, preview }}>{children}</Ctx.Provider>;
}
