import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TRIGGERS, fmtCompact, fmtMonthShort, fmtNum } from "../lib/constants.js";
import { baselineBefore, evidenceWindow } from "../lib/data.js";
import { AXIS, ChartTooltip, GRID } from "./ChartParts.jsx";

const METRIC_LABEL = {
  income: { en: "Monthly Income", tr: "Aylık Gelir" },
  spending: { en: "Monthly Spending", tr: "Aylık Harcama" },
  balance: { en: "End-of-Month Balance", tr: "Ay Sonu Bakiye" },
  min_balance: { en: "Lowest Balance in Month", tr: "Ay İçi En Düşük Bakiye" },
  loan: { en: "Loan Payments", tr: "Kredi Taksit Ödemeleri" },
  household: { en: "Household Bill Payments", tr: "Hane / Fatura Ödemeleri" },
  pension: { en: "Pension Deposits", tr: "Emekli Maaşı Yatışları" },
};

function percentile(values, p) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}

// Tetikleyicinin kendi mantığına göre referans çizgisi
function referenceFor(account, msg, metric, data) {
  const t = msg.trigger_type;
  if (t === "unusual_spending_increase" || t === "income_increase") {
    const v = baselineBefore(account, msg.year_month, metric);
    return v == null ? null : { y: v, label: "6-mo avg (6 ay ort.)" };
  }
  if (t === "idle_cash_buildup" || t === "liquidity_pressure") {
    const prior = data.filter((d) => !d.isTrigger && !d.isAfter).map((d) => d.value);
    const v = percentile(prior, t === "idle_cash_buildup" ? 0.8 : 0.2);
    return v == null ? null : { y: v, label: t === "idle_cash_buildup" ? "P80 (80. yüzdelik)" : "P20 (20. yüzdelik)" };
  }
  if (t === "first_overdraft") return { y: 0, label: "0 CZK" };
  return null;
}

export default function EvidenceChart({ account, msg }) {
  const trigger = TRIGGERS[msg.trigger_type];
  const metric = trigger.metric;
  const data = evidenceWindow(account, msg.year_month, metric);
  if (!data.length) return <p className="text-sm text-muted">Bu ay için işlem verisi yok.</p>;

  const ref = referenceFor(account, msg, metric, data);
  const label = METRIC_LABEL[metric];
  const triggerIdx = data.findIndex((d) => d.isTrigger);

  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-sm font-bold">
          {label.en} <span className="tr">({label.tr})</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: trigger.accent }} />
            Trigger month (Tetikleyici ayı)
          </span>
          {ref && (
            <span className="flex items-center gap-2">
              <span className="h-px w-4 bg-ink-2" />
              {ref.label}
            </span>
          )}
        </span>
      </figcaption>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%">
            <CartesianGrid {...GRID} />
            <XAxis dataKey="ym" {...AXIS} tickFormatter={fmtMonthShort} interval="preserveStartEnd" minTickGap={16} />
            <YAxis {...AXIS} axisLine={false} tickFormatter={fmtCompact} width={40} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={
                <ChartTooltip
                  rows={(p) => [{ key: "v", name: `${label.en}`, value: p[0].value, color: p[0].payload.isTrigger ? trigger.accent : "#bdbdbd" }]}
                />
              }
            />
            {ref && <ReferenceLine y={ref.y} stroke="#313131" strokeWidth={1} ifOverflow="extendDomain" />}
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.ym} fill={d.isTrigger ? trigger.accent : d.isAfter ? "#e4e4e4" : "#c4c4c4"} />
              ))}
              <LabelList
                dataKey="value"
                content={({ x, y, width, value, index }) =>
                  index === triggerIdx ? (
                    <text x={x + width / 2} y={value < 0 ? y + 14 : y - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#000">
                      {fmtCompact(value)}
                    </text>
                  ) : null
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {label.tr}: {data.map((d) => `${d.ym} ${fmtNum(d.value)} CZK`).join(", ")}
      </p>
    </figure>
  );
}
