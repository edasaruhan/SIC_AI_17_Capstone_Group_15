import { fmtMonth, fmtNum } from "../lib/constants.js";

export const AXIS = {
  tick: { fontSize: 11, fill: "#757575", fontFamily: "SamsungOne, Arial, sans-serif" },
  axisLine: { stroke: "#dddddd" },
  tickLine: false,
};
export const GRID = { stroke: "#ededed", vertical: false };

// Tooltip: ay başlığı + her seri için renkli işaret, değer metin renginde
export function ChartTooltip({ active, payload, label, labelFormatter = fmtMonth, rows }) {
  if (!active || !payload?.length) return null;
  const items = rows ? rows(payload) : payload.map((p) => ({ key: p.dataKey, name: p.name, value: p.value, color: p.color }));
  return (
    <div className="min-w-44 rounded-2xl bg-white px-4 py-3 text-xs shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
      <p className="mb-2 font-bold text-ink">{labelFormatter(label)}</p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-2">
            {it.color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />}
            <span className="text-muted">{it.name}</span>
            <span className="ml-auto pl-4 font-bold text-ink tabular">{it.format ? it.format(it.value) : `${fmtNum(it.value)} CZK`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LegendItem({ color, en, tr, line = false }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-2">
      {line ? (
        <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
      ) : (
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      )}
      <span className="font-bold">{en}</span>
      {tr && <span className="text-muted">({tr})</span>}
    </span>
  );
}
