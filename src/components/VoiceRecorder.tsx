"use client";
import { useEffect, useRef, useState } from "react";
import { useLang, useT } from "@/lib/i18n/client";
import { SPEECH_LOCALE } from "@/lib/i18n/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Mode = "server" | "browser" | "none";

/**
 * Records speech and returns text. Uses Kadam's Indian speech-to-text service when it is
 * available, and otherwise the browser's own speech recognition (Chrome, Edge, Android).
 */
export function VoiceRecorder({ serverStt, onText, size = "lg" }: { serverStt: boolean; onText: (text: string) => void; size?: "lg" | "sm" }) {
  const t = useT();
  const lang = useLang();
  const [mode, setMode] = useState<Mode>(serverStt ? "server" : "none");
  const [state, setState] = useState<"idle" | "recording" | "working" | "error">("idle");
  const [secs, setSecs] = useState(0);
  const [interim, setInterim] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recog = useRef<any>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (serverStt) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(SR ? "browser" : "none");
  }, [serverStt]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startTimer = () => {
    setSecs(0);
    timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
  };
  const stopTimer = () => { if (timer.current) clearInterval(timer.current); timer.current = null; };

  async function startServer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        stopTimer();
        setState("working");
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        const fd = new FormData();
        fd.append("audio", blob, r.mimeType.includes("mp4") ? "voice.m4a" : "voice.webm");
        fd.append("lang", SPEECH_LOCALE[lang]);
        try {
          const res = await fetch("/api/stt", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok || !data.transcript) throw new Error();
          onText(data.transcript);
          setState("idle");
        } catch {
          setState("error");
        }
      };
      rec.current = r;
      r.start();
      setState("recording");
      startTimer();
    } catch {
      setState("error");
    }
  }

  function startBrowser() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setState("error");
    const r = new SR();
    r.lang = SPEECH_LOCALE[lang];
    r.continuous = true;
    r.interimResults = true;
    let finalText = "";
    r.onresult = (e: any) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript + " ";
        else live += res[0].transcript;
      }
      setInterim((finalText + live).trim());
    };
    r.onerror = () => { stopTimer(); setState("error"); };
    r.onend = () => {
      stopTimer();
      setInterim("");
      if (finalText.trim()) onText(finalText.trim());
      setState((s) => (s === "error" ? s : "idle"));
    };
    recog.current = r;
    r.start();
    setState("recording");
    startTimer();
  }

  const start = () => (mode === "server" ? startServer() : startBrowser());
  const stop = () => (mode === "server" ? rec.current?.stop() : recog.current?.stop());

  if (mode === "none") return size === "lg" ? <p className="text-sm text-ink-3">{t("voice.unsupported")}</p> : null;

  const big = size === "lg";
  return (
    <div className={big ? "flex flex-col items-center gap-3 py-2" : "inline-flex items-center"}>
      <button
        type="button"
        onClick={state === "recording" ? stop : start}
        disabled={state === "working"}
        aria-label={state === "recording" ? t("voice.stop") : t("voice.start")}
        className={`relative inline-flex items-center justify-center rounded-full transition ${
          big ? "h-24 w-24" : "h-12 w-12"
        } ${state === "recording" ? "bg-clay text-white" : "bg-saffron text-ink hover:bg-[#f7aa3a]"} disabled:opacity-60`}
      >
        {state === "recording" && <span className="absolute inset-0 animate-ping rounded-full bg-clay/40" aria-hidden="true" />}
        {state === "recording" ? (
          <span className={`relative rounded-md bg-white ${big ? "h-7 w-7" : "h-4 w-4"}`} />
        ) : state === "working" ? (
          <span className={`inline-block animate-spin rounded-full border-[3px] border-ink border-r-transparent ${big ? "h-8 w-8" : "h-5 w-5"}`} />
        ) : (
          <svg viewBox="0 0 24 24" className={big ? "h-10 w-10" : "h-6 w-6"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        )}
      </button>
      {big && (
        <p className="text-sm font-semibold text-ink-2" aria-live="polite">
          {state === "recording" ? `${t("voice.listening")} ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : state === "working" ? t("voice.working") : state === "error" ? t("voice.error") : t("voice.tap")}
        </p>
      )}
      {big && interim && <p className="max-w-md text-center text-ink-2 italic">{interim}</p>}
      {!big && state === "error" && <span className="ml-2 text-xs text-clay">{t("voice.error_short")}</span>}
    </div>
  );
}
