# DealBaron Game Design Document

## 1. Genel Konsept
DealBaron, oyuncuların kendi ticaret imparatorluklarını kurduğu, arz-talep dengesine ve dinamik fiyatlandırmaya dayalı bir ekonomi oyundur. Oyun, oyuncuların kendi dükkanlarını kurduğu, mallarını ürettiği veya ithal ettiği, diğer oyuncularla veya NPC’lerle ticaret yaptığı bir serbest piyasa simülasyonudur.

---

## 2. Ana Sistemler

### 2.1. Ekonomi Sistemi
- **Model:** Elastikiyet (E) tabanlı fiyatlandırma.
- **Mantık:** Ürünlerin fiyatı, oyuncuların belirlediği *markup* oranı ve ürünün arz-talep durumu ile şekillenir.
- **Talep Fonksiyonu:**
  ```
  Qd = a - bP
  ```
  Burada:
  - `Qd`: Talep edilen miktar  
  - `P`: Fiyat  
  - `a, b`: Ürün bazlı katsayılar (ürünün popülerliğini ve fiyat duyarlılığını belirler)
- **Fiyat Güncelleme Formülü:**
  ```
  NewPrice = BasePrice * (1 + Markup%) * ElasticityFactor
  ```
  ElasticityFactor, arz ve talep oranına göre otomatik ayarlanır.

### 2.2. Ürün Sistemi
- Ürünlerin birim hacim ve depo kapasitesi mantığı kabul edilmiştir.
- Her ürün:
  - **BasePrice** (temel fiyat)
  - **Volume** (hacim)
  - **Category** (ürün türü)
  - **Rarity** (nadirlik seviyesi)
  - **ElasticityFactor** (fiyat esnekliği) değerlerine sahiptir.

---

## 3. Oyuncu İlerlemesi

### 3.1. Başlangıç Aşaması
- Oyuncu oyuna başladığında **pazar erişimi kapalıdır.**
- Sadece kendi üretim ve satış alanında faaliyet gösterebilir.
- Belirli başarımlar veya seviyelerle pazar açılır.

### 3.2. Pazar Sistemi (Market Unlock)
- Oyuncu belirli bir **devir**, **ciro**, veya **itibar** seviyesine ulaştığında, diğer oyuncuların pazarlarını görebilir hale gelir.
- Bu sistem, oyuncuların erken aşamada kendi ekonomik stratejilerini geliştirmesini ve sonradan rekabete hazırlanmasını sağlar.

### 3.3. Banka Sistemi (Beklemede)
- Banka sistemi şu anda devre dışıdır (cepte duruyor).  
- Planlanan özellikler:
  - Kredi çekme (faizli veya faizsiz)
  - Depo genişletme kredileri
  - Ürün ipoteği
  - Faiz oranlarının piyasa koşullarına göre değişmesi

---

## 4. UI/UX ve Görsel Hiyerarşi

### 4.1. Alım Ekranı
- **DealBaron logosu veya barı** her zaman **ekranın en üstünde** yer alacak.
- Ana görünümde:
  - Ürün listesi (sol panel)
  - Ürün detayları (sağ panel)
  - En üstte DealBaron barı (statü, bakiye, kısa yollar)

### 4.2. Kullanıcı Akışı
1. Oyuncu dükkanına girer.
2. Stok durumunu kontrol eder.
3. Fiyatları *markup* ile ayarlar.
4. Ürünleri satışa sunar veya üretim başlatır.
5. İlerledikçe pazar görünürlüğü açılır ve yeni fırsatlar belirir.

---

## 5. Karar Durumları

### 5.1. Kesinleşenler
✅ Elastikiyet tabanlı ekonomi modeli  
✅ Ürünlerin hacim ve depo kapasitesi sistemi  
✅ Oyuncunun *markup* belirleme özgürlüğü  
✅ Banka sistemi “beklemede” (şimdilik pasif)  
✅ DealBaron barının alım ekranında en üstte olması

### 5.2. Beklemede Olanlar
🕓 Banka sisteminin aktifleşme zamanı  
🕓 Oyuncular arası doğrudan ticaret (P2P exchange)  
🕓 NPC ekonomisi ve fiyat dengeleme sistemi  
🕓 Üretim hatlarında otomasyon ve verimlilik puanları

---

## 6. Formüller & Hesaplama Mantıkları

### 6.1. Fiyat Hesaplama
```
FinalPrice = BasePrice * (1 + Markup%) * (1 ± ElasticityFactor * MarketPressure)
```
- `Markup%`: Oyuncunun belirlediği kâr oranı.
- `ElasticityFactor`: Ürünün fiyat değişimine duyarlılığı.
- `MarketPressure`: Arz fazlası veya talep patlaması katsayısı.

### 6.2. Depo Kapasitesi
```
TotalVolume = Σ(ProductVolume × Quantity)
FreeSpace = WarehouseCapacity - TotalVolume
```

### 6.3. Talep Güncellemesi
```
Demand = BaseDemand * (1 - Price / OptimalPrice) * TrendFactor
```
TrendFactor, oyuncu davranışları ve sezonluk olaylarla değişir.

---

## 7. Gelecek Planları
- Oyuncular arası **takas sistemi** (P2P barter)
- **Global Event** mekanikleri (enflasyon, kıtlık, vergi dalgalanması)
- **Guild/Corporation** sistemi (birlik kurma, kaynak paylaşımı)
- **Dinamik market haberleri**: Oyunculara fiyat dalgalanmalarıyla ilgili ipuçları

---

## 8. Sonuç
DealBaron’un temeli, oyuncuların stratejik düşünme ve ekonomik karar alma becerilerini ölçen bir piyasa simülasyonuna dayanır. Ekonomi tamamen oyuncuların kararlarına ve davranışlarına göre şekillenir. Banka, pazar ve üretim sistemleri modüler olarak ilerleyecek, böylece oyun hem teknik hem stratejik olarak genişletilebilir bir yapıda kalacaktır.

