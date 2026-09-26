# Olay Tetiklemeli Kişiselleştirilmiş Bankacılık Pazarlama Asistanı

**Samsung Innovation Campus — AI in Marketing Capstone Projesi**

Statik müşteri segmentasyonu yerine, davranışsal değişim sinyallerini gerçek zamanlı tespit edip her müşteriye kişiselleştirilmiş, LLM ile üretilmiş pazarlama mesajı sunan bir sistem.

🔗 **[Canlı Demo](https://sic-ai-17-capstone-group-15.vercel.app/#/)**

---

## İçindekiler

- [Problem](#problem)
- [Yaklaşım](#yaklaşım)
- [Mimari](#mimari)
- [Veri Seti](#veri-seti)
- [Tetikleyiciler](#tetikleyiciler)
- [Öne Çıkan Bulgu](#öne-çıkan-bulgu)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Bilinen Sınırlamalar](#bilinen-sınırlamalar)

---

## Problem

Bankalar pazarlama iletişimini büyük ölçüde statik segmentler üzerinden yürütüyor — "25-35 yaş, X gelir grubu" gibi kalıcı özelliklere göre oluşturulan listelere toplu kampanya gönderiliyor. Bu yaklaşımın iki temel sorunu var:

- **Zamanlama sorunu:** Doğru teklif, yanlış zamanda değersizleşiyor.
- **İlgisizlik:** Alakasız mesajlar dönüşüm oranını düşürüyor, müşteri deneyimini zedeliyor.

## Yaklaşım

Müşterinin **davranışında meydana gelen değişim**, ihtiyacının değiştiğine dair en güçlü sinyaldir. Bu projede, statik segmentasyon yerine **olay tetiklemeli (event-triggered)** bir pazarlama yaklaşımı benimsendi: sistem, her müşterinin **kendi geçmişine göre** anormal bir davranış tespit ettiğinde, o davranışa uygun ürünü ve tonu seçip kişiselleştirilmiş bir mesaj üretiyor.

## Mimari

**1. Sinyal katmanı** — Ham işlem verisini hesap × ay bazında özetleyip üç farklı tetikleyici mekanizması uygular:

- _Sayısal sapma:_ Kişisel z-skor (hesabın kendi geçmiş ortalama/std'sine göre)
- _Kalıcı durum:_ Bakiye persentili + sürdürülebilirlik şartı (3 ay üst üste)
- _Kategorik olay:_ İşlem amacı kodlarında (k_symbol) ilk-görülme/kesilme tespiti

**2. Karar katmanı** — 18 yaş altı hesapları (çocuk/gençlik hesapları) etik gerekçeyle dışlar, hesap-ay başına en yüksek güven skorlu tek tetikleyiciyi seçer, ürün önerisi olmayan (risk sinyali) tetikleyicileri sessizce eler.

**3. İçerik katmanı** — Her tetikleyici tipi için tanımlanmış ton/açı/kanal rehberliğiyle LLM'e (OpenAI GPT-4o-mini ve Groq gpt-oss-120b) prompt gönderip kişiselleştirilmiş mesaj üretir. Halüsinasyon riskine karşı (uydurma faiz oranı vb.) katı kısıtlar içerir.

**4. Demo** — React + Vite + Tailwind ile, tetikleyici tipine göre filtrelenip örnek gösterilen interaktif bir arayüz.

## Veri Seti

**[Berka / PKDD'99 Financial Dataset](https://data.world/lpetrocelli/czech-financial-dataset-real-anonymized-transactions)** — bir Çek bankasından anonimleştirilmiş, gerçek finansal veri (1993-1998).

| Tablo      | İçerik              |
| ---------- | ------------------- |
| `account`  | 4.500 hesap         |
| `client`   | 5.369 müşteri       |
| `trans`    | 1.056.320 işlem     |
| `loan`     | 682 kredi kaydı     |
| `card`     | 892 kredi kartı     |
| `district` | 77 ilçe demografisi |

Klasik "Bank Marketing" (UCI) veri setinin aksine, bu set **zaman damgalı işlem geçmişi** içerdiği için davranışsal tetikleyici tespitine uygundur.

## Tetikleyiciler

| Tetikleyici            | Sinyal                             | Önerilen Ürün               |
| ---------------------- | ---------------------------------- | --------------------------- |
| Harcama artışı/azalışı | Kişisel z-skor sapması             | İhtiyaç kredisi / —         |
| Gelir artışı/azalışı   | Kişisel z-skor sapması             | Yatırım ürünü / —           |
| Atıl bakiye birikimi   | 3 ay üst üste yüksek persentil     | Vadeli mevduat / fon        |
| Likidite sıkışıklığı   | 3 ay üst üste düşük persentil      | Esnek limit / kredi güvence |
| Yeni düzenli ödeme     | k_symbol ilk görülme (SIPO)        | Ödeme takip servisi         |
| Kredi kapatma          | k_symbol kesilme (UVER)            | Yeni kredi teklifi          |
| İlk negatif bakiye     | k_symbol ilk görülme (SANKC. UROK) | Ek limit / kredi güvence    |
| Emeklilik başlangıcı   | k_symbol ilk görülme (DUCHOD)      | Emekli bankacılığı paketi   |

## Öne Çıkan Bulgu

Kredi alımı öncesi ve sonrası dönemler karşılaştırıldığında, sekiz tetikleyiciden yedisinin kredi öncesiyle özel bir ilişkisi bulunmadı — ancak **"yeni düzenli ödeme yükümlülüğü" tetikleyicisi, kredi alımından önceki 6 ayda genel sıklığının ~4.2 katı** oranında görülüyor. Bu, sistemin bazı durumlarda finansal ihtiyacı önceden sezebildiğine dair sınırlı ama somut bir kanıt sunuyor.

## Teknoloji Yığını

- **Veri işleme:** Python, pandas, numpy, scipy
- **İçerik üretimi:** OpenAI API (gpt-4o-mini), Groq API (gpt-oss-120b)
- **Demo arayüzü:** React, Vite, Tailwind CSS
- **Versiyon kontrolü:** Git / GitHub
- **Deploy:** Vercel

## Proje Yapısı

├── data/ # Ham Berka tabloları + üretilen çıktılar (gitignore'lu, istisnalar hariç)
│ ├── trigger_table_final.csv # Sinyal katmanının nihai çıktısı
│ └── marketing_messages_full.csv # İçerik katmanının nihai çıktısı
├── eda.ipynb # Sinyal katmanı: veri işleme, tetikleyici tespiti
├── marketing.ipynb # İçerik katmanı: LLM prompt tasarımı, mesaj üretimi
├── constants.py # Tetikleyici-ürün-ton eşleştirmeleri
├── scripts/
│ └── build_demo_data.py # Nihai CSV'yi demo için JSON'a çevirir
├── demo/ # React + Vite demo uygulaması
│ ├── src/
│ └── public/data/ # Demo'nun okuduğu statik JSON
└── requirements.txt

## Kurulum

```bash
# 1) Sanal ortam
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2) Berka veri setini indirip data/ altına yerleştirin
# (bkz. data/README veya yorum satırları)

# 3) .env dosyası oluşturun
echo "OPENAI_API_KEY=sk-..." >> .env
echo "GROQ_API_KEY=gsk_..." >> .env

# 4) Notebook'ları sırasıyla çalıştırın
# eda.ipynb → marketing.ipynb

# 5) Demo verisini üretin ve arayüzü başlatın
python scripts/build_demo_data.py
cd demo
npm install
npm run dev
```

## Bilinen Sınırlamalar

- Kısa kanal (SMS/push) mesajlarında, karakter kısıtı nedeniyle LLM bazen benzer kalıplara yakınsayabiliyor.
- Kişiye özel faiz oranı ataması basit bir kural setine dayanır, gerçek bir kredi skorlama modeli değildir.
- Veri seti 1993-1998 dönemine ait olduğu için, demo'daki "güncel" tetikleyiciler o dönemin son ayına göre belirlenmiştir.
- Samsung kurumsal fontları lisans nedeniyle repoya dahil edilmemiştir; canlı demo sistem yedek fontuyla görüntülenir.

---

_Samsung Innovation Campus — AI in Marketing programı kapsamında geliştirilmiştir._

Arda Palas
