let messagesPromise = null;
const accountCache = new Map();

export function loadMessages() {
  if (!messagesPromise) {
    messagesPromise = fetch("/data/messages.json").then((r) => {
      if (!r.ok) throw new Error("messages.json bulunamadı — önce `npm run data` çalıştırın.");
      return r.json();
    });
  }
  return messagesPromise;
}

export function loadAccount(id) {
  if (!accountCache.has(id)) {
    accountCache.set(
      id,
      fetch(`/data/accounts/${id}.json`).then((r) => {
        if (!r.ok) throw new Error(`Hesap #${id} bulunamadı.`);
        return r.json();
      }),
    );
  }
  return accountCache.get(id);
}

// Tetikleyiciyi açıklayan metrik serisi: tetikleyici ayı ve öncesindeki 12 ay (+ varsa sonraki 2 ay)
export function metricValue(month, metric) {
  switch (metric) {
    case "loan":
      return month.spend.loan ?? 0;
    case "household":
      return month.spend.household ?? 0;
    case "pension":
      return month.inc.pension ?? 0;
    default:
      return month[metric];
  }
}

export function evidenceWindow(account, ym, metric, before = 12, after = 2) {
  const idx = account.months.findIndex((m) => m.ym === ym);
  if (idx === -1) return [];
  const slice = account.months.slice(Math.max(0, idx - before), idx + after + 1);
  return slice.map((m) => ({ ym: m.ym, value: metricValue(m, metric), isTrigger: m.ym === ym, isAfter: m.ym > ym }));
}

// Notebook'taki baseline tanımı: tetikleyici ayından önceki 6 ayın ortalaması
export function baselineBefore(account, ym, metric, window = 6) {
  const idx = account.months.findIndex((m) => m.ym === ym);
  const prev = account.months.slice(Math.max(0, idx - window), idx);
  if (!prev.length) return null;
  return prev.reduce((s, m) => s + metricValue(m, metric), 0) / prev.length;
}

export function pickRandom(list, excludeId) {
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  let item;
  do {
    item = list[Math.floor(Math.random() * list.length)];
  } while (item.id === excludeId);
  return item;
}
