import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS, ChartTooltip, GRID, LegendItem } from "../components/ChartParts.jsx";
import { ArrowLeftIcon, BankIcon, CardIcon, CheckIcon, CrossIcon, ProviderLogo, SearchIcon, ShuffleIcon, TriggerIcon } from "../components/Icons.jsx";
import {
  CARD_TYPES,
  CHANNELS,
  FREQUENCY,
  INCOME_CATEGORIES,
  LOAN_STATUS,
  ORDER_TYPES,
  SPEND_CATEGORIES,
  TRIGGERS,
  fmtCompact,
  fmtMonth,
  fmtMonthShort,
  fmtMoney,
  fmtNum,
} from "../lib/constants.js";
import { loadAccount, pickRandom } from "../lib/data.js";

const PAD = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14";
const INCOME = "#2a78d6";
const SPEND = "#eb6834";

const RANGES = [
  { value: 0, label: "All (Tümü)" },
  { value: 24, label: "Last 24 Months (Son 24 Ay)" },
  { value: 12, label: "Last 12 Months (Son 12 Ay)" },
];

export default function CustomerPage({ messages, accountId, focusMessage }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(24);

  const accountIds = useMemo(() => new Set(messages.map((m) => m.account_id)), [messages]);
  const accountMessages = useMemo(() => messages.filter((m) => m.account_id === accountId), [messages, accountId]);
  const focus = focusMessage?.account_id === accountId ? focusMessage : accountMessages[0];

  useEffect(() => {
    if (!accountId) return;
    let alive = true;
    setAccount(null);
    setError(null);
    loadAccount(accountId)
      .then((a) => alive && setAccount(a))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [accountId]);

  const goRandom = () => {
    const m = pickRandom(messages, focus?.id);
    window.location.hash = `#/customer/${m.account_id}?m=${m.id}`;
  };

  if (!accountId) {
    return (
      <main className={`${PAD} py-24 text-center`}>
        <p className="font-display text-3xl">Customer Analytics (Müşteri Analizi)</p>
        <p className="mt-3 text-muted">Ana sayfadan bir müşteri seçin veya rastgele bir müşteri açın.</p>
        <div className="mt-8 flex justify-center gap-3">
          <a className="btn-secondary" href="#/">
            <ArrowLeftIcon size={16} /> Campaign Demo
          </a>
          <button className="btn-primary" onClick={goRandom}>
            <ShuffleIcon size={16} /> Random Customer (Rastgele Müşteri)
          </button>
        </div>
      </main>
    );
  }

  const months = account ? (range ? account.months.slice(-range) : account.months) : [];

  return (
    <main>
      <section className={`${PAD} pt-10 pb-8`}>
        <a href="#/" className="inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-ink">
          <ArrowLeftIcon size={16} /> Campaign Demo (Kampanya Demosu)
        </a>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Customer Analytics (Müşteri Analizi)</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">Account #{accountId}</h1>
            {account && (
              <p className="mt-3 text-ink-2">
                {focus && (
                  <>
                    {focus.gender === "F" ? "Kadın" : "Erkek"}, {Math.floor(focus.age)} yaş ·{" "}
                  </>
                )}
                {account.district} ({account.region}) · Müşteri {fmtMonth(account.opened.slice(0, 7))}'den beri
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AccountSearch accountIds={accountIds} messages={messages} />
            <button type="button" className="btn-secondary" onClick={goRandom}>
              <ShuffleIcon size={16} /> Random (Rastgele)
            </button>
          </div>
        </div>
      </section>

      {error && <p className={`${PAD} py-16 text-center text-muted`}>{error}</p>}
      {!error && !account && <Skeleton />}
      {account && (
        <>
          {focus && <FocusBanner msg={focus} />}

          <section className={`${PAD} mt-8`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl">
                Monthly Averages <span className="font-sans text-lg font-normal text-muted">(Aylık Ortalamalar)</span>
              </h2>
              <div role="radiogroup" aria-label="Zaman aralığı" className="inline-flex max-w-full flex-wrap gap-1 self-start rounded-3xl bg-surface p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    role="radio"
                    aria-checked={range === r.value}
                    onClick={() => setRange(r.value)}
                    className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                      range === r.value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <Kpis months={months} />
          </section>

          <section className={`${PAD} mt-6 grid gap-6 xl:grid-cols-12`}>
            <div className="min-w-0 xl:col-span-8">
              <IncomeSpendingChart months={months} markers={accountMessages} focus={focus} />
            </div>
            <div className="min-w-0 xl:col-span-4">
              <ProductsPanel account={account} />
            </div>
          </section>

          <section className={`${PAD} mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0`}>
            <BalanceChart months={months} />
            <BreakdownPanel months={months} />
          </section>

          <section className={`${PAD} mt-6`}>
            <TriggerHistory account={account} highlight={accountMessages.map((m) => m.year_month)} />
          </section>
        </>
      )}
    </main>
  );
}

function Skeleton() {
  return (
    <div className={`${PAD} animate-pulse space-y-6`}>
      <div className="h-24 rounded-3xl bg-surface" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-surface" />
        ))}
      </div>
      <div className="h-96 rounded-3xl bg-surface" />
    </div>
  );
}

function AccountSearch({ accountIds, messages }) {
  const [q, setQ] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const id = Number(q.trim());
    if (!accountIds.has(id)) {
      setErr(true);
      return;
    }
    const m = messages.find((x) => x.account_id === id);
    window.location.hash = `#/customer/${id}?m=${m.id}`;
    setQ("");
  };
  return (
    <form onSubmit={submit} className="relative">
      <label htmlFor="acc-search" className="sr-only">
        Hesap numarası ara
      </label>
      <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
      <input
        id="acc-search"
        inputMode="numeric"
        value={q}
        onChange={(e) => {
          setQ(e.target.value.replace(/\D/g, ""));
          setErr(false);
        }}
        placeholder="Account ID (Hesap No)"
        className={`h-12 w-60 rounded-full bg-surface pr-4 pl-11 text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted focus:ring-2 ${
          err ? "ring-2 ring-critical" : "focus:ring-ink"
        }`}
      />
      {err && <p className="absolute top-full left-4 mt-1 text-xs text-critical">Bu hesap için mesaj yok</p>}
    </form>
  );
}

function FocusBanner({ msg }) {
  const t = TRIGGERS[msg.trigger_type];
  return (
    <section className={PAD}>
      <div className="flex flex-col gap-5 rounded-[28px] p-6 sm:flex-row sm:items-center sm:p-7" style={{ background: t.tint }}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: t.accent }}>
          <TriggerIcon type={msg.trigger_type} size={28} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-2">
            {fmtMonth(msg.year_month)} · {t.en} ({t.tr})
          </p>
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-ink">“{msg.message.replace(/\s+/g, " ").trim()}”</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <ProviderLogo provider={msg.provider} size={22} className={msg.provider === "Groq" ? "text-[#f55036]" : ""} />
          <div className="text-xs leading-tight">
            <p className="font-bold">{msg.provider}</p>
            <p className="font-mono text-muted">{msg.model.replace("openai/", "")}</p>
          </div>
          <span className="ml-2 border-l border-line pl-3 text-xs text-muted">{CHANNELS[msg.channel].en}</span>
        </div>
      </div>
    </section>
  );
}

function avg(arr, fn) {
  return arr.length ? arr.reduce((s, x) => s + fn(x), 0) / arr.length : 0;
}

function Kpis({ months }) {
  const income = avg(months, (m) => m.income);
  const spending = avg(months, (m) => m.spending);
  const balance = avg(months, (m) => m.balance);
  const tx = avg(months, (m) => m.n);
  const savingsRate = income > 0 ? (income - spending) / income : 0;
  const last12 = months.slice(-12);

  const tiles = [
    { en: "Avg. Monthly Income", tr: "Ort. Aylık Gelir", value: fmtMoney(income), trend: last12.map((m) => m.income), color: INCOME },
    { en: "Avg. Monthly Spending", tr: "Ort. Aylık Harcama", value: fmtMoney(spending), trend: last12.map((m) => m.spending), color: SPEND },
    { en: "Avg. Balance", tr: "Ort. Bakiye", value: fmtMoney(balance), trend: last12.map((m) => m.balance), color: INCOME },
    { en: "Net Savings Rate", tr: "Net Birikim Oranı", value: `%${Math.round(savingsRate * 100)}`, note: "(Gelir − Harcama) / Gelir" },
    { en: "Transactions / Month", tr: "Aylık İşlem Sayısı", value: tx.toLocaleString("tr-TR", { maximumFractionDigits: 1 }), note: `${months.length} ay veri` },
  ];

  return (
    <div className="mt-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.en} className="rounded-3xl bg-surface p-5">
          <p className="text-sm font-bold text-ink-2">{t.en}</p>
          <p className="text-xs text-muted">({t.tr})</p>
          <p className="mt-3 font-display text-2xl">{t.value}</p>
          {t.trend ? <Sparkline values={t.trend} color={t.color} /> : <p className="mt-2 text-xs text-muted">{t.note}</p>}
        </div>
      ))}
    </div>
  );
}

// Son 12 ayın mini trendi: geçmiş gri, son ay seri renginde
function Sparkline({ values, color }) {
  if (values.length < 2) return null;
  const w = 120;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / span) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} className="mt-2" aria-hidden="true">
      <path d={d} fill="none" stroke="#b5b5b5" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="#f4f4f4" strokeWidth="2" />
    </svg>
  );
}

function ChartCard({ title, tr, legend, children, footer }) {
  return (
    <div className="card flex h-full flex-col ring-1 ring-black/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg">
          {title} <span className="font-sans text-sm font-normal text-muted">({tr})</span>
        </h3>
        {legend && <div className="flex flex-wrap gap-4">{legend}</div>}
      </div>
      <div className="mt-5 flex flex-1 flex-col">{children}</div>
      {footer}
    </div>
  );
}

function IncomeSpendingChart({ months, markers, focus }) {
  const [showTable, setShowTable] = useState(false);
  const visible = new Set(months.map((m) => m.ym));
  const marks = markers.filter((m) => visible.has(m.year_month));

  return (
    <ChartCard
      title="Income vs Spending"
      tr="Aylık Gelir ve Harcama"
      legend={
        <>
          <LegendItem color={INCOME} en="Income" tr="Gelir" line />
          <LegendItem color={SPEND} en="Spending" tr="Harcama" line />
          {marks.length > 0 && <LegendItem color="#000" en="Trigger" tr="Tetikleyici" line />}
        </>
      }
      footer={
        <div className="mt-4 border-t border-line pt-4">
          <button type="button" onClick={() => setShowTable((v) => !v)} className="text-sm font-bold text-link-dark hover:underline" aria-expanded={showTable}>
            {showTable ? "Hide data table (Tabloyu gizle)" : "Show data table (Veri tablosunu göster)"}
          </button>
          {showTable && <MonthTable months={months} />}
        </div>
      }
    >
      <div className="min-h-[320px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="ym" {...AXIS} tickFormatter={fmtMonthShort} minTickGap={28} />
            <YAxis {...AXIS} axisLine={false} tickFormatter={fmtCompact} width={44} />
            <Tooltip
              cursor={{ stroke: "#bdbdbd", strokeWidth: 1 }}
              content={
                <ChartTooltip
                  rows={(p) => [
                    { key: "i", name: "Income (Gelir)", value: p[0]?.payload.income, color: INCOME },
                    { key: "s", name: "Spending (Harcama)", value: p[0]?.payload.spending, color: SPEND },
                    { key: "n", name: "Net", value: p[0]?.payload.income - p[0]?.payload.spending, format: (v) => `${v > 0 ? "+" : ""}${fmtNum(v)} CZK` },
                  ]}
                />
              }
            />
            {marks.map((m) => (
              <ReferenceLine
                key={m.id}
                x={m.year_month}
                stroke="#000"
                strokeWidth={m.id === focus?.id ? 1.5 : 1}
                strokeOpacity={m.id === focus?.id ? 1 : 0.4}
                label={{ value: TRIGGERS[m.trigger_type].en, position: "insideTopLeft", fontSize: 11, fill: "#000", fontWeight: 700, dy: -16 }}
              />
            ))}
            <Line
              type="linear"
              dataKey="income"
              name="Income"
              stroke={INCOME}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="spending"
              name="Spending"
              stroke={SPEND}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function MonthTable({ months }) {
  return (
    <div className="mt-4 max-h-80 overflow-auto rounded-2xl ring-1 ring-line">
      <table className="w-full text-sm tabular">
        <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-2 font-bold">Month (Ay)</th>
            <th className="px-4 py-2 text-right font-bold">Income (Gelir)</th>
            <th className="px-4 py-2 text-right font-bold">Spending (Harcama)</th>
            <th className="px-4 py-2 text-right font-bold">Balance (Bakiye)</th>
            <th className="px-4 py-2 text-right font-bold">Tx (İşlem)</th>
          </tr>
        </thead>
        <tbody>
          {[...months].reverse().map((m) => (
            <tr key={m.ym} className="border-t border-line">
              <td className="px-4 py-2">{fmtMonth(m.ym)}</td>
              <td className="px-4 py-2 text-right">{fmtNum(m.income)}</td>
              <td className="px-4 py-2 text-right">{fmtNum(m.spending)}</td>
              <td className={`px-4 py-2 text-right ${m.balance < 0 ? "text-critical" : ""}`}>{fmtNum(m.balance)}</td>
              <td className="px-4 py-2 text-right">{m.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BalanceChart({ months }) {
  const hasNegative = months.some((m) => m.min_balance < 0);
  return (
    <ChartCard title="End-of-Month Balance" tr="Ay Sonu Bakiye">
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={months} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INCOME} stopOpacity={0.14} />
                <stop offset="100%" stopColor={INCOME} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="ym" {...AXIS} tickFormatter={fmtMonthShort} minTickGap={28} />
            <YAxis {...AXIS} axisLine={false} tickFormatter={fmtCompact} width={44} />
            <Tooltip
              cursor={{ stroke: "#bdbdbd", strokeWidth: 1 }}
              content={
                <ChartTooltip
                  rows={(p) => [
                    { key: "b", name: "Balance (Bakiye)", value: p[0]?.payload.balance, color: INCOME },
                    { key: "m", name: "Lowest (Ay içi en düşük)", value: p[0]?.payload.min_balance },
                  ]}
                />
              }
            />
            {hasNegative && <ReferenceLine y={0} stroke="#d03b3b" strokeWidth={1} label={{ value: "0", position: "left", fontSize: 11, fill: "#d03b3b" }} />}
            <Area
              type="linear"
              dataKey="balance"
              stroke={INCOME}
              strokeWidth={2}
              fill="url(#balFill)"
              isAnimationActive={false}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {hasNegative && (
        <p className="mt-3 flex items-center gap-2 text-xs text-critical">
          <span className="h-0.5 w-4 rounded-full bg-critical" />
          Bu dönemde bakiye en az bir kez negatife düştü (overdraft).
        </p>
      )}
    </ChartCard>
  );
}

function sumCats(months, key) {
  const totals = {};
  for (const m of months) for (const [k, v] of Object.entries(m[key])) totals[k] = (totals[k] ?? 0) + v;
  return totals;
}

function BreakdownPanel({ months }) {
  const [mode, setMode] = useState("spend");
  const isSpend = mode === "spend";
  const totals = sumCats(months, mode);
  const labels = isSpend ? SPEND_CATEGORIES : INCOME_CATEGORIES;
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  const rows = Object.keys(labels)
    .map((k) => ({ key: k, ...labels[k], avg: (totals[k] ?? 0) / Math.max(months.length, 1), share: total ? (totals[k] ?? 0) / total : 0 }))
    .filter((r) => r.avg > 0)
    .sort((a, b) => b.avg - a.avg);
  const max = rows[0]?.avg ?? 1;
  const color = isSpend ? SPEND : INCOME;

  return (
    <ChartCard
      title={isSpend ? "Spending Breakdown" : "Income Sources"}
      tr={isSpend ? "Harcama Dağılımı" : "Gelir Kaynakları"}
      legend={
        <div className="inline-flex rounded-full bg-surface p-1" role="radiogroup" aria-label="Kırılım türü">
          {[
            { v: "spend", l: "Spending" },
            { v: "inc", l: "Income" },
          ].map((o) => (
            <button
              key={o.v}
              role="radio"
              aria-checked={mode === o.v}
              onClick={() => setMode(o.v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${mode === o.v ? "bg-white shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      }
    >
      <p className="-mt-2 mb-4 text-xs text-muted">Monthly average per category (Kategori başına aylık ortalama)</p>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.key} className="group" title={`${r.en}: ${fmtNum(r.avg)} CZK / ay · %${Math.round(r.share * 100)}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                <b>{r.en}</b> <span className="text-muted">({r.tr})</span>
              </span>
              <span className="shrink-0 tabular">
                <b>{fmtNum(r.avg)}</b> <span className="text-xs text-muted">CZK · %{Math.round(r.share * 100)}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-surface">
              <div
                className="h-full rounded-full transition-[width] duration-500 group-hover:opacity-80"
                style={{ width: `${(r.avg / max) * 100}%`, background: color }}
              />
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-muted">Bu aralıkta işlem yok.</li>}
      </ul>
    </ChartCard>
  );
}

function ProductsPanel({ account }) {
  const card = account.cards[0];
  const cardType = card ? CARD_TYPES[card.type] : null;
  const loan = account.loan;
  const loanStatus = loan ? LOAN_STATUS[loan.status] : null;
  const freq = FREQUENCY[account.frequency];
  const toneColor = { good: "#006300", warning: "#b27600", critical: "#d03b3b" };

  return (
    <div className="card h-full space-y-6 ring-1 ring-black/[0.06]">
      <h3 className="font-display text-lg">
        Products <span className="font-sans text-sm font-normal text-muted">(Ürünler)</span>
      </h3>

      {/* kredi kartı */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            Credit Card <span className="tr">(Kredi Kartı)</span>
          </p>
          <YesNo yes={!!card} />
        </div>
        {card ? (
          <div
            className="relative mt-3 aspect-[1.586] w-full max-w-[300px] overflow-hidden rounded-2xl p-4 text-white"
            style={{
              background:
                card.type === "gold"
                  ? "linear-gradient(135deg,#b8902f,#e6c66b 55%,#a57d22)"
                  : card.type === "junior"
                    ? "linear-gradient(135deg,#1baf7a,#2a78d6)"
                    : "linear-gradient(135deg,#1428a0,#2189ff)",
            }}
          >
            <div className="flex items-start justify-between">
              <BankIcon size={22} />
              <span lang="en" className="text-xs font-bold tracking-widest uppercase">
                {cardType.en}
              </span>
            </div>
            <div className="mt-4 h-7 w-10 rounded-md bg-white/35" />
            <p className="absolute bottom-4 left-4 font-mono text-sm tracking-widest">•••• {String(account.account_id).padStart(4, "0").slice(-4)}</p>
            <p className="absolute right-4 bottom-4 text-[10px] opacity-85">Issued (Veriliş) {card.issued.slice(0, 7)}</p>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-muted">
            <CardIcon size={20} /> Müşteride kredi kartı bulunmuyor — kart kampanyası için potansiyel.
          </div>
        )}
      </div>

      {/* kredi */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            Loan <span className="tr">(Kredi)</span>
          </p>
          <YesNo yes={!!loan} />
        </div>
        {loan ? (
          <div className="mt-3 rounded-2xl bg-surface p-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Amount (Tutar)</dt>
                <dd className="font-bold">{fmtMoney(loan.amount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Monthly (Aylık Taksit)</dt>
                <dd className="font-bold">{fmtMoney(loan.payments)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Term (Vade)</dt>
                <dd className="font-bold">{loan.duration} ay</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Start (Başlangıç)</dt>
                <dd className="font-bold">{fmtMonth(loan.date.slice(0, 7))}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-2 text-xs font-bold" style={{ color: toneColor[loanStatus.tone] }}>
              {loanStatus.tone === "good" ? <CheckIcon size={14} /> : <CrossIcon size={14} />}
              Status (Durum) {loan.status}: {loanStatus.en} ({loanStatus.tr})
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Aktif veya geçmiş kredi kaydı yok.</p>
        )}
      </div>

      {/* düzenli ödemeler */}
      <div>
        <p className="text-sm font-bold">
          Standing Orders <span className="tr">(Düzenli Ödeme Talimatları)</span>
        </p>
        {account.orders.length ? (
          <ul className="mt-2 divide-y divide-line text-sm">
            {account.orders.map((o, i) => {
              const t = ORDER_TYPES[o.k_symbol] ?? { en: "Other Transfer", tr: "Diğer Havale" };
              return (
                <li key={i} className="flex items-center justify-between py-2">
                  <span>
                    {t.en} <span className="text-muted">({t.tr})</span>
                  </span>
                  <span className="font-bold tabular">{fmtMoney(o.amount)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Talimat yok.</p>
        )}
      </div>

      <p className="border-t border-line pt-4 text-xs text-muted">
        {freq?.en} ({freq?.tr}) · {account.users.length > 1 ? `${account.users.length} kullanıcı (sahip + yetkili)` : "Tek kullanıcı"}
      </p>
    </div>
  );
}

function YesNo({ yes }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${yes ? "bg-[#e6f4e6] text-good-text" : "bg-surface text-muted"}`}
    >
      {yes ? <CheckIcon size={12} /> : <CrossIcon size={12} />}
      {yes ? "Yes (Var)" : "No (Yok)"}
    </span>
  );
}

// Hesabın tüm geçmişinde tetiklenen sinyaller: satır = tetikleyici türü, sütun = ay
function TriggerHistory({ account, highlight }) {
  const [hover, setHover] = useState(null);
  const allMonths = account.months.map((m) => m.ym);
  const byType = {};
  for (const t of account.triggers) (byType[t.type] ??= new Map()).set(t.ym, t.confidence);
  const types = Object.keys(TRIGGERS).filter((t) => byType[t]);
  const hl = new Set(highlight);
  const years = allMonths.filter((ym) => ym.endsWith("-01"));

  return (
    <div className="card ring-1 ring-black/[0.06]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-lg">
          Trigger History <span className="font-sans text-sm font-normal text-muted">(Tetikleyici Geçmişi)</span>
        </h3>
        <p className="text-xs text-muted">
          {account.triggers.length} sinyal · Siyah halka = LLM mesajı gönderilen ay
          {hover && (
            <span className="ml-3 font-bold text-ink">
              {fmtMonth(hover.ym)} · {TRIGGERS[hover.type].en} · %{Math.round(hover.conf * 100)}
            </span>
          )}
        </p>
      </div>
      {types.length ? (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[640px]">
            {types.map((type) => (
              <div key={type} className="flex items-center gap-3 py-1.5">
                <span className="flex w-56 shrink-0 items-center gap-2 text-xs">
                  <span style={{ color: TRIGGERS[type].accent }}>
                    <TriggerIcon type={type} size={16} />
                  </span>
                  <b>{TRIGGERS[type].en}</b>
                  <span className="text-muted">{byType[type].size}</span>
                </span>
                <div className="flex flex-1 gap-[2px]">
                  {allMonths.map((ym) => {
                    const conf = byType[type].get(ym);
                    const isMsg = conf != null && hl.has(ym);
                    return (
                      <span
                        key={ym}
                        onMouseEnter={() => conf != null && setHover({ ym, type, conf })}
                        onMouseLeave={() => setHover(null)}
                        title={conf != null ? `${fmtMonth(ym)} · ${TRIGGERS[type].en} · güven %${Math.round(conf * 100)}` : undefined}
                        className={`h-5 flex-1 rounded-[3px] ${isMsg ? "ring-2 ring-ink ring-offset-1" : ""}`}
                        style={{ background: conf != null ? TRIGGERS[type].accent : "#f1f1f1", opacity: conf != null ? 0.35 + conf * 0.65 : 1 }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="relative ml-[236px] h-5">
              {years.map((ym) => (
                <span key={ym} className="absolute top-1 text-[11px] text-muted" style={{ left: `${(allMonths.indexOf(ym) / allMonths.length) * 100}%` }}>
                  {ym.slice(0, 4)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">Bu hesapta kayıtlı tetikleyici yok.</p>
      )}
    </div>
  );
}
