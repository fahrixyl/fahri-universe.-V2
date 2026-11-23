import { buildInstruction } from "@/data/fahri-knowledge";
import { getLive } from "./content-server";
import type { Content } from "./content";
import type { ChatMsg } from "./validation";

export class GeminiError extends Error {
  constructor(public status: number, msg: string) { super(msg); }
}

async function callModel(model: string, key: string, messages: ChatMsg[], instruction: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
      }),
    });
    if (!r.ok) {
      console.error("[gemini]", model, r.status, (await r.text().catch(() => "")).slice(0, 300));
      throw new GeminiError(r.status === 429 ? 429 : r.status === 404 ? 404 : r.status === 400 || r.status === 401 || r.status === 403 ? 503 : 502, `gemini-${r.status}`);
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
    if (!text) throw new GeminiError(502, "empty");
    return text;
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    throw new GeminiError(504, "timeout");
  } finally {
    clearTimeout(timer);
  }
}

export async function askGemini(messages: ChatMsg[], content?: Content): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new GeminiError(503, "not-configured");
  const instruction = buildInstruction(content ?? (await getLive()));
  const models = Array.from(new Set([process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"]));
  let last: GeminiError = new GeminiError(502, "unknown");
  for (const m of models) {
    try { return await callModel(m, key, messages, instruction); }
    catch (e) { last = e as GeminiError; if (last.status !== 404 && last.status !== 502) throw last; }
  }
  throw last;
}
