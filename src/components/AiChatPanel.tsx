"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { VoiceRecorder } from "./VoiceRecorder";
import { ChatMotionStyles, tr, useReducedMotion } from "./chat/motion";
import { useT } from "@/lib/i18n/client";

export type PanelTurn = { role: "assistant" | "user"; text: string };
// aiBusy: set by the action when Gemini was rate-limited and a fallback answered.
// suggestions: optional quick-reply answers; no current action returns them, chips only render when present.
type State = { error?: string; ok?: boolean; n?: number; aiBusy?: boolean; suggestions?: string[] };

function Avatar({ pulsing }: { pulsing?: boolean }) {
  return (
    <span className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary-deep ${pulsing ? "kc-pulse" : ""}`} aria-hidden="true">K</span>
  );
}

const isSpace = (p: string) => /^\s+$/.test(p);

/** Reveals text word by word. Full text is always available to screen readers. */
function TypedText({ text, animate }: { text: string; animate: boolean }) {
  const parts = text.split(/(\s+)/);
  const words = parts.filter((p) => p && !isSpace(p)).length;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const step = Math.max(1, Math.ceil(words / 70));
    const id = setInterval(() => {
      setShown((s) => {
        if (s + step >= words) {
          clearInterval(id);
          return words;
        }
        return s + step;
      });
    }, 45);
    return () => clearInterval(id);
  }, [animate, words]);
  if (!animate || shown >= words) return <>{text}</>;
  let seen = 0;
  let out = "";
  for (const p of parts) {
    if (p && !isSpace(p)) {
      if (seen >= shown) break;
      seen++;
    }
    out += p;
  }
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{out}</span>
    </>
  );
}

function Composer({ placeholder, voice, serverStt, skipLabel, sendLabel, busy }: { placeholder: string; voice: boolean; serverStt: boolean; skipLabel?: string; sendLabel: string; busy: boolean }) {
  const { pending: formPending } = useFormStatus();
  const pending = formPending || busy;
  const [text, setText] = useState("");
  useEffect(() => {
    if (!pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText("");
    }
  }, [pending]);
  return (
    <div className="border-t border-line bg-card p-3">
      <div className="flex items-end gap-2">
        {voice && <VoiceRecorder size="sm" serverStt={serverStt} onText={(s) => setText((p) => (p ? p + " " : "") + s)} />}
        <label className="sr-only" htmlFor="ai-answer">{placeholder}</label>
        <textarea
          id="ai-answer"
          name="text"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && text.trim() && !pending) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={placeholder}
          className="input min-h-12 flex-1 resize-none py-2.5"
          disabled={pending}
        />
        <button type="submit" className="btn-primary h-12 w-12 shrink-0 px-0" disabled={pending || !text.trim()} aria-label={sendLabel}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      {skipLabel && (
        <button type="submit" name="skip" value="1" className="mt-2 text-sm font-semibold text-ink-3 underline-offset-2 hover:underline" disabled={pending} formNoValidate>
          {skipLabel}
        </button>
      )}
    </div>
  );
}

export function AiChatPanel({
  turns,
  action,
  hidden,
  placeholder,
  voice = false,
  serverStt = false,
  skipLabel,
  assistantName,
}: {
  turns: PanelTurn[];
  action: (s: State, f: FormData) => Promise<State>;
  hidden: Record<string, string>;
  placeholder: string;
  voice?: boolean;
  serverStt?: boolean;
  skipLabel?: string;
  assistantName: string;
}) {
  const t = useT();
  const reduced = useReducedMotion();
  const [outgoing, setOutgoing] = useState("");
  const [lastSent, setLastSent] = useState<{ text: string; skip: boolean } | null>(null);
  const [initialCount] = useState(turns.length);

  const run = async (prev: State, fd: FormData): Promise<State> => {
    const text = String(fd.get("text") ?? "").trim();
    setLastSent({ text, skip: fd.get("skip") === "1" });
    setOutgoing(text);
    try {
      return await action(prev, fd);
    } catch (e) {
      // Let Next.js control-flow errors (redirect/notFound) through.
      const digest = (e as { digest?: string } | null)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_")) throw e;
      return { error: "chat.error_friendly", n: prev.n };
    }
  };
  const [state, formAction, isPending] = useActionState<State, FormData>(run, {});
  const end = useRef<HTMLDivElement>(null);

  function send(text: string, skip = false) {
    if (isPending) return;
    const fd = new FormData();
    for (const [k, v] of Object.entries(hidden)) fd.set(k, v);
    fd.set("text", text);
    if (skip) fd.set("skip", "1");
    startTransition(() => formAction(fd));
  }

  const failed = !isPending && !!state.error;
  const lastTurn = turns[turns.length - 1];
  const chips = !isPending && !state.error && lastTurn?.role === "assistant" ? state.suggestions?.filter(Boolean).slice(0, 5) : undefined;
  const bubbleText = isPending ? outgoing : failed ? lastSent?.text ?? "" : "";

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [turns.length, isPending, failed, chips?.length, reduced]);

  const errText = state.error ? tr(t, state.error, "") : "";
  const friendly = errText && errText !== state.error ? errText : tr(t, "chat.error_friendly", "That didn't go through. Your message is safe. Please try again.");
  const canRetry = !!lastSent && (!!lastSent.text || lastSent.skip);

  return (
    <div className="card flex flex-col overflow-hidden">
      <ChatMotionStyles />
      <div className="max-h-[58dvh] min-h-64 space-y-3 overflow-y-auto bg-canvas/60 p-4" aria-live="polite">
        {turns.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className={`flex max-w-[88%] items-start gap-2 ${i >= initialCount ? "kc-in-left" : ""}`}>
              <Avatar />
              <div>
                <p className="mb-0.5 text-xs font-semibold text-ink-3">{assistantName}</p>
                <p className="rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-2.5">
                  <TypedText text={m.text} animate={!reduced && i === turns.length - 1 && i >= initialCount} />
                </p>
              </div>
            </div>
          ) : (
            <div key={i} className={`ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white ${i >= initialCount ? "kc-in-right" : ""}`}>{m.text}</div>
          ),
        )}
        {bubbleText && (
          <div className="kc-in-right ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-white">{bubbleText}</div>
        )}
        {isPending && (
          <div className="kc-in-left flex max-w-[88%] items-start gap-2" role="status">
            <Avatar pulsing />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-ink-3">{assistantName}</p>
              <p className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-3 text-ink-3">
                <span className="kc-dot" aria-hidden="true" />
                <span className="kc-dot" aria-hidden="true" style={{ animationDelay: ".15s" }} />
                <span className="kc-dot" aria-hidden="true" style={{ animationDelay: ".3s" }} />
                <span className="sr-only">{t("chat.thinking")}</span>
              </p>
            </div>
          </div>
        )}
        {failed && (
          <div className="kc-in-left flex max-w-[88%] items-start gap-2" role="alert">
            <Avatar />
            <div className="kc-shake rounded-2xl rounded-tl-sm border border-alert/30 bg-alert-soft px-4 py-2.5">
              <p className="text-ink">{friendly}</p>
              {canRetry && lastSent && (
                <button type="button" className="btn-secondary mt-2 h-9 px-4 text-sm" onClick={() => send(lastSent.text, lastSent.skip)}>
                  {t("common.retry")}
                </button>
              )}
            </div>
          </div>
        )}
        {!isPending && !state.error && state.aiBusy && (
          <p className="kc-in-left rounded-xl bg-highlight-soft px-3 py-2 text-sm text-ink" role="status">
            {tr(t, "chat.ai_busy", "AI is busy, so this answer is simpler. Try again in a minute.")}
          </p>
        )}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-9" role="group" aria-label={tr(t, "chat.quick_replies", "Suggested answers")}>
            {chips.map((c, i) => (
              <button
                key={c}
                type="button"
                className="kc-pop rounded-full border border-primary/30 bg-primary-soft px-3.5 py-1.5 text-sm font-semibold text-primary-deep hover:bg-white"
                style={{ animationDelay: `${i * 70}ms` }}
                onClick={() => send(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form action={formAction}>
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <Composer placeholder={placeholder} voice={voice} serverStt={serverStt} skipLabel={skipLabel} sendLabel={t("common.send")} busy={isPending} />
      </form>
    </div>
  );
}
