import "server-only";
import type { z } from "zod";
import { env } from "../env";
import { takeSlot, markOutcome, type AiFeature } from "./usage";

export type Part = { text: string } | { inline_data: { mime_type: string; data: string } };
export type { AiFeature };

const GEMINI_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/heic", "text/plain", "text/markdown", "text/csv", "text/html"];
export const geminiCanRead = (mime: string) => GEMINI_FILE_TYPES.includes(mime);
export const hasGemini = () => Boolean(env.geminiKey || env.geminiKey2);

/** data = the validated answer, or null. busy = it failed because Google rate-limited us / was overloaded, or our own limiter was full. */
export type AiResult<T> = { data: T | null; busy: boolean };

const BUSY = [429, 503];
const KEY_FALLBACK = [401, 403, 429, 500, 503];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Google's 429 body may say how long to wait ("retryDelay": "7s"). Waits are capped so a page never hangs. */
async function backoffMs(res: Response | undefined) {
  let ms = 2500;
  try {
    const txt = res ? await res.clone().text() : "";
    const m = txt.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
    if (m) ms = Number(m[1]) * 1000;
  } catch {}
  return Math.min(8000, Math.max(1500, ms)) + Math.floor(Math.random() * 500);
}

/**
 * One small Gemini call that must return JSON matching `zod`.
 * Every HTTP request first takes a slot from the shared limiter (which also counts it for the admin page).
 * On 429/503 (after trying the second key) it waits and retries once, then reports busy so the caller can
 * keep the last good result or use its rule-based answer. Never throws.
 */
export async function geminiCall<T>(opts: {
  feature: AiFeature;
  system: string;
  parts: Part[];
  jsonSchema: Record<string, unknown>;
  zod: z.ZodType<T>;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<AiResult<T>> {
  const keys = [env.geminiKey, env.geminiKey2].filter(Boolean);
  if (!keys.length) return { data: null, busy: false };
  const label = opts.feature;
  const t0 = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent`;
  const body = (withSchema: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: opts.parts }],
      generationConfig: {
        responseMimeType: "application/json",
        ...(withSchema ? { responseJsonSchema: opts.jsonSchema } : {}),
        temperature: opts.temperature ?? 0.4,
        maxOutputTokens: opts.maxOutputTokens ?? 8192,
      },
    });

  let withSchema = true;
  let retriedBusy = false;
  for (;;) {
    let res: Response | undefined;
    try {
      // Primary key first; the second key is tried when the first is rate limited, rejected or the service is down.
      // (Quota is per Google Cloud project, so the second key only helps if it belongs to a different project.)
      for (const key of keys) {
        if (!(await takeSlot(opts.feature))) {
          await markOutcome(opts.feature, "limited");
          return { data: null, busy: true };
        }
        res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: body(withSchema),
          signal: AbortSignal.timeout(30000),
          cache: "no-store",
        });
        if (res.ok || !KEY_FALLBACK.includes(res.status)) break;
        console.warn(`[gemini] HTTP ${res.status} on a key${keys.length > 1 ? ", trying next" : ""} · ${label}`);
      }
    } catch (e) {
      console.warn(`[gemini] call failed ${(e as Error).name} · ${label}`);
      await markOutcome(opts.feature, "failed");
      return { data: null, busy: (e as Error).name === "TimeoutError" };
    }
    if (!res) return { data: null, busy: false };
    if (BUSY.includes(res.status)) {
      await markOutcome(opts.feature, "limited");
      if (retriedBusy) return { data: null, busy: true };
      retriedBusy = true;
      const wait = await backoffMs(res);
      console.warn(`[gemini] HTTP ${res.status}, retrying once in ${wait}ms · ${label}`);
      await sleep(wait);
      continue;
    }
    if (res.status === 400 && withSchema) {
      console.warn(`[gemini] schema rejected, retrying without it · ${label}`);
      withSchema = false;
      continue;
    }
    if (!res.ok) {
      console.warn(`[gemini] HTTP ${res.status} · ${label}`);
      await markOutcome(opts.feature, "failed");
      return { data: null, busy: false };
    }
    try {
      const data = await res.json();
      // Skip any "thought" parts some models return; only the answer is JSON.
      const text: string | undefined = data?.candidates?.[0]?.content?.parts
        ?.filter((p: { thought?: boolean }) => !p.thought)
        .map((p: { text?: string }) => p.text ?? "")
        .join("");
      if (!text) {
        console.warn(`[gemini] empty answer (${data?.candidates?.[0]?.finishReason ?? "?"}) · ${label}`);
        await markOutcome(opts.feature, "failed");
        return { data: null, busy: false };
      }
      const parsed = opts.zod.safeParse(JSON.parse(stripFences(text)));
      if (parsed.success) {
        console.log(`[gemini] ok ${Date.now() - t0}ms · ${label}`);
        return { data: parsed.data, busy: false };
      }
      console.warn(`[gemini] schema mismatch: ${parsed.error.issues.slice(0, 2).map((i) => i.path.join(".") + " " + i.message).join("; ")} · ${label}`);
    } catch (e) {
      console.warn(`[gemini] bad answer ${(e as Error).name} · ${label}`);
    }
    await markOutcome(opts.feature, "failed");
    return { data: null, busy: false };
  }
}

/** Same as geminiCall, for callers that only need the answer. */
export async function geminiJson<T>(opts: Parameters<typeof geminiCall<T>>[0]): Promise<T | null> {
  return (await geminiCall(opts)).data;
}

function stripFences(s: string) {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
}

export const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
