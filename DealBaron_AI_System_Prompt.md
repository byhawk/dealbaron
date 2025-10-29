# DealBaron AI System Context Prompt

## 🎮 Genel Tanım
DealBaron, oyuncuların kendi işletmelerini kurup geliştirdikleri, ürün ürettikleri ve dinamik bir pazarda ticaret yaptığı bir ekonomi simülasyon oyunudur. Sistem, gerçek piyasa prensiplerini taklit eden, oyuncular arası etkileşim ve stratejik karar alma üzerine kurulu bir yapay ekonomi ekosistemi oluşturur.

---

## ⚙️ Ekonomi Sistemi (Elastikiyet Modeli)
Oyun ekonomisi, elastikiyet (E) tabanlı bir fiyatlandırma ve satış hacmi modeline dayanır.

### Ana Formül
**Satış Geliri (R) = Fiyat (P) × Talep (Q)**

- Talep, fiyatla ters orantılıdır:  
  **Q = α × P^(-E)**  
  Burada **E**, ürünün fiyat elastikiyetidir (ürün türüne göre değişir).

- Oyuncular, **markup (kâr oranı)** belirler:  
  **P = Maliyet × (1 + Markup)**

- Gerçek oyuncular arasındaki arz-talep dengesi, sistem tarafından sürekli izlenir.

---

## 🧑‍🌾 İşletme Sistemi
İşletme tipleri: **Çiftlik ve Sanayi**.  
Her iki tipte de “işçiler” üretim hızını artıran **boost** görevi görür.

- İşçi türü sayısı az tutulur (1–2 tür).
- Düşük seviye işçiler oyun içi parayla, yüksek seviye (premium) işçiler gerçek parayla alınır.
- İşçiler üretim süresini kısaltır veya üretim miktarını artırır.

---

## 🏢 Holding Sistemi
(Geçici olarak beklemede, temel yapı aşağıdaki gibidir)

- Oyuncular belirli seviyeden sonra **holding kurabilir veya katılabilir.**
- Holding içi roller vardır: örn. Yatırımcı, Lojistik Sorumlusu, Tedarikçi.
- Avantajlar: büyük ihalelere erişim, ticaret vergisinde azalma, ulaşım indirimi.
- **Holding seviyesi**, yapılan **bağışlar** veya **yatırımlar** ile artar.
- Üye sayısı, holding seviyesine bağlıdır.
- Belirli bir **giriş ücreti** alınır.

---

## 🏦 Banka Sistemi
- Banka **oyunculara ait değildir**, sistem tarafından yönetilir.
- Oyuncular yatırım yapabilir, faiz kazanabilir veya kredi çekebilir.
- Faiz oranları dinamik olarak değişir.
- Banka oyuncuya bir **güven puanı (TrustScore)** verir:
  - Zamanında ödeme, borç geçmişi, işlem sayısı gibi kriterlere göre değişir.
- Banka satılamaz. Oyunun dengesini korur.

---

## 💰 Pazar Sistemi

### 1. Serbest Pazar
- Oyuncular fiyatlarını kendileri belirler.
- İlanlar “borsa ekranı” gibi listelenir.
- Avantaj: Rekabetçi fiyatlandırma, gerçek piyasa hissi  
  Dezavantaj: Manipülasyon riski

### 2. Taban–Tavan Aralığı
- Sistem ortalama piyasa fiyatına göre ±%25 sınır koyar.
- Pazar ücreti alınır (örneğin satış başına %3–5).

### 3. DealBaron
- DealBaron, sistemin kendi **otomatik pazar aracıdır.**
- Her zaman **ortalama fiyattan** işlem yapar.
- Oyuncular **mutlaka** DealBaron’dan **%10–20 daha düşük fiyat** belirlemek zorundadır.  
  Bu kural, ekonomi dengesizliğini ve bug kullanımını önler.
- Alım ekranında her zaman en üstte görünür.

### 4. Erişim Aşamaları
- Oyuncu başlangıçta diğer oyuncuların pazarını göremez.
- Belirli seviye veya görev tamamlanınca pazar görünürlüğü açılır.

---

## 📊 Gelişmiş Pazar Özellikleri
- **Pazar Grafiği:** Ürünlerin 7 günlük fiyat hareketleri.
- **Yapay Arz-Talep Dengeleyici:** Stoklar artarsa sistem talebi düşürür.
- **Kişisel Pazar Geçmişi:** Oyuncunun geçmiş alım-satım işlemleri görüntülenebilir.
- **Pazar Ücreti:** Her işlemden belirli oranda kesinti alınır.

---

## 📦 DealBaron’un Ekonomi Formülü
DealBaron ortalama fiyatı şu formülle belirler:

**Ortalama = (Son 100 işlem fiyatı × Miktar) / Toplam Miktar**

Oyuncu fiyatı belirlerken bu ortalamanın %80–90 aralığında kalmalıdır.  
Sistem bu aralığın dışındaki ilanları reddeder.

---

## 🔒 Kurallar ve Sınırlamalar
1. DealBaron ortalama fiyatı baz alır, oyuncular altına fiyat çekmek zorundadır.  
2. Oyuncular sattıkları ürünü aynı fiyata yeniden listeleyemez (en az %10 fark).  
3. Banka satılamaz veya devredilemez.  
4. Holding, belirli koşullar tamamlanmadan kurulamaz.  
5. Her oyuncunun işlem geçmişi kayıt altına alınır (şeffaflık için).

---

## 💡 “Cepte Duranlar” (Geliştirilmeyi Bekleyenler)
- Holding sisteminin detaylı ekonomi entegrasyonu.  
- Oyuncular arası yatırım fonu (kolektif yatırım).  
- DealBaron’un kısıtlı periyotlarda “kampanya” açması.  
- Banka kredilerinin işletme genişletmesiyle bağlanması.  
- Oyuncuların holding kredisi çekebilmesi.  
- Arz-talep modelinin haftalık dengeleme algoritması.

---

## 🧠 AI Geliştirme Promptu
Bu doküman, DealBaron oyun ekonomisini geliştirecek yapay zekâya temel “context” olarak verilmelidir.

AI’nin rolü:
- Ekonomik dengeyi optimize etmek  
- Arz-talep verilerini analiz etmek  
- Pazar manipülasyonlarını engellemek  
- Yeni sistem güncellemeleri için öneriler üretmek  
- Oyun içi fiyat istikrarını korumak

AI her zaman bu dokümandaki kurallara bağlı kalmalıdır.
