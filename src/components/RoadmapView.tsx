"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { setTopicStatus } from "@/app/actions/student";
import { useT } from "@/lib/i18n/client";
import type { Section, Topic, ResourceType } from "@/db/roadmaps-data";

type Status = "done" | "learning" | "skipped";
type Statuses = Record<string, Status>;
export type PractiseProblem = { id: string; title: string; business: string; skills: string[] };

const flat = (sections: Section[]) => sections.flatMap((s) => s.topics.flatMap((t) => [t, ...(t.children ?? [])]));

function nodeClass(status: Status | undefined, kind: "topic" | "sub", optional?: boolean) {
  const base = "relative w-full rounded-xl text-left font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-saffron/40 select-none";
  const size = kind === "topic" ? "min-h-12 px-4 py-2.5 text-[15px]" : "min-h-10 px-3 py-2 text-sm";
  const border = optional ? "border-2 border-dashed" : "border-2";
  if (status === "done") return `${base} ${size} ${border} border-leaf bg-leaf text-white`;
  if (status === "learning") return `${base} ${size} ${border} border-saffron bg-saffron-soft text-ink`;
  if (status === "skipped") return `${base} ${size} ${border} border-line bg-sand text-ink-3 line-through decoration-2`;
  return kind === "topic"
    ? `${base} ${size} ${border} border-ink bg-card text-ink hover:-translate-y-0.5 hover:shadow-[0_6px_0_-2px_#1c1a27]`
    : `${base} ${size} ${optional ? "border border-dashed" : "border"} border-ink-3/50 bg-paper text-ink-2 hover:border-ink`;
}

function StatusMark({ status }: { status?: Status }) {
  if (status === "done") return <span aria-hidden="true" className="mr-1.5">✓</span>;
  if (status === "learning") return <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-saffron align-middle" />;
  return null;
}

export function RoadmapView({ role, sections, initialStatuses, problems }: { role: string; sections: Section[]; initialStatuses: Statuses; problems: PractiseProblem[] }) {
  const t = useT();
  const [statuses, setStatuses] = useState<Statuses>(initialStatuses);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  const all = useMemo(() => flat(sections), [sections]);
  const byId = useMemo(() => new Map(all.map((x) => [x.id, x])), [all]);
  const parentOf = useMemo(() => {
    const m = new Map<string, Topic>();
    for (const s of sections) for (const tp of s.topics) for (const c of tp.children ?? []) m.set(c.id, tp);
    return m;
  }, [sections]);
  const sectionOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sections) for (const tp of s.topics) for (const x of [tp, ...(tp.children ?? [])]) m.set(x.id, s.title);
    return m;
  }, [sections]);

  const set = useCallback(
    (id: string, next: Status | null) => {
      setStatuses((cur) => {
        const copy = { ...cur };
        if (next) copy[id] = next;
        else delete copy[id];
        return copy;
      });
      start(async () => {
        await setTopicStatus(role, id, next);
      });
    },
    [role],
  );
  const toggle = (id: string, s: Status) => set(id, statuses[id] === s ? null : s);

  // Deep links (#topic-id) open the drawer — used by "skills to brush up" on problem pages.
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (h && byId.has(h)) setOpenId(h);
  }, [byId]);
  useEffect(() => {
    const url = openId ? `#${openId}` : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  }, [openId]);

  const onNode = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) { e.preventDefault(); return toggle(id, "learning"); }
    if (e.altKey) { e.preventDefault(); return toggle(id, "skipped"); }
    setOpenId(id);
  };
  const onContext = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    toggle(id, "done");
  };

  const total = all.length;
  const done = all.filter((x) => statuses[x.id] === "done").length;
  const learning = all.filter((x) => statuses[x.id] === "learning").length;
  const skipped = all.filter((x) => statuses[x.id] === "skipped").length;
  const pct = total ? Math.round(((done + skipped) / total) * 100) : 0;

  const renderNode = (x: Topic, kind: "topic" | "sub") => (
    <button
      type="button"
      id={`node-${x.id}`}
      onClick={(e) => onNode(e, x.id)}
      onContextMenu={(e) => onContext(e, x.id)}
      className={nodeClass(statuses[x.id], kind, x.optional)}
      aria-label={`${x.title}${statuses[x.id] ? ` — ${t(`rm.s_${statuses[x.id]}`)}` : ""}${x.optional ? ` (${t("rm.optional")})` : ""}`}
    >
      <StatusMark status={statuses[x.id]} />
      {x.title}
    </button>
  );

  let topicIndex = 0;
  return (
    <div>
      {/* Progress */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-2xl font-bold">{t("rm.pct", { n: pct })}</p>
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-leaf">{t("rm.n_done", { n: done })}</span> · <span className="font-semibold text-saffron-deep">{t("rm.n_learning", { n: learning })}</span> · {t("rm.n_skipped", { n: skipped })} · {t("rm.n_total", { n: total })}
          </p>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span className="h-full bg-leaf transition-all" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
          <span className="h-full bg-ink-3/60 transition-all" style={{ width: `${(skipped / Math.max(1, total)) * 100}%` }} />
          <span className="h-full bg-saffron transition-all" style={{ width: `${(learning / Math.max(1, total)) * 100}%` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded border-2 border-ink bg-card" />{t("rm.recommended")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded border-2 border-dashed border-ink bg-card" />{t("rm.optional")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded bg-leaf" />{t("rm.s_done")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded border-2 border-saffron bg-saffron-soft" />{t("rm.s_learning")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded bg-sand" />{t("rm.s_skipped")}</span>
        <span className="hidden text-ink-3 lg:inline">{t("rm.tip")}</span>
        <span className="text-ink-3 lg:hidden">{t("rm.tip_touch")}</span>
      </div>

      {/* Tree */}
      <div className="relative pb-6">
        <span className="absolute top-0 bottom-0 left-[11px] w-1 rounded-full bg-ink md:left-1/2 md:-ml-0.5" aria-hidden="true" />
        {sections.map((sec) => (
          <section key={sec.title} className="relative mb-6" aria-label={sec.title}>
            <h2 className="relative z-10 mb-5 ml-8 inline-block rounded-full bg-ink px-4 py-1.5 font-display text-sm font-bold text-paper md:left-1/2 md:ml-0 md:-translate-x-1/2">{sec.title}</h2>
            <ul className="space-y-5">
              {sec.topics.map((tp) => {
                const side = topicIndex++ % 2 === 0 ? "right" : "left";
                const kids = tp.children ?? [];
                return (
                  <li key={tp.id} className="relative grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_15rem_1fr] md:gap-0">
                    <span className="absolute top-6 left-[7px] z-10 h-3 w-3 rounded-full border-2 border-ink bg-paper md:hidden" aria-hidden="true" />
                    <div className="relative z-10 ml-8 md:col-start-2 md:row-start-1 md:ml-0">
                      {renderNode(tp, "topic")}
                    </div>
                    {kids.length > 0 && (
                      <div className={`relative ml-14 md:row-start-1 md:ml-0 ${side === "right" ? "md:col-start-3 md:pl-8" : "md:col-start-1 md:pr-8"}`}>
                        <span className={`absolute top-1/2 hidden w-8 border-t-2 border-dashed border-ink-3 md:block ${side === "right" ? "left-0" : "right-0"}`} aria-hidden="true" />
                        <span className="absolute top-0 bottom-0 -left-4 border-l-2 border-dashed border-ink-3/60 md:hidden" aria-hidden="true" />
                        <ul className={`grid gap-2 ${kids.length > 2 ? "sm:grid-cols-2" : ""}`}>
                          {kids.map((c) => <li key={c.id}>{renderNode(c, "sub")}</li>)}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {openId && byId.get(openId) && (
        <TopicDrawer
          topic={byId.get(openId)!}
          parent={parentOf.get(openId)}
          section={sectionOf.get(openId) ?? ""}
          status={statuses[openId]}
          onStatus={(s) => set(openId, s)}
          onOpen={setOpenId}
          onClose={() => setOpenId(null)}
          prevId={all[all.findIndex((x) => x.id === openId) - 1]?.id}
          nextId={all[all.findIndex((x) => x.id === openId) + 1]?.id}
          titleOf={(id) => byId.get(id)?.title ?? ""}
          statuses={statuses}
          problems={problems}
        />
      )}
    </div>
  );
}

const TYPE_STYLE: Record<ResourceType, string> = {
  article: "bg-indigo-soft text-indigo",
  video: "bg-clay-soft text-clay",
  course: "bg-leaf-soft text-leaf",
  docs: "bg-sand text-ink-2",
  tool: "bg-saffron-soft text-saffron-deep",
};

function TopicDrawer({
  topic, parent, section, status, onStatus, onOpen, onClose, prevId, nextId, titleOf, statuses, problems,
}: {
  topic: Topic; parent?: Topic; section: string; status?: Status; onStatus: (s: Status | null) => void; onOpen: (id: string) => void; onClose: () => void;
  prevId?: string; nextId?: string; titleOf: (id: string) => string; statuses: Statuses; problems: PractiseProblem[];
}) {
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    panelRef.current?.scrollTo({ top: 0 });
  }, [topic.id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.getElementById(`node-${topic.id}`)?.focus();
    };
  }, [onClose, topic.id]);

  const skills = [...topic.skills, ...(parent?.skills ?? [])].map((s) => s.toLowerCase());
  const practise = skills.length
    ? problems.filter((p) => p.skills.some((s) => skills.some((k) => s.toLowerCase().includes(k) || k.includes(s.toLowerCase())))).slice(0, 3)
    : [];
  const buttons: { s: Status; label: string; on: string }[] = [
    { s: "learning", label: t("rm.s_learning"), on: "border-saffron bg-saffron-soft text-ink" },
    { s: "done", label: t("rm.s_done"), on: "border-leaf bg-leaf text-white" },
    { s: "skipped", label: t("rm.s_skip"), on: "border-ink-3 bg-sand text-ink-2" },
  ];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="topic-title">
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-label={t("common.close")} tabIndex={-1} />
      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[480px] md:rounded-none md:rounded-l-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line bg-card/95 px-5 py-3 backdrop-blur">
          <span className="mx-auto h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <button ref={closeRef} type="button" onClick={onClose} className="absolute right-3 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand" aria-label={t("common.close")}>✕</button>
        </div>
        <div className="space-y-6 px-5 pt-4 pb-8 sm:px-7">
          <div>
            <p className="eyebrow">{parent ? `${section} · ${parent.title}` : section}</p>
            <h2 id="topic-title" className="mt-1 text-[26px] leading-tight font-bold">{topic.title}</h2>
            {topic.optional && <span className="chip mt-2 border-dashed">{t("rm.optional")}</span>}
          </div>

          <div>
            <p className="label">{t("rm.status_label")}</p>
            <div className="grid grid-cols-3 gap-2">
              {buttons.map((b) => (
                <button key={b.s} type="button" aria-pressed={status === b.s} onClick={() => onStatus(status === b.s ? null : b.s)}
                  className={`min-h-11 rounded-xl border-2 text-sm font-semibold transition ${status === b.s ? b.on : "border-line bg-card text-ink-2 hover:border-ink-3"}`}>
                  {status === b.s && b.s === "done" ? "✓ " : ""}{b.label}
                </button>
              ))}
            </div>
            {status && <button type="button" className="mt-2 text-sm font-semibold text-ink-3 underline underline-offset-2" onClick={() => onStatus(null)}>{t("rm.reset")}</button>}
          </div>

          <p className="text-[17px] leading-relaxed text-ink-2">{topic.description}</p>

          {(topic.children ?? []).length > 0 && (
            <div>
              <h3 className="mb-2 font-bold">{t("rm.subtopics")}</h3>
              <ul className="space-y-1.5">
                {topic.children!.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => onOpen(c.id)} className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-left text-sm font-semibold hover:border-ink-3">
                      <span className={statuses[c.id] === "skipped" ? "text-ink-3 line-through" : ""}><StatusMark status={statuses[c.id]} />{c.title}</span>
                      <span aria-hidden="true" className="text-ink-3">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-2 flex items-center gap-2 font-bold"><span className="h-2 w-2 rounded-full bg-leaf" aria-hidden="true" />{t("rm.free_resources")}</h3>
            {topic.resources.length === 0 ? (
              <p className="text-sm text-ink-3">{parent ? t("rm.see_parent", { topic: parent.title }) : t("rm.no_resources")}</p>
            ) : (
              <ul className="space-y-2">
                {topic.resources.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2.5">
                      <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase ${TYPE_STYLE[r.type] ?? TYPE_STYLE.article}`}>{t(`rm.type_${r.type}`)}</span>
                      <span className="font-medium underline decoration-line decoration-2 underline-offset-4 group-hover:decoration-saffron">{r.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-saffron-soft p-4">
            <h3 className="font-bold">{t("rm.practise")}</h3>
            {practise.length === 0 ? (
              <p className="mt-1 text-sm text-ink-2">{t("rm.practise_none")} <Link href="/student/problems" className="font-semibold underline">{t("sd.browse")}</Link></p>
            ) : (
              <ul className="mt-2 space-y-2">
                {practise.map((p) => (
                  <li key={p.id}>
                    <Link href={`/student/problems/${p.id}`} className="block rounded-xl bg-card px-3 py-2.5 hover:shadow-sm">
                      <span className="block text-sm font-semibold">{p.title}</span>
                      <span className="text-xs text-ink-3">{p.business}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 border-t border-line pt-4">
            {prevId ? <button type="button" onClick={() => onOpen(prevId)} className="btn-secondary btn-sm min-w-0 flex-1"><span aria-hidden="true">←</span><span className="truncate">{titleOf(prevId)}</span></button> : <span className="flex-1" />}
            {nextId ? <button type="button" onClick={() => onOpen(nextId)} className="btn-primary btn-sm min-w-0 flex-1"><span className="truncate">{titleOf(nextId)}</span><span aria-hidden="true">→</span></button> : <span className="flex-1" />}
          </div>
        </div>
      </div>
    </div>
  );
}
