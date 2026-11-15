import "server-only";

// Best-effort fetch of a job posting's visible text. Many job sites block bots; callers
// fall back to the link itself plus what the student says about the role.
export async function fetchJobText(url: string): Promise<string | null> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname) || u.hostname.endsWith(".internal")) return null;
    const res = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; KadamBot/1.0)" }, signal: AbortSignal.timeout(8000), redirect: "follow" });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
    const html = (await res.text()).slice(0, 400_000);
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
    const text = html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&amp;|&#\d+;|&\w+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const out = `${title}\n${text}`.slice(0, 4000);
    return out.length > 200 ? out : null;
  } catch {
    return null;
  }
}
