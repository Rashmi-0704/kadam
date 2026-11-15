import "server-only";
import { env } from "./env";

// Sarvam AI speech-to-text (saaras). Returns null when the key is missing or the call fails.
export async function transcribe(audio: Blob, filename: string, languageCode = "unknown"): Promise<{ transcript: string; language: string | null } | null> {
  if (!env.sarvamKey) return null;
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", env.sarvamModel);
  form.append("language_code", languageCode);
  try {
    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": env.sarvamKey },
      body: form,
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) {
      console.warn("[sarvam]", res.status);
      return null;
    }
    const data = await res.json();
    return { transcript: String(data.transcript ?? ""), language: data.language_code ?? null };
  } catch (e) {
    console.warn("[sarvam] failed", (e as Error).name);
    return null;
  }
}

export const hasServerStt = () => Boolean(env.sarvamKey);
