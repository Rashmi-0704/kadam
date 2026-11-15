import "server-only";
import type { z } from "zod";
import { env } from "../env";

export type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

const GEMINI_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/heic", "text/plain", "text/markdown", "text/csv", "text/html"];
export const geminiCanRead = (mime: string) => GEMINI_FILE_TYPES.includes(mime);
export const hasGemini = () => Boolean(env.geminiKey);

/**
 * One small Gemini call that must return JSON matching `schema`.
 * Returns null on any failure (no key, network, rate limit, invalid JSON) so callers can
 * keep their last good result or use a saved/heuristic answer.
 */
export async function geminiJson<T>(opts: {
  system: string;
  parts: Part[];
  jsonSchema: Record<string, unknown>;
  zod: z.ZodType<T>;
  temperature?: number;
}): Promise<T | null> {
  if (!env.geminiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`;
  const body = (withSchema: boolean) => ({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: opts.parts }],
    generationConfig: {
      responseMimeType: "application/json",
      ...(withSchema ? { responseJsonSchema: opts.jsonSchema } : {}),
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: 2048,
    },
  });
  for (const withSchema of [true, false]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.geminiKey },
        body: JSON.stringify(body(withSchema)),
        signal: AbortSignal.timeout(30000),
        cache: "no-store",
      });
      if (res.status === 400 && withSchema) continue; // retry without a structured schema
      if (!res.ok) {
        console.warn(`[gemini] ${res.status}`);
        return null;
      }
      const data = await res.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
      if (!text) return null;
      const parsed = opts.zod.safeParse(JSON.parse(stripFences(text)));
      if (parsed.success) return parsed.data;
      console.warn("[gemini] schema mismatch");
      if (!withSchema) return null;
    } catch (e) {
      console.warn("[gemini] call failed", (e as Error).name);
      return null;
    }
  }
  return null;
}

function stripFences(s: string) {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
}

export const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
