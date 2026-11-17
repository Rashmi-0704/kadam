"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { setTopicStatus } from "@/app/actions/student";
import { useT } from "@/lib/i18n/client";
import type { Section, Topic, Resource, ResourceType, TopicLevel } from "@/db/roadmaps-data";

type Status = "done" | "learning" | "skipped";
type Statuses = Record<string, Status>;
export type PractiseProblem = { id: string; title: string; business: string; skills: string[] };

const flat = (sections: Section[]) => sections.flatMap((s) => s.topics.flatMap((t) => [t, ...(t.children ?? [])]));

// Kept local (not imported from roadmaps-data) so the roadmap data isn't bundled into the client.
const levelOf = (x: Pick<Topic, "level" | "optional">): TopicLevel => x.level ?? (x.optional ? "optional" : "recommended");

const LEVEL_TEXT: Record<TopicLevel, { label: string; hint: string }> = {
  recommended: { label: "Recommended", hint: "Learn these, roughly in this order." },
  optional: { label: "Optional", hint: "Useful extra. Learn it anytime, or skip it." },
  alternative: { label: "Alternative", hint: "Pick this or the option just before it." },
};

function nodeClass(status: Status | undefined, kind: "topic" | "sub", level: TopicLevel) {
  const base = "relative w-full rounded-xl text-left font-semibold transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 select-none";
  const size = kind === "topic" ? "min-h-12 px-4 py-2.5 text-[15px]" : "min-h-10 px-3 py-2 text-sm";
  const border = level === "optional" ? "border-2 border-dashed" : level === "alternative" ? "border-4 border-double" : "border-2";
  if (status === "done") return `${base} ${size} ${border} border-success bg-success-ink text-white`;
  if (status === "learning") return `${base} ${size} ${border} border-primary bg-primary-soft text-ink`;
  if (status === "skipped") return `${base} ${size} ${border} border-line bg-mist text-ink-3 line-through decoration-2`;
  return kind === "topic"
    ? `${base} ${size} ${border} border-ink bg-card text-ink shadow-[0_3px_0_0_var(--color-ink)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0`
    : `${base} ${size} ${border} ${level === "recommended" ? "border-ink-3/60" : "border-ink-3"} bg-card text-ink-2 hover:border-ink`;
}

/** Small corner mark for non-recommended nodes, so the level doesn't rely on border style alone. */
function LevelMark({ level }: { level: TopicLevel }) {
  if (level === "recommended") return null;
  return (
    <span aria-hidden="true" className={`absolute -top-2.5 -right-2 rounded-full border-2 px-1.5 text-[10px] leading-4 font-extrabold tracking-wide uppercase ${level === "alternative" ? "border-highlight bg-highlight-soft text-highlight-deep" : "border-line-deep bg-card text-ink-2"}`}>
      {level === "alternative" ? "⇄ alt" : "opt"}
    </span>
  );
}

function StatusMark({ status }: { status?: Status }) {
  if (status === "done") return <span aria-hidden="true" className="mr-1.5">✓</span>;
  if (status === "learning") return <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary align-middle motion-safe:animate-pulse" />;
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

  const renderNode = (x: Topic, kind: "topic" | "sub") => {
    const level = levelOf(x);
    const st = statuses[x.id];
    return (
      <button
        type="button"
        id={`node-${x.id}`}
        onClick={(e) => onNode(e, x.id)}
        onContextMenu={(e) => onContext(e, x.id)}
        className={nodeClass(st, kind, level)}
        aria-label={`${x.title}${st ? ` — ${t(`rm.s_${st}`)}` : ""}${level !== "recommended" ? ` (${LEVEL_TEXT[level].label})` : ""}${x.time ? `, about ${x.time}` : ""}`}
      >
        <LevelMark level={level} />
        <span className="block">
          <StatusMark status={st} />
          {x.title}
        </span>
        {kind === "topic" && x.time && (
          <span className={`mt-0.5 block text-xs font-medium ${st === "done" ? "text-white" : "text-ink-3"}`}>{x.time}</span>
        )}
      </button>
    );
  };

  let topicIndex = 0;
  return (
    <div>
      {/* Progress */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-2xl font-bold">{t("rm.pct", { n: pct })}</p>
          <p className="text-sm text-ink-2">
            <span className="font-semibold text-success-ink">{t("rm.n_done", { n: done })}</span> · <span className="font-semibold text-primary-deep">{t("rm.n_learning", { n: learning })}</span> · {t("rm.n_skipped", { n: skipped })} · {t("rm.n_total", { n: total })}
          </p>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span className="h-full bg-success-ink transition-all" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
          <span className="h-full bg-ink-3/60 transition-all" style={{ width: `${(skipped / Math.max(1, total)) * 100}%` }} />
          <span className="h-full bg-primary transition-all" style={{ width: `${(learning / Math.max(1, total)) * 100}%` }} />
        </div>
      </div>

      {/* Legend */}
      <div className="mb-8 space-y-3 text-xs text-ink-2">
        <ul className="flex flex-wrap items-start gap-x-6 gap-y-2" aria-label="What the borders mean">
          {(["recommended", "optional", "alternative"] as const).map((lv) => (
            <li key={lv} className="flex items-center gap-2">
              <span aria-hidden="true" className={`h-5 w-8 shrink-0 rounded-md bg-card ${lv === "optional" ? "border-2 border-dashed border-ink" : lv === "alternative" ? "border-4 border-double border-ink" : "border-2 border-ink"}`} />
              <span><span className="font-bold text-ink">{LEVEL_TEXT[lv].label}</span> <span className="text-ink-3">· {LEVEL_TEXT[lv].hint}</span></span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded bg-success-ink" />{t("rm.s_done")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded border-2 border-primary bg-primary-soft" />{t("rm.s_learning")}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-4 w-6 rounded bg-mist" />{t("rm.s_skipped")}</span>
        <span className="hidden text-ink-3 lg:inline">{t("rm.tip")}</span>
        <span className="text-ink-3 lg:hidden">{t("rm.tip_touch")}</span>
        </div>
      </div>

      {/* Tree */}
      <div className="relative pb-6">
        <span className="absolute top-0 bottom-0 left-[11px] w-1 rounded-full bg-ink md:left-1/2 md:-ml-0.5" aria-hidden="true" />
        {sections.map((sec) => (
          <section key={sec.title} className="relative mb-6" aria-label={sec.title}>
            <h2 className="relative z-10 mb-5 ml-8 inline-block rounded-full bg-ink px-4 py-1.5 font-display text-sm font-bold text-canvas md:left-1/2 md:ml-0 md:-translate-x-1/2">{sec.title}</h2>
            <ul className="space-y-5">
              {sec.topics.map((tp) => {
                const side = topicIndex++ % 2 === 0 ? "right" : "left";
                const kids = tp.children ?? [];
                return (
                  <li key={tp.id} className="relative grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_15rem_1fr] md:gap-0">
                    <span className="absolute top-6 left-[7px] z-10 h-3 w-3 rounded-full border-2 border-ink bg-canvas md:hidden" aria-hidden="true" />
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
  course: "bg-success-soft text-success-ink",
  video: "bg-alert-soft text-alert",
  article: "bg-info-soft text-primary-deep",
  docs: "bg-mist text-ink-2",
  tool: "bg-primary-soft text-primary-deep",
};
/** Display order of resource groups. */
const TYPE_ORDER: ResourceType[] = ["course", "video", "article", "docs", "tool"];

function ResourceList({ resources }: { resources: Resource[] }) {
  const t = useT();
  const groups = TYPE_ORDER.map((ty) => ({ ty, list: resources.filter((r) => (r.type ?? "article") === ty) })).filter((g) => g.list.length);
  const other = resources.filter((r) => !TYPE_ORDER.includes(r.type));
  if (other.length) groups.push({ ty: "article", list: other });
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.ty}>
          <p className="mb-1.5 text-xs font-bold tracking-wide text-ink-3 uppercase">{t(`rm.type_${g.ty}`)}</p>
          <ul className="space-y-2">
            {g.list.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2.5 rounded-xl border-2 border-line bg-card px-3 py-2.5 transition hover:border-ink-3 motion-reduce:transition-none">
                  <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase ${TYPE_STYLE[r.type] ?? TYPE_STYLE.article}`}>{t(`rm.type_${r.type}`)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium underline decoration-line-deep decoration-2 underline-offset-4 group-hover:decoration-primary">{r.title}</span>
                    {r.search && <span className="mt-0.5 block text-xs text-ink-3">Search results for “{r.search}”</span>}
                  </span>
                  <span className="mt-0.5 shrink-0 rounded-full border border-success px-1.5 text-[10px] leading-4 font-bold text-success-ink uppercase">Free</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

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

  const level = levelOf(topic);
  const skills = [...topic.skills, ...(parent?.skills ?? [])].map((s) => s.toLowerCase());
  const practise = skills.length
    ? problems.filter((p) => p.skills.some((s) => skills.some((k) => s.toLowerCase().includes(k) || k.includes(s.toLowerCase())))).slice(0, 3)
    : [];
  // Sub-topics inherit the parent's problem types when they have none of their own.
  const types = [...new Set(topic.problemTypes?.length ? topic.problemTypes : (parent?.problemTypes ?? []))];
  const why = topic.why;
  const buttons: { s: Status; label: string; on: string }[] = [
    { s: "learning", label: t("rm.s_learning"), on: "border-primary bg-primary-soft text-ink" },
    { s: "done", label: t("rm.s_done"), on: "border-success bg-success-ink text-white" },
    { s: "skipped", label: t("rm.s_skip"), on: "border-ink-3 bg-mist text-ink-2" },
  ];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="topic-title">
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-label={t("common.close")} tabIndex={-1} />
      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-card shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[500px] md:rounded-none md:rounded-l-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line bg-card/95 px-5 py-3 backdrop-blur">
          <span className="mx-auto h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <button ref={closeRef} type="button" onClick={onClose} className="absolute right-3 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist" aria-label={t("common.close")}>✕</button>
        </div>
        <div className="space-y-6 px-5 pt-4 pb-8 sm:px-7">
          <div>
            <p className="eyebrow">{parent ? `${section} · ${parent.title}` : section}</p>
            <h2 id="topic-title" className="mt-1 text-[26px] leading-tight font-bold">{topic.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`chip ${level === "optional" ? "border-dashed border-ink-3 bg-card" : level === "alternative" ? "border-highlight bg-highlight-soft text-highlight-deep" : "border-primary bg-primary-soft text-primary-deep"}`}>
                {level === "alternative" ? "⇄ " : ""}{LEVEL_TEXT[level].label}
              </span>
              {topic.time && <span className="chip"><span aria-hidden="true">⏱</span> About {topic.time}</span>}
            </div>
            {level !== "recommended" && <p className="mt-2 text-sm text-ink-3">{LEVEL_TEXT[level].hint}</p>}
          </div>

          <div>
            <p className="label">{t("rm.status_label")}</p>
            <div className="grid grid-cols-3 gap-2">
              {buttons.map((b) => (
                <button key={b.s} type="button" aria-pressed={status === b.s} onClick={() => onStatus(status === b.s ? null : b.s)}
                  className={`min-h-11 rounded-xl border-2 text-sm font-semibold transition motion-reduce:transition-none ${status === b.s ? b.on : "border-line bg-card text-ink-2 hover:border-ink-3"}`}>
                  {status === b.s && b.s === "done" ? "✓ " : ""}{b.label}
                </button>
              ))}
            </div>
            {status && <button type="button" className="mt-2 text-sm font-semibold text-ink-3 underline underline-offset-2" onClick={() => onStatus(null)}>{t("rm.reset")}</button>}
          </div>

          <p className="text-[17px] leading-relaxed text-ink-2">{topic.description}</p>

          {why && (
            <div className="rounded-2xl border-2 border-primary/30 bg-primary-soft p-4">
              <h3 className="text-sm font-bold text-primary-deep">Why it matters</h3>
              <p className="mt-1 text-ink-2">{why}</p>
            </div>
          )}

          {(topic.children ?? []).length > 0 && (
            <div>
              <h3 className="mb-2 font-bold">{t("rm.subtopics")}</h3>
              <ul className="space-y-1.5">
                {topic.children!.map((c) => {
                  const cl = levelOf(c);
                  return (
                    <li key={c.id}>
                      <button type="button" onClick={() => onOpen(c.id)} className={`flex w-full items-center justify-between gap-2 rounded-xl border-2 bg-canvas px-3 py-2.5 text-left text-sm font-semibold hover:border-ink-3 ${cl === "optional" ? "border-dashed border-line-deep" : cl === "alternative" ? "border-double border-line-deep" : "border-line"}`}>
                        <span className={statuses[c.id] === "skipped" ? "text-ink-3 line-through" : ""}>
                          <StatusMark status={statuses[c.id]} />{c.title}
                          {cl !== "recommended" && <span className="ml-1.5 text-xs font-medium text-ink-3">({LEVEL_TEXT[cl].label.toLowerCase()})</span>}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-ink-3">{c.time}<span aria-hidden="true">→</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-bold"><span className="h-2 w-2 rounded-full bg-success-ink" aria-hidden="true" />{t("rm.free_resources")}</h3>
            {topic.resources.length === 0 ? (
              <p className="text-sm text-ink-3">{parent ? t("rm.see_parent", { topic: parent.title }) : t("rm.no_resources")}</p>
            ) : (
              <ResourceList resources={topic.resources} />
            )}
          </div>

          {topic.practice && (
            <div className="rounded-2xl border-2 border-highlight bg-highlight-soft p-4">
              <h3 className="text-sm font-bold text-highlight-deep">Try this</h3>
              <p className="mt-1 text-ink">{topic.practice}</p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-line bg-canvas p-4">
            <h3 className="font-bold">{t("rm.practise")}</h3>
            {types.length > 0 && (
              <>
                <p className="mt-1 text-sm text-ink-2">Kadam problems of these types build this skill:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {types.map((ty) => (
                    <li key={ty}>
                      <Link href={`/student/problems?tab=all&type=${encodeURIComponent(ty)}`} className="chip border-primary bg-card text-primary-deep hover:bg-primary-soft">
                        {t(`ptype.${ty}`)} <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {practise.length === 0 ? (
              <p className="mt-3 text-sm text-ink-2">{t("rm.practise_none")} <Link href="/student/problems" className="font-semibold underline">{t("sd.browse")}</Link></p>
            ) : (
              <ul className="mt-3 space-y-2">
                {practise.map((p) => (
                  <li key={p.id}>
                    <Link href={`/student/problems/${p.id}`} className="block rounded-xl border-2 border-line bg-card px-3 py-2.5 hover:border-ink-3">
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
