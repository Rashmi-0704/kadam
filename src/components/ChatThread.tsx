"use client";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { sendMessage, type FormState } from "@/app/actions/engagement";
import { useT } from "@/lib/i18n/client";
import { ChatMotionStyles, tr, useReducedMotion } from "./chat/motion";

type Msg = { id: string; mine: boolean; sender: string; role: string; text: string | null; file: { name: string; url: string } | null; at: string };

function Composer({ disabled }: { disabled: boolean }) {
  const t = useT();
  const { pending } = useFormStatus();
  const [text, setText] = useState("");
  const [file, setFile] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText("");
      setFile("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [pending]);
  return (
    <div className="border-t border-line bg-card p-3">
      {file && <p className="mb-2 truncate rounded-lg bg-mist px-3 py-1.5 text-sm">📎 {file}</p>}
      <div className="flex items-end gap-2">
        <label className={`inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line hover:bg-mist ${disabled ? "pointer-events-none opacity-50" : ""}`} aria-label={t("chat.attach")}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.3 3.3 0 0 1 4.7 4.7L10.2 18a1.7 1.7 0 0 1-2.4-2.4L15.5 8" /></svg>
          <input ref={fileRef} type="file" name="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} disabled={disabled} />
        </label>
        <label htmlFor="chat-text" className="sr-only">{t("chat.placeholder")}</label>
        <textarea
          id="chat-text"
          name="text"
          rows={1}
          value={text}
          disabled={disabled || pending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && (text.trim() || file)) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={disabled ? t("chat.closed") : t("chat.placeholder")}
          className="input min-h-12 flex-1 resize-none py-3"
        />
        <button type="submit" className="btn-primary h-12 w-12 shrink-0 px-0" disabled={disabled || pending || (!text.trim() && !file)} aria-label={t("common.send")}>
          {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas border-r-transparent" /> : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
        </button>
      </div>
    </div>
  );
}

export function ChatThread({ engagementId, otherName, disabled = false }: { engagementId: string; otherName: string; disabled?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  // Optimistic copy of the user's own message: "sending" while the action runs, "sent" until the thread reload shows it.
  const [opt, setOpt] = useState<{ text: string; file: string; baseLen: number; done: boolean } | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);
  const msgCount = useRef(0);
  const run = async (prev: FormState, fd: FormData): Promise<FormState> => {
    const f = fd.get("file");
    setOpt({ text: String(fd.get("text") ?? "").trim(), file: f instanceof File && f.size > 0 ? f.name : "", baseLen: msgCount.current, done: false });
    try {
      const res = await sendMessage(prev, fd);
      if (res.error) setOpt(null);
      else setOpt((o) => (o ? { ...o, done: true } : o));
      return res;
    } catch (e) {
      const digest = (e as { digest?: string } | null)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_")) throw e;
      setOpt(null);
      return { error: "chat.error_friendly" };
    }
  };
  const [state, action] = useActionState<FormState, FormData>(run, {});
  const box = useRef<HTMLDivElement>(null);
  const lastStatus = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}/messages`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list: Msg[] = data.messages;
      if (known.current) {
        const k = known.current;
        setFresh(new Set(list.filter((m) => !k.has(m.id)).map((m) => m.id)));
      }
      known.current = new Set(list.map((m) => m.id));
      msgCount.current = list.length;
      setMsgs(list);
      setFailed(false);
      if (lastStatus.current && lastStatus.current !== data.status) router.refresh();
      lastStatus.current = data.status;
    } catch {
      setFailed(true);
    }
  }, [engagementId, router]);

  useEffect(() => {
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), 4000);
    return () => clearInterval(id);
  }, [load]);
  useEffect(() => {
    if (state.n) load();
  }, [state.n, load]);
  const optShown = opt && !(opt.done && msgs && msgs.length > opt.baseLen) ? opt.text || opt.file : "";
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [msgs?.length, optShown, reduced]);

  return (
    <div className="card flex flex-col overflow-hidden">
      <ChatMotionStyles />
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-bold">{t("chat.title", { name: otherName })}</h2>
        {!disabled && <span className="flex items-center gap-1.5 text-xs text-ink-3"><span className="h-2 w-2 rounded-full bg-success-ink" aria-hidden="true" />{t("chat.live")}</span>}
      </div>
      <div ref={box} className="h-[46dvh] min-h-72 space-y-3 overflow-y-auto bg-canvas/60 p-4" aria-live="polite">
        {msgs === null ? (
          <p className="text-sm text-ink-3">{failed ? t("chat.load_failed") : t("chat.loading")}</p>
        ) : msgs.length === 0 && !optShown ? (
          <p className="mx-auto max-w-xs py-10 text-center text-sm text-ink-3">{t("chat.empty_thread", { name: otherName })}</p>
        ) : (
          <>
          {msgs.map((m) => (
            <div key={m.id} className={`flex max-w-[85%] flex-col ${m.mine ? "ml-auto items-end" : "items-start"} ${fresh.has(m.id) ? (m.mine ? "kc-in-right" : "kc-in-left") : ""}`}>
              {!m.mine && <span className="mb-0.5 text-xs font-semibold text-ink-3">{m.sender}</span>}
              <div className={`rounded-2xl px-4 py-2.5 ${m.mine ? "rounded-tr-sm bg-primary text-white" : "rounded-tl-sm border border-line bg-card"}`}>
                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                {m.file && (
                  <a href={m.file.url} target="_blank" rel="noopener noreferrer" className={`mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline-offset-2 hover:underline ${m.mine ? "bg-white/20" : "bg-mist"}`}>
                    📎 {m.file.name}
                  </a>
                )}
              </div>
              <time className="mt-0.5 text-[11px] text-ink-3" dateTime={m.at}>{new Date(m.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time>
            </div>
          ))}
          {opt && optShown && (
            <div className="kc-in-right ml-auto flex max-w-[85%] flex-col items-end">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white opacity-80">
                {opt.text && <p className="whitespace-pre-wrap">{opt.text}</p>}
                {opt.file && <p className="mt-1 truncate rounded-lg bg-white/20 px-2 py-1.5 text-sm font-semibold">📎 {opt.file}</p>}
              </div>
              <span className="mt-0.5 text-[11px] text-ink-3" role="status">{opt.done ? tr(t, "chat.sent", "Sent") : tr(t, "chat.sending", "Sending…")}</span>
            </div>
          )}
          </>
        )}
      </div>
      <form action={action}>
        <input type="hidden" name="engagementId" value={engagementId} />
        {state.error && <p className="px-4 pt-2 text-sm font-semibold text-alert" role="alert">{tr(t, state.error, tr(t, "chat.error_friendly", "That didn't go through. Please try again."))}</p>}
        <Composer disabled={disabled} />
      </form>
    </div>
  );
}
