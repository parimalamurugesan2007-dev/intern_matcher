import type { TooltipProps } from 'recharts';

// Shared glassmorphic tooltip for all Recharts charts.
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-semibold text-white">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 text-slate-300">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
