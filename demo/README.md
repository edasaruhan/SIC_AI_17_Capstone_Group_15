# Event-Triggered Marketing — Demo Arayüzü

React + Tailwind + Recharts ile yazılmış, Samsung Innovation Campus görsel diliyle (SamsungOne / SamsungSharpSans) hazırlanmış demo.

## Çalıştırma

```bash
cd demo
npm install
npm run setup   # veri paketini (public/data) üretir + Samsung fontlarını indirir
npm run dev     # http://localhost:5173
```

`npm run data` → `scripts/build_demo_data.py` çalışır. Girdi olarak `data/marketing_messages_full.csv`, `data/trigger_table_final.csv` ve ham Berka tabloları (`trans.csv`, `account.csv`, `card.csv`, `disp.csv`, `loan.csv`, `order.csv`, `district.csv`) gerekir.

## Sayfalar

- **Campaign Demo (Kampanya Demosu)** — tetikleyici türü seç, sağlayıcı/kanal filtrele, rastgele müşteri getir. Mesaj, kanalına göre telefon (SMS) veya e-posta görünümünde; üreten model logosuyla birlikte gösterilir. "Why this trigger?" grafiği tetikleyici ayını müşterinin kendi geçmişiyle karşılaştırır.
- **Customer Analytics (Müşteri Analizi)** — aylık ortalamalar, gelir/harcama trendi, bakiye, harcama/gelir kırılımı, kredi kartı / kredi / düzenli ödeme talimatları, tüm tetikleyici geçmişi.

## Sunum ipuçları

- `#/?m=<id>` belirli bir mesajı doğrudan açar (id: `public/data/messages.json` içindeki `id`).
- `#/customer/<hesap_no>` belirli bir müşterinin analiz sayfasını açar.
- Tutarlar veri setinin orijinal para birimi olan Çek korunası (CZK) cinsindendir.
