"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { VoiceRecorder } from "./VoiceRecorder";
import { Spinner } from "./SubmitButton";
import { useT } from "@/lib/i18n/client";

export type PanelTurn = { role: "assistant" | "user"; text: string };
type State = { error?: string; ok?: boolean; n?: number };

function Composer({ placeholder, voice, serverStt, skipLabel, sendLabel }: { placeholder: string; voice: boolean; serverStt: boolean; skipLabel?: string; sendLabel: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  const [text, setText] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!pending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText("");
    }
  }, [pending]);
  return (
    <div className="border-t border-line bg-card p-3">
      {pending && (
        <p className="mb-2 flex items-center gap-2 px-1 text-sm text-ink-2" role="status">
          <Spinner /> {t("chat.thinking")}
        </p>
      )}
      <div className="flex items-end gap-2">
        {voice && <VoiceRecorder size="sm" serverStt={serverStt} onText={(s) => setText((p) => (p ? p + " " : "") + s)} />}
        <label className="sr-only" htmlFor="ai-answer">{placeholder}</label>
        <textarea
          id="ai-answer"
          ref={ta}
          name="text"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && text.trim()) {
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
  const [state, formAction] = useActionState<State, FormData>(action, {});
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length]);
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="max-h-[58dvh] min-h-64 space-y-3 overflow-y-auto bg-paper/60 p-4" aria-live="polite">
        {turns.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="flex max-w-[88%] items-start gap-2">
              <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-saffron" aria-hidden="true">K</span>
              <div>
                <p className="mb-0.5 text-xs font-semibold text-ink-3">{assistantName}</p>
                <p className="rounded-2xl rounded-tl-sm border border-line bg-card px-4 py-2.5">{m.text}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-paper">{m.text}</div>
          ),
        )}
        <div ref={end} />
      </div>
      <form action={formAction}>
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        {state.error && <p className="px-4 pt-3 text-sm font-semibold text-clay" role="alert">{t(state.error)}</p>}
        <Composer placeholder={placeholder} voice={voice} serverStt={serverStt} skipLabel={skipLabel} sendLabel={t("common.send")} />
      </form>
    </div>
  );
}
