import { useEffect, useMemo, useState } from "react";
import EvidenceChart from "../components/EvidenceChart.jsx";
import MessagePreview from "../components/MessagePreview.jsx";
import {
  ArrowRightIcon,
  BankIcon,
  CardIcon,
  CheckIcon,
  CrossIcon,
  InfoIcon,
  ProviderLogo,
  ShuffleIcon,
  SparkIcon,
  TriggerIcon,
  UserIcon,
} from "../components/Icons.jsx";
import { CARD_TYPES, CHANNELS, LOAN_STATUS, PRODUCTS, PROVIDERS, TRIGGERS, TRIGGER_ORDER, fmtMonth, fmtNum } from "../lib/constants.js";
import { loadAccount, pickRandom } from "../lib/data.js";

const PAD = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14";

export default function CampaignPage({ messages, state, setState }) {
  const { trigger, provider, channel, current } = state;

  const countsByTrigger = useMemo(() => {
    const c = {};
    for (const m of messages) c[m.trigger_type] = (c[m.trigger_type] ?? 0) + 1;
    return c;
  }, [messages]);

  const byTrigger = useMemo(() => messages.filter((m) => m.trigger_type === trigger), [messages, trigger]);
  const pool = useMemo(
    () => byTrigger.filter((m) => (provider === "all" || m.provider === provider) && (channel === "all" || m.channel === channel)),
    [byTrigger, provider, channel],
  );

  // Filtre değişip mevcut müşteri havuzda kalmadıysa yeni bir rastgele müşteri getir
  useEffect(() => {
    // Güncel state üzerinden karar ver: derin bağlantıyla gelen seçim ezilmesin
    setState((s) => {
      if (s.trigger !== trigger || (s.current && pool.some((m) => m.id === s.current.id))) return s;
      const next = pickRandom(pool);
      return next?.id === s.current?.id ? s : { ...s, current: next };
    });
  }, [pool, trigger, setState]);

  const shuffle = () => setState((s) => ({ ...s, current: pickRandom(pool, s.current?.id) }));

  return (
    <main>
      <Hero messages={messages} />

      <section className={`${PAD} pt-4`} aria-labelledby="step-1">
        <StepTitle id="step-1" n="01" en="Select Trigger Type" tr="Tetikleyici Türü Seç" />
        <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {TRIGGER_ORDER.map((key) => (
            <TriggerCard
              key={key}
              type={key}
              count={countsByTrigger[key] ?? 0}
              selected={key === trigger}
              onSelect={() => setState((s) => ({ ...s, trigger: key, provider: "all", channel: "all", current: null }))}
            />
          ))}
        </div>
      </section>

      <section className={`${PAD} mt-14`} aria-labelledby="step-2">
        <StepTitle id="step-2" n="02" en="Filter & Pick a Customer" tr="Filtrele ve Müşteri Getir" />
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Segmented
              label="LLM Provider (Sağlayıcı)"
              value={provider}
              onChange={(v) => setState((s) => ({ ...s, provider: v }))}
              options={[
                { value: "all", label: "All (Tümü)", count: byTrigger.length },
                ...Object.keys(PROVIDERS).map((p) => ({
                  value: p,
                  label: p,
                  icon: <ProviderLogo provider={p} size={16} />,
                  count: byTrigger.filter((m) => m.provider === p).length,
                })),
              ]}
            />
            <Segmented
              label="Channel (Kanal)"
              value={channel}
              onChange={(v) => setState((s) => ({ ...s, channel: v }))}
              options={[
                { value: "all", label: "All (Tümü)" },
                { value: "sms_push", label: "SMS" },
                { value: "email_casual", label: "Email · Casual" },
                { value: "email_formal", label: "Email · Formal" },
              ]}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm leading-tight text-muted tabular">
              <b className="text-ink">{fmtNum(pool.length)}</b> in pool
              <br />
              (havuzda)
            </span>
            <button type="button" className="btn-primary" onClick={shuffle} disabled={pool.length < 2}>
              <ShuffleIcon size={18} />
              Random Customer <span className="hidden font-normal opacity-70 sm:inline">(Rastgele Müşteri)</span>
            </button>
          </div>
        </div>
      </section>

      <section className={`${PAD} mt-10`} aria-live="polite">
        {current ? (
          <ResultPanel key={current.id} msg={current} onShuffle={shuffle} canShuffle={pool.length > 1} />
        ) : (
          <div className="rounded-[32px] bg-surface px-6 py-20 text-center">
            <p className="font-display text-2xl">Bu filtrede mesaj yok</p>
            <p className="mt-2 text-muted">Farklı bir sağlayıcı veya kanal seçin.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function Hero({ messages }) {
  const stats = useMemo(() => {
    const accounts = new Set(messages.map((m) => m.account_id)).size;
    const models = new Set(messages.map((m) => m.model)).size;
    return [
      { v: fmtNum(messages.length), en: "Messages", tr: "Mesaj" },
      { v: fmtNum(accounts), en: "Customers", tr: "Müşteri" },
      { v: Object.keys(TRIGGERS).length, en: "Trigger Types", tr: "Tetikleyici Türü" },
      { v: models, en: "LLM Models", tr: "Dil Modeli" },
    ];
  }, [messages]);

  return (
    <section className={`${PAD} grid gap-10 pt-12 pb-12 sm:pt-16 lg:grid-cols-12`}>
      <div className="lg:col-span-7">
        <p className="eyebrow">Capstone Demo · Berka Financial Dataset</p>
        <h1 className="mt-4 font-display text-[40px] leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          Event-Triggered
          <br />
          Marketing
        </h1>
        <p className="mt-3 font-display text-xl text-muted sm:text-2xl">(Olay Tetiklemeli Pazarlama)</p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
          Her müşterinin aylık davranışını <b className="text-ink">kendi geçmişiyle</b> karşılaştırıyoruz. Anlamlı bir değişim yakaladığımızda bu bir{" "}
          <b className="text-ink">trigger (tetikleyici)</b> olur ve LLM, müşterinin yaşına uygun kanalda kişiye özel bir pazarlama mesajı yazar.
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.en} className="flex flex-col justify-between">
              <dt className="text-sm font-bold text-ink-2">
                {s.en} <span className="tr">({s.tr})</span>
              </dt>
              <dd className="mt-1 font-display text-4xl sm:text-5xl">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <HowItWorks />
    </section>
  );
}

const HOW_STEPS = [
  { en: "Monthly Panel", tr: "Aylık Panel", text: "1M+ işlem, hesap × ay bazında gelir, harcama ve bakiyeye özetlenir." },
  { en: "Personal Baseline", tr: "Kişisel Referans", text: "Sabit eşik yok: her müşteri kendi 6–12 aylık geçmişiyle kıyaslanır (z-score, percentile)." },
  { en: "Trigger", tr: "Tetikleyici", text: "Anlamlı sapma veya ilk kez görülen davranış bir olay olarak işaretlenir, güven skoru atanır." },
  { en: "LLM Message", tr: "LLM Mesajı", text: "Ürün, ton ve yaşa göre kanal (SMS / e-posta) seçilir; GPT-4o-mini veya Groq mesajı yazar." },
];

function HowItWorks() {
  return (
    <aside className="self-end rounded-[32px] bg-surface p-6 sm:p-8 lg:col-span-5">
      <p className="font-display text-lg">
        How It Works <span className="font-sans text-sm font-normal text-muted">(Nasıl Çalışır)</span>
      </p>
      <ol className="mt-6 space-y-0">
        {HOW_STEPS.map((s, i) => (
          <li key={s.en} className="relative flex gap-4 pb-6 last:pb-0">
            {i < HOW_STEPS.length - 1 && <span className="absolute top-9 bottom-1 left-[17px] w-px bg-line" />}
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm ${i === 3 ? "bg-ink text-white" : "bg-white text-ink"}`}
            >
              {i === 3 ? <SparkIcon size={16} /> : i + 1}
            </span>
            <div className="pt-1.5">
              <p className="text-sm font-bold">
                {s.en} <span className="tr">({s.tr})</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function StepTitle({ id, n, en, tr }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-display text-sm text-muted">{n}</span>
      <h2 id={id} className="font-display text-2xl sm:text-3xl">
        {en} <span className="font-sans text-lg font-normal text-muted sm:text-xl">({tr})</span>
      </h2>
    </div>
  );
}

function TriggerCard({ type, count, selected, onSelect }) {
  const t = TRIGGERS[type];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex min-h-[148px] flex-col overflow-hidden rounded-3xl p-5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
        selected ? "bg-ink text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]" : "bg-surface text-ink hover:bg-[#ebebeb]"
      }`}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors"
        style={{ background: selected ? "rgba(255,255,255,0.14)" : t.tint, color: selected ? "#fff" : t.accent }}
      >
        <TriggerIcon type={type} size={22} />
      </span>
      <span className="mt-auto pt-5 text-[15px] leading-tight font-bold">{t.en}</span>
      <span className={`mt-0.5 text-sm ${selected ? "text-white/65" : "text-muted"}`}>({t.tr})</span>
      <span className={`absolute top-5 right-5 text-xs font-bold tabular ${selected ? "text-white/80" : "text-muted"}`}>{fmtNum(count)}</span>
    </button>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-2 text-xs font-bold text-muted">{label}</p>
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-3xl bg-surface p-1">
        {options.map((o) => {
          const active = o.value === value;
          const disabled = o.count === 0;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-link ${
                active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              {o.icon}
              {o.label}
              {o.count != null && <span className="text-xs font-normal text-muted tabular">{fmtNum(o.count)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function evidenceSummary(msg) {
  const e = msg.evidence;
  if (e.zscore != null) {
    const z = e.zscore;
    const what = msg.trigger_type === "income_increase" ? "Gelir" : "Harcama";
    return {
      key: "Z-Score (Z-Skoru)",
      value: `${z > 0 ? "+" : ""}${z.toLocaleString("tr-TR")}σ`,
      text: `${what}, müşterinin kişisel 6 aylık ortalamasının ${Math.abs(z).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} standart sapma ${z > 0 ? "üzerinde" : "altında"}.`,
    };
  }
  if (e.balance_percentile != null) {
    const p = Math.round(e.balance_percentile * 100);
    return {
      key: "Balance Percentile (Bakiye Yüzdeliği)",
      value: `%${p}`,
      text:
        msg.trigger_type === "idle_cash_buildup"
          ? `Bakiye, son 12 ayın %${p}'sinden yüksek ve 3 aydır bu seviyede.`
          : `Bakiye, son 12 ayın yalnızca %${p}'sinden yüksek; 3 aydır düşük seyrediyor.`,
    };
  }
  if (e.event) {
    return {
      key: `Event (Olay) · ${e.k_symbol}`,
      value: e.event === "onset" ? "Onset (İlk Görülme)" : "Cessation (Kesilme)",
      text: TRIGGERS[msg.trigger_type].blurb,
    };
  }
  return null;
}

function ResultPanel({ msg, onShuffle, canShuffle }) {
  const [account, setAccount] = useState(null);
  const trigger = TRIGGERS[msg.trigger_type];
  const product = PRODUCTS[msg.suggested_product];
  const channel = CHANNELS[msg.channel];
  const ev = evidenceSummary(msg);

  useEffect(() => {
    let alive = true;
    loadAccount(msg.account_id).then((a) => alive && setAccount(a));
    return () => {
      alive = false;
    };
  }, [msg.account_id]);

  const pipeline = [
    { en: "Signal", tr: "Sinyal", value: ev?.value ?? "—" },
    { en: "Trigger", tr: "Tetikleyici", value: trigger.en },
    { en: "Product", tr: "Ürün", value: product?.en },
    { en: "LLM", tr: "Dil Modeli", value: msg.model.replace("openai/", "") },
    { en: "Channel", tr: "Kanal", value: channel.en },
  ];

  return (
    <div className="animate-rise overflow-hidden rounded-[32px] bg-surface">
      {/* başlık */}
      <div className="flex flex-col gap-4 px-6 pt-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-9">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: trigger.tint, color: trigger.accent }}>
            <TriggerIcon type={msg.trigger_type} size={28} />
          </span>
          <div>
            <p className="eyebrow">
              {trigger.en} ({trigger.tr})
            </p>
            <p className="mt-1 font-display text-2xl sm:text-3xl">
              Account (Hesap) #{msg.account_id}
              <span className="ml-3 font-sans text-base font-normal text-muted">{fmtMonth(msg.year_month)}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={onShuffle} disabled={!canShuffle}>
            <ShuffleIcon size={16} /> Next (Sonraki)
          </button>
          <a className="btn-primary" href={`#/customer/${msg.account_id}?m=${msg.id}`}>
            Customer Analytics <span className="hidden font-normal opacity-70 sm:inline">(Müşteri Analizi)</span>
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </div>

      {msg.is_supplemental && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-ink-2 sm:mx-10">
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-link-dark" />
          <span>
            <b>Supplemental sample (Ek örnek):</b> Bu tetikleyici çeşitliliği göstermek için geçmiş veriden seçildi; güncel/aktif bir sinyal değildir.
          </span>
        </div>
      )}

      {/* akış şeridi */}
      <ol className="mx-6 mt-7 grid grid-cols-2 gap-2 sm:mx-10 md:grid-cols-5" aria-label="Mesaj üretim akışı">
        {pipeline.map((p, i) => (
          <li key={p.en} className="relative rounded-2xl bg-white px-4 py-3">
            <p className="text-[11px] font-bold text-muted">
              {i + 1}. {p.en} <span className="font-normal">({p.tr})</span>
            </p>
            <p className="mt-1 truncate text-sm font-bold" title={p.value}>
              {p.value}
            </p>
            {i < pipeline.length - 1 && (
              <ArrowRightIcon size={14} className="absolute top-1/2 -right-[11px] z-10 hidden -translate-y-1/2 rounded-full bg-surface text-muted md:block" />
            )}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 px-6 pt-8 pb-8 sm:px-10 sm:pb-10 lg:grid-cols-12">
        {/* mesaj önizleme */}
        <div className="min-w-0 lg:col-span-5">
          <MessagePreview msg={msg} />
          <ModelCard msg={msg} />
        </div>

        {/* müşteri + kanıt */}
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <ProfileCard msg={msg} account={account} />
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Why this trigger? (Neden bu tetikleyici?)</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">{ev?.text}</p>
              </div>
              <ConfidenceMeter value={msg.confidence} />
            </div>
            <div className="mt-6">
              {account ? <EvidenceChart account={account} msg={msg} /> : <div className="h-[230px] animate-pulse rounded-2xl bg-surface" />}
            </div>
            <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <Fact label={ev?.key ?? "Evidence (Kanıt)"} value={ev?.value} />
              <Fact label="Suggested Product (Önerilen Ürün)" value={product?.en} sub={product?.tr} />
              <Fact
                label="Offer Rate (Teklif Faizi)"
                value={msg.offer_rate != null ? `%${msg.offer_rate.toLocaleString("tr-TR")} / ay` : "—"}
                sub={msg.offer_rate != null ? "Risk ve gelir segmentine göre" : "Kredi dışı ürün"}
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, sub }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-bold">{value ?? "—"}</dd>
      {sub && <dd className="text-xs text-muted">{sub}</dd>}
    </div>
  );
}

function ConfidenceMeter({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="w-52">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">Confidence (Güven Skoru)</span>
        <span className="font-display text-xl">%{pct}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-[#e3efff]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Güven skoru"
      >
        <div className="h-full rounded-full bg-link" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ModelCard({ msg }) {
  const isGroq = msg.provider === "Groq";
  return (
    <div className="card mt-6 flex items-center gap-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: isGroq ? "#f55036" : "#000", color: "#fff" }}>
        <ProviderLogo provider={msg.provider} size={30} />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <SparkIcon size={12} /> Generated by (Üreten Model)
        </p>
        <p className="mt-0.5 font-display text-xl">{msg.provider}</p>
        <p className="truncate font-mono text-xs text-ink-2">{msg.model}</p>
      </div>
      <div className="ml-auto hidden text-right text-xs text-muted sm:block">
        {isGroq ? "Groq LPU Inference" : "OpenAI API"}
        <br />
        temperature 0.95
      </div>
    </div>
  );
}

function ProfileCard({ msg, account }) {
  const card = msg.has_card ? CARD_TYPES[msg.card_type] : null;
  const loan = msg.has_loan ? LOAN_STATUS[msg.loan_status] : null;
  const users = account?.users ?? [];
  const facts = [
    { label: "Age (Yaş)", value: Math.floor(msg.age) },
    { label: "Gender (Cinsiyet)", value: msg.gender === "F" ? "Kadın" : "Erkek" },
    { label: "District (Bölge)", value: msg.district },
    { label: "Regional Avg. Salary (Bölge Ort. Maaş)", value: `${fmtNum(msg.avg_salary)} CZK` },
    { label: "Customer Since (Müşteri Süresi)", value: `${msg.account_age_months} ay` },
    { label: "Account Users (Hesap Kullanıcısı)", value: users.length ? `${users.length} kişi` : "—" },
  ];

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
          <UserIcon size={20} />
        </span>
        <p className="eyebrow">Customer Profile (Müşteri Profili)</p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-muted">{f.label}</dt>
            <dd className="mt-0.5 truncate text-[15px] font-bold">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <OwnershipTile icon={<CardIcon size={20} />} en="Credit Card" tr="Kredi Kartı" has={!!card} detail={card ? `${card.en} (${card.tr})` : "Kartı yok"} />
        <OwnershipTile
          icon={<BankIcon size={20} />}
          en="Loan"
          tr="Kredi"
          has={!!loan}
          detail={loan ? `${loan.en} (${loan.tr})` : "Kredisi yok"}
          tone={loan?.tone}
        />
      </div>
    </div>
  );
}

function OwnershipTile({ icon, en, tr, has, detail, tone }) {
  const toneColor = tone === "critical" ? "#d03b3b" : tone === "warning" ? "#b27600" : "#006300";
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold">
          {en} <span className="tr">({tr})</span>
        </p>
        <p className="truncate text-xs text-muted">{detail}</p>
      </div>
      <span
        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: has ? `${toneColor}1a` : "#e8e8e8", color: has ? toneColor : "#757575" }}
        aria-label={has ? "Var" : "Yok"}
      >
        {has ? <CheckIcon size={14} /> : <CrossIcon size={14} />}
      </span>
    </div>
  );
}
