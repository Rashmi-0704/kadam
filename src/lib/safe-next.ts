/** Only internal student paths: no "//", protocol, backslash or other characters (prevents open redirects). */
export function safeNext(raw: unknown): string | null {
  const n = typeof raw === "string" ? raw.trim() : "";
  if (!n.startsWith("/student/") || n.includes("//") || n.includes("\\") || n.includes(":") || !/^[A-Za-z0-9/_\-?=&.]+$/.test(n)) return null;
  return n;
}

