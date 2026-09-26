// Tüm teknik terimler İngilizce + (Türkçe) olarak gösterilir.

export const TRIGGERS = {
  income_increase: {
    en: "Income Increase",
    tr: "Gelir Artışı",
    blurb: "Aylık gelir, müşterinin kendi 6 aylık ortalamasının belirgin şekilde üzerine çıktı.",
    metric: "income",
    tint: "#e3efff",
    accent: "#2a78d6",
  },
  idle_cash_buildup: {
    en: "Idle Cash Buildup",
    tr: "Atıl Bakiye Birikimi",
    blurb: "Bakiye 3 ay üst üste müşterinin kişisel 80. yüzdeliğinin üzerinde kaldı.",
    metric: "balance",
    tint: "#e2f6ee",
    accent: "#1baf7a",
  },
  unusual_spending_increase: {
    en: "Unusual Spending Increase",
    tr: "Olağan Dışı Harcama Artışı",
    blurb: "Aylık harcama, kişisel ortalamasından istatistiksel olarak anlamlı biçimde saptı.",
    metric: "spending",
    tint: "#fdebe2",
    accent: "#eb6834",
  },
  liquidity_pressure: {
    en: "Liquidity Pressure",
    tr: "Likidite Sıkışıklığı",
    blurb: "Bakiye 3 ay üst üste müşterinin kişisel 20. yüzdeliğinin altında seyretti.",
    metric: "balance",
    tint: "#fff3d6",
    accent: "#c98500",
  },
  loan_paid_off: {
    en: "Loan Paid Off",
    tr: "Kredi Kapatıldı",
    blurb: "Düzenli kredi taksiti (UVER) ödemeleri sona erdi.",
    metric: "loan",
    tint: "#e6f4e6",
    accent: "#008300",
  },
  new_recurring_bill: {
    en: "New Recurring Bill",
    tr: "Yeni Düzenli Ödeme",
    blurb: "Hesapta ilk kez düzenli hane/fatura ödemesi (SIPO) görüldü.",
    metric: "household",
    tint: "#ece9fb",
    accent: "#4a3aa7",
  },
  first_overdraft: {
    en: "First Overdraft",
    tr: "İlk Negatif Bakiye",
    blurb: "Hesaba ilk kez negatif bakiye ceza faizi (SANKC. UROK) işlendi.",
    metric: "min_balance",
    tint: "#fbe4e4",
    accent: "#d03b3b",
  },
  pension_income_started: {
    en: "Pension Income Started",
    tr: "Emekli Maaşı Başlangıcı",
    blurb: "Hesaba ilk kez emekli maaşı (DUCHOD) yatırıldı.",
    metric: "pension",
    tint: "#fce8f0",
    accent: "#d55181",
  },
};

export const TRIGGER_ORDER = Object.keys(TRIGGERS);

export const PRODUCTS = {
  ihtiyac_kredisi_taksitlendirme: { en: "Personal Loan / Installments", tr: "İhtiyaç Kredisi / Taksitlendirme" },
  yatirim_urunu_limit_artirimi: { en: "Investment Product / Limit Increase", tr: "Yatırım Ürünü / Limit Artırımı" },
  vadeli_mevduat_fon: { en: "Time Deposit / Fund", tr: "Vadeli Mevduat / Fon" },
  esnek_limit_kredi_guvence: { en: "Flexible Limit / Credit Protection", tr: "Esnek Limit / Kredi Güvence" },
  yeni_kredi_teklifi: { en: "New Loan Offer", tr: "Yeni Kredi Teklifi" },
  esnek_odeme_bildirim_servisi: { en: "Flexible Payment / Alert Service", tr: "Esnek Ödeme / Bildirim Servisi" },
  ek_limit_kredi_guvence: { en: "Extra Limit / Credit Protection", tr: "Ek Limit / Kredi Güvence" },
  emekli_bankaciligi_paketi: { en: "Retirement Banking Package", tr: "Emekli Bankacılığı Paketi" },
};

export const CHANNELS = {
  sms_push: { en: "SMS / Push Notification", tr: "SMS / Anlık Bildirim", rule: "Age (Yaş) < 35" },
  email_casual: { en: "Email — Casual", tr: "Samimi E-posta", rule: "35 ≤ Age (Yaş) < 55" },
  email_formal: { en: "Email — Formal", tr: "Resmî E-posta", rule: "Age (Yaş) ≥ 55" },
};

export const PROVIDERS = {
  OpenAI: { label: "OpenAI", color: "#000000", tint: "#f2f2f2" },
  Groq: { label: "Groq", color: "#f55036", tint: "#fff0ec" },
};

export const CARD_TYPES = {
  classic: { en: "Classic", tr: "Klasik" },
  junior: { en: "Junior", tr: "Genç" },
  gold: { en: "Gold", tr: "Altın" },
};

// Berka kredi durum kodları
export const LOAN_STATUS = {
  A: { en: "Finished · Paid", tr: "Bitti · Sorunsuz ödendi", tone: "good" },
  B: { en: "Finished · Unpaid", tr: "Bitti · Ödenmedi", tone: "critical" },
  C: { en: "Running · On Track", tr: "Devam ediyor · Düzenli", tone: "good" },
  D: { en: "Running · In Debt", tr: "Devam ediyor · Borçlu", tone: "warning" },
};

export const FREQUENCY = {
  "POPLATEK MESICNE": { en: "Monthly Statement", tr: "Aylık Ekstre" },
  "POPLATEK TYDNE": { en: "Weekly Statement", tr: "Haftalık Ekstre" },
  "POPLATEK PO OBRATU": { en: "Statement per Transaction", tr: "İşlem Sonrası Ekstre" },
};

export const SPEND_CATEGORIES = {
  household: { en: "Household Bills", tr: "Hane / Fatura" },
  loan: { en: "Loan Payment", tr: "Kredi Taksiti" },
  insurance: { en: "Insurance", tr: "Sigorta" },
  fees: { en: "Bank Fees", tr: "Banka Ücretleri" },
  card: { en: "Card Payment", tr: "Kartla Ödeme" },
  cash: { en: "Cash Withdrawal", tr: "Nakit Çekim" },
  transfer: { en: "Outgoing Transfer", tr: "Giden Havale" },
};

export const INCOME_CATEGORIES = {
  transfer: { en: "Incoming Transfer", tr: "Gelen Havale / Maaş" },
  pension: { en: "Pension", tr: "Emekli Maaşı" },
  deposit: { en: "Cash Deposit", tr: "Nakit Yatırma" },
  interest: { en: "Interest", tr: "Faiz Geliri" },
};

export const ORDER_TYPES = {
  SIPO: { en: "Household Bill", tr: "Hane / Fatura" },
  UVER: { en: "Loan Payment", tr: "Kredi Taksiti" },
  POJISTNE: { en: "Insurance", tr: "Sigorta" },
  LEASING: { en: "Leasing", tr: "Kiralama" },
};

const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function fmtMonth(ym, withYear = true) {
  const [y, m] = ym.split("-");
  return withYear ? `${TR_MONTHS[Number(m) - 1]} ${y}` : TR_MONTHS[Number(m) - 1];
}

export function fmtMonthShort(ym) {
  const [y, m] = ym.split("-");
  return `${TR_MONTHS[Number(m) - 1]} '${y.slice(2)}`;
}

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
export const fmtNum = (v) => (v == null ? "—" : nf.format(v));
export const fmtMoney = (v) => (v == null ? "—" : `${nf.format(v)} CZK`);

export function fmtCompact(v) {
  const a = Math.abs(v);
  if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (a >= 1_000) return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}

export function monthsBetween(a, b) {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
}
