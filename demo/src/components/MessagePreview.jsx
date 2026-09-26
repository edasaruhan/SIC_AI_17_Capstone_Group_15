import { useEffect, useState } from "react";
import { CHANNELS, PRODUCTS, TRIGGERS, fmtMonth } from "../lib/constants.js";
import { BankIcon, MailIcon, PhoneIcon, TriggerIcon } from "./Icons.jsx";

// Mesajlardaki [BANKA_ADI] yer tutucusunu şablon etiketi olarak gösterir
function MessageText({ text }) {
  const parts = text.split(/(\[BANKA_ADI\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p === "[BANKA_ADI]" ? (
          <span
            key={i}
            className="mx-0.5 inline-flex items-center rounded-md bg-samsung/10 px-1.5 py-px align-baseline text-[0.85em] font-bold text-samsung"
            title="Template placeholder (Şablon yer tutucusu)"
          >
            BANKA_ADI
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

// Mesaj değiştiğinde kısa bir "yazıyor" göstergesi — içerik önceden üretilmiştir
function useReveal(key) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 650);
    return () => clearTimeout(t);
  }, [key]);
  return ready;
}

function Typing() {
  return (
    <span className="dot-typing inline-flex gap-1 py-1" aria-label="Mesaj hazırlanıyor">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

function PhoneMockup({ msg, ready }) {
  const trigger = TRIGGERS[msg.trigger_type];
  return (
    <div className="relative mx-auto w-[280px] max-w-full">
      <div className="rounded-[46px] bg-[#111] p-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]">
        <div
          className="relative h-[560px] overflow-hidden rounded-[37px]"
          style={{ background: `linear-gradient(160deg, ${trigger.tint} 0%, #ffffff 55%, ${trigger.tint} 100%)` }}
        >
          {/* punch-hole kamera */}
          <div className="absolute top-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#111]" />
          <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-bold text-ink-2">
            <span>09:41</span>
            <span className="tracking-widest">▂▄▆ ◔</span>
          </div>
          <div className="mt-10 text-center">
            <p className="font-display text-5xl text-ink">09:41</p>
            <p className="mt-1 text-xs text-ink-2">{fmtMonth(msg.year_month)}</p>
          </div>
          <div className="pointer-events-none absolute -right-10 bottom-10 opacity-[0.07]" style={{ color: trigger.accent }}>
            <TriggerIcon type={msg.trigger_type} size={220} />
          </div>
          <div className="relative mx-3 mt-8 rounded-3xl bg-white/90 p-4 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-samsung text-white">
                <BankIcon size={14} />
              </span>
              <span className="text-[11px] font-bold tracking-wide text-ink-2 uppercase">Banka · SMS</span>
              <span className="ml-auto text-[11px] text-muted">şimdi</span>
            </div>
            <div className="mt-2 min-h-12 text-[13.5px] leading-snug text-ink">
              {ready ? (
                <p className="animate-rise whitespace-pre-line">
                  <MessageText text={msg.message} />
                </p>
              ) : (
                <Typing />
              )}
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-ink/70" />
        </div>
      </div>
    </div>
  );
}

function EmailMockup({ msg, ready }) {
  const trigger = TRIGGERS[msg.trigger_type];
  const product = PRODUCTS[msg.suggested_product];
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.3)] ring-1 ring-black/5">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-muted">Gelen Kutusu (Inbox)</span>
      </div>
      <div className="relative px-6 pt-5 pb-7 sm:px-8">
        <div className="pointer-events-none absolute top-4 right-4 opacity-[0.08]" style={{ color: trigger.accent }}>
          <TriggerIcon type={msg.trigger_type} size={120} />
        </div>
        <p className="relative pr-16 font-display text-lg leading-snug sm:text-xl">Size özel: {product?.tr}</p>
        <div className="relative mt-4 flex items-center gap-3 border-b border-line pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-samsung text-white">
            <BankIcon size={18} />
          </span>
          <div className="min-w-0 text-xs leading-relaxed">
            <p className="truncate">
              <span className="font-bold text-ink">[BANKA_ADI]</span> <span className="text-muted">&lt;kampanya@banka.com.tr&gt;</span>
            </p>
            <p className="truncate text-muted">Kime (To): Müşteri · Hesap #{msg.account_id}</p>
          </div>
        </div>
        <div className="relative mt-5 min-h-28 text-[15px] leading-relaxed text-ink-2">
          {ready ? (
            <p className="animate-rise whitespace-pre-line">
              <MessageText text={msg.message.trim()} />
            </p>
          ) : (
            <span className="text-muted">
              <Typing />
            </span>
          )}
        </div>
        <div className="relative mt-6">
          <span className="inline-flex rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white">Detayları İncele</span>
        </div>
      </div>
    </div>
  );
}

export default function MessagePreview({ msg }) {
  const ready = useReveal(msg.id);
  const channel = CHANNELS[msg.channel];
  const isSms = msg.channel === "sms_push";
  const chars = msg.message.length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold ring-1 ring-black/10">
          {isSms ? <PhoneIcon size={16} /> : <MailIcon size={16} />}
          {channel.en}
          <span className="tr">({channel.tr})</span>
        </span>
        <span className="text-xs text-muted tabular">
          {chars} karakter{isSms ? " · SMS limit (sınırı) 160" : ""}
        </span>
      </div>
      {isSms ? <PhoneMockup msg={msg} ready={ready} /> : <EmailMockup msg={msg} ready={ready} />}
    </div>
  );
}
