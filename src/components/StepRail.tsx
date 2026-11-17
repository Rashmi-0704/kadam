export function StepRail({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="flex min-w-0 flex-1 items-center gap-2" aria-current={i === current ? "step" : undefined}>
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i < current ? "bg-success-ink text-white" : i === current ? "bg-primary text-white" : "bg-mist text-ink-3"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={`truncate text-xs font-semibold sm:text-sm ${i === current ? "text-ink" : "text-ink-3"} ${i === current ? "" : "hidden sm:inline"}`}>{s}</span>
          {i < steps.length - 1 && <span className="h-px min-w-3 flex-1 bg-line" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
