interface Entry { name?: string | number; value?: number | string; color?: string }
export function ChartTooltip({ active, payload, label, unit = "%" }: { active?: boolean; payload?: Entry[]; label?: string | number; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-[#0E1432]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur">
      {label !== undefined && <p className="mb-1 font-semibold text-slate-900">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
            <span className="font-semibold tabular-nums text-slate-900">{p.value}{unit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
