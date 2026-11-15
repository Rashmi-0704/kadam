"use client";
import { useActionState, useState } from "react";
import { startProblem, type FormState } from "@/app/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FileUploader } from "@/components/FileUploader";
import { useT } from "@/lib/i18n/client";

type Mode = "voice" | "text" | "file";

export function ProblemStarter({ serverStt }: { serverStt: boolean }) {
  const t = useT();
  const [mode, setMode] = useState<Mode>("voice");
  const [text, setText] = useState("");
  const [state, action] = useActionState<FormState, FormData>(startProblem, {});
  const tabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: "voice", label: t("pc.tab_voice"), icon: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></> },
    { id: "text", label: t("pc.tab_text"), icon: <path d="M4 7h16M4 12h16M4 17h10" /> },
    { id: "file", label: t("pc.tab_file"), icon: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4" /></> },
  ];
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />
      <div role="tablist" aria-label={t("pc.how")} className="grid grid-cols-3 gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={mode === tb.id}
            onClick={() => setMode(tb.id)}
            className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-sm font-semibold transition ${mode === tb.id ? "border-ink bg-card" : "border-transparent bg-sand text-ink-2"}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tb.icon}</svg>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {mode === "voice" && (
          <div className="space-y-4">
            <p className="text-center text-ink-2">{t("pc.voice_help")}</p>
            <VoiceRecorder serverStt={serverStt} onText={(s) => setText((p) => (p ? p + " " : "") + s)} />
          </div>
        )}
        {mode === "file" && (
          <div className="space-y-3">
            <p className="text-ink-2">{t("pc.file_help")}</p>
            <FileUploader name="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv" label={t("pc.file_label")} />
          </div>
        )}
        <div className={mode === "voice" && !text ? "hidden" : "mt-4"}>
          <label className="label" htmlFor="text">{mode === "voice" ? t("pc.voice_check") : mode === "file" ? t("pc.file_note") : t("pc.text_label")}</label>
          <textarea id="text" name="text" rows={mode === "text" ? 6 : 4} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("pc.text_ph")} />
        </div>
      </div>
      {state.error && <p className="text-sm font-semibold text-clay" role="alert">{t(state.error)}</p>}
      <SubmitButton className="btn-primary w-full" pendingLabel={t("pc.starting")}>{t("pc.start")}</SubmitButton>
      <p className="text-center text-sm text-ink-3">{t("pc.privacy")}</p>
    </form>
  );
}
