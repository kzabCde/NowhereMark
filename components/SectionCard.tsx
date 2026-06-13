export function SectionCard({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/40">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {hint && <span className="ml-auto text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
