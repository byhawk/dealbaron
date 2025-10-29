# DealBaron Admin Panel Specification

## Genel Bakış

Admin paneli, oyun içi tüm parametreleri, içerikleri ve ayarları yönetmek için kullanılacak web tabanlı bir kontrol panelidir.

**Teknoloji:** React.js + Ant Design (veya Vue.js + Element UI)
**Erişim:** Sadece admin rolüne sahip kullanıcılar
**URL:** `https://admin.dealbaron.com`

---

## 1. Ürün Yönetimi

### 1.1 Ürün Listesi
- Tüm ürünleri tablo formatında görüntüleme
- Filtreleme: Kategori, nadirlik, durum
- Arama: İsim, ID
- Sıralama: İsim, fiyat, kategori, oluşturma tarihi
- Toplu işlemler: Aktif/pasif yapma, silme

### 1.2 Ürün Ekleme/Düzenleme
**Temel Bilgiler:**
- İsim (TR)
- İsim (EN)
- Açıklama (TR)
- Açıklama (EN)
- Kategori (Dropdown: agriculture, industry, luxury)
- Nadirlik (Dropdown: common, uncommon, rare, epic, legendary)

**Görsel:**
- Ürün görseli upload (PNG/JPG, max 2MB)
- İkon (opsiyonel, emoji YOK, sadece görsel)
- Önizleme

**Ekonomik Parametreler:**
- Base Price (₺)
- Volume (birim hacim)
- Elasticity Factor (0.01 - 2.0)
- Demand Coefficient A (taban talep)
- Demand Coefficient B (fiyat duyarlılığı)

**Üretim:**
- Production Time (saniye)
- Üretim tipi (Farm/Industry)
- Gerekli hammaddeler (opsiyonel)

**Durum:**
- Aktif/Pasif toggle
- Market'te görünür mü?

---

## 2. Oyun Parametreleri Yönetimi

### 2.1 Ekonomi Ayarları
**Global Ekonomi:**
- Market fee (% - varsayılan: 5)
- Listing fee (% - varsayılan: 0)
- Update listing fee (% - varsayılan: 2)
- DealBaron price min percentage (% - varsayılan: 80)
- DealBaron price max percentage (% - varsayılan: 90)

**Ekonomi Güncelleme:**
- Update interval (dakika - varsayılan: 5)
- Inflation target (% - varsayılan: 5)
- Price volatility limit (% - varsayılan: 30)

### 2.2 Oyuncu İlerleme Ayarları
**Seviye Sistemi:**
- XP multiplier (varsayılan: 1.0)
- Level up formula katsayıları
- Max level (varsayılan: 100)

**Pazar Erişimi:**
- Required level (varsayılan: 5)
- Required transactions (varsayılan: 10)
- Required revenue (varsayılan: 10000)
- Required days active (varsayılan: 3)

**Başlangıç Değerleri:**
- Starting balance (varsayılan: 1000)
- Starting warehouse capacity (varsayılan: 1000)
- Starting trust score (varsayılan: 100)

### 2.3 Üretim ve İşçi Ayarları
**Tick Süreleri:**
- Production tick interval (saniye - varsayılan: 60)
- Market update interval (saniye - varsayılan: 300)
- Warehouse sync interval (saniye - varsayılan: 30)

**İşçi Parametreleri:**
- Basic worker cost (varsayılan: 1000)
- Basic worker boost (varsayılan: 1.2)
- Advanced worker cost (varsayılan: 5000)
- Advanced worker boost (varsayılan: 1.5)
- Premium worker cost (gerçek para)
- Premium worker boost (varsayılan: 2.0)
- Premium worker duration (gün - varsayılan: 30)

---

## 3. Oyuncu Yönetimi

### 3.1 Oyuncu Listesi
- Tüm oyuncuları görüntüleme
- Filtreleme: Seviye, durum, kayıt tarihi
- Arama: Username, email, ID
- Detaylı görünüm

### 3.2 Oyuncu Detayları
**Bilgiler:**
- Username, email, ID
- Bakiye, seviye, XP
- Trust score
- Kayıt tarihi, son giriş
- İşletmeler
- İşlem geçmişi

**İşlemler:**
- Bakiye ekleme/çıkarma (manuel müdahale)
- XP ekleme
- Ban/Unban
- Trust score düzenleme
- Notlar ekleme

---

## 4. Market Yönetimi

### 4.1 Aktif İlanlar
- Tüm aktif ilanları görüntüleme
- Şüpheli ilanları işaretleme
- İlan silme (admin müdahalesi)
- Fiyat manipülasyon tespiti

### 4.2 İşlem Geçmişi
- Tüm işlemleri görüntüleme
- Filtreleme: Tarih, ürün, oyuncu, tip
- İstatistikler: Günlük hacim, ortalama fiyat
- Export (CSV, Excel)

---

## 5. İstatistikler & Analytics

### 5.1 Dashboard
**Genel İstatistikler:**
- Toplam oyuncu sayısı
- Aktif oyuncu (son 24 saat)
- Günlük işlem hacmi
- Günlük ciro

**Grafik:**
- Oyuncu büyümesi (30 gün)
- İşlem hacmi (7 gün)
- Popüler ürünler (top 10)
- Fiyat hareketleri

### 5.2 Ekonomi Sağlığı
**Metrikler:**
- Günlük enflasyon oranı
- Gini katsayısı (zenginlik eşitsizliği)
- Pazar likidite oranı
- Ortalama fiyat volatilite

**Uyarılar:**
- Enflasyon hedefini aştı mı?
- Fiyat manipülasyonu tespit edildi mi?
- Sistem anomalisi

---

## 6. Bildirim Yönetimi

### 6.1 Push Notification Gönderme
**Kitle Seçimi:**
- Tüm oyuncular
- Seviye bazlı (örn: Level 10+)
- Aktif oyuncular (son 7 gün)
- Özel oyuncu listesi

**İçerik:**
- Başlık (TR/EN)
- Mesaj (TR/EN)
- Görsel (opsiyonel)
- Eylem (Deep link)
- Zamanlama (şimdi / planla)

### 6.2 Sistem Bildirimleri
- Bakım modu bildirimi
- Yeni özellik duyurusu
- Event bildirimi

---

## 7. İçerik Yönetimi

### 7.1 Haber/Duyuru
- Yeni haber ekleme
- Görsel ekleme
- Yayınlama/gizleme

### 7.2 Tutorial Yönetimi
- Tutorial adımları düzenleme
- Görseller ve metinler
- Sıralama

---

## 8. Sistem Ayarları

### 8.1 Bakım Modu
- Bakım modunu aktif/pasif yapma
- Bakım mesajı düzenleme
- Tahmini süre

### 8.2 Feature Flags
- Yeni özellikleri açma/kapama
- Beta özellikler
- A/B test yönetimi

### 8.3 Log Görüntüleme
- API error logs
- System logs
- Database query logs
- Filtreleme ve arama

---

## 9. Admin Kullanıcı Yönetimi

### 9.1 Admin Listesi
- Tüm admin kullanıcıları
- Roller: Super Admin, Admin, Moderator

### 9.2 İzinler
**Super Admin:**
- Tüm yetkiler
- Admin ekleme/çıkarma
- Sistem ayarları

**Admin:**
- Ürün yönetimi
- Oyuncu yönetimi
- Market yönetimi
- İstatistikler

**Moderator:**
- Oyuncu görüntüleme
- İlan yönetimi
- Bildirim gönderme

---

## 10. API Endpoints (Admin)

### Authentication
```
POST /api/admin/login
POST /api/admin/logout
POST /api/admin/refresh-token
```

### Products
```
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/upload-image
```

### Game Config
```
GET    /api/admin/config
PUT    /api/admin/config/economy
PUT    /api/admin/config/player-progression
PUT    /api/admin/config/production
```

### Players
```
GET    /api/admin/players
GET    /api/admin/players/:id
PUT    /api/admin/players/:id/balance
PUT    /api/admin/players/:id/ban
PUT    /api/admin/players/:id/unban
POST   /api/admin/players/:id/notes
```

### Market
```
GET    /api/admin/market/listings
DELETE /api/admin/market/listings/:id
GET    /api/admin/market/transactions
GET    /api/admin/market/suspicious
```

### Analytics
```
GET    /api/admin/analytics/dashboard
GET    /api/admin/analytics/economy-health
GET    /api/admin/analytics/player-growth
```

### Notifications
```
POST   /api/admin/notifications/push
GET    /api/admin/notifications/history
```

---

## 11. UI/UX Tasarım

### Layout
```
+------------------------------------------+
| [Logo] DealBaron Admin | [User] [Logout]|
+----------+-------------------------------+
| Sidebar  |  Main Content Area           |
|          |                               |
| Dashboard|  [Breadcrumb]                 |
| Ürünler  |                               |
| Oyuncular|  [Content]                    |
| Market   |                               |
| Ayarlar  |                               |
| Analiz   |                               |
+----------+-------------------------------+
```

### Renkler
- Primary: #1A237E (Koyu mavi)
- Success: #4CAF50
- Warning: #FF9800
- Danger: #F44336
- Background: #F5F5F5

### Önemli UX Prensipleri
- **Onay Dialogs:** Kritik işlemlerde (silme, ban, vb.)
- **Loading States:** Tüm asenkron işlemlerde
- **Toast Notifications:** Başarı/hata mesajları
- **Responsive:** Tablet ve desktop uyumlu
- **Emoji YOK:** Sadece ikonlar (Material Icons veya Font Awesome)

---

## 12. Güvenlik

### Authentication
- JWT token tabanlı
- 2FA (Google Authenticator) - opsiyonel
- Session timeout: 8 saat

### Authorization
- Role-based access control (RBAC)
- Her endpoint için yetki kontrolü
- IP whitelisting (opsiyonel)

### Audit Log
- Tüm admin işlemleri kaydedilir
- Kim, ne yaptı, ne zaman?
- Değişiklik öncesi/sonrası değerler

---

## 13. Geliştirme Öncelikleri

### Faz 1 (MVP)
- [ ] Admin login sistemi
- [ ] Ürün CRUD işlemleri
- [ ] Ürün görsel upload
- [ ] Temel oyun parametreleri
- [ ] Oyuncu listesi ve detay
- [ ] Dashboard (temel istatistikler)

### Faz 2
- [ ] Market yönetimi
- [ ] İşlem geçmişi
- [ ] Push notification
- [ ] Gelişmiş analytics
- [ ] Ekonomi sağlığı metrikleri

### Faz 3
- [ ] Audit log
- [ ] Feature flags
- [ ] A/B test yönetimi
- [ ] Advanced reporting

---

## 14. Örnek Ekran Görünümleri

### Ürün Düzenleme Formu
```
+---------------------------------------+
| Ürün Düzenle: Buğday                 |
+---------------------------------------+
| Genel Bilgiler                        |
|   İsim (TR): [Buğday           ]     |
|   İsim (EN): [Wheat            ]     |
|   Kategori:  [Agriculture  ▼]        |
|   Nadirlik:  [Common       ▼]        |
|                                       |
| Görsel                                |
|   [ Upload Image ]  [Önizleme]       |
|                                       |
| Ekonomik Parametreler                 |
|   Base Price:        [10.50    ]     |
|   Volume:            [5        ]     |
|   Elasticity Factor: [0.15     ]     |
|   Demand Coeff A:    [1000     ]     |
|   Demand Coeff B:    [2.5      ]     |
|                                       |
| Üretim                                |
|   Production Time:   [3600     ] sn  |
|   Üretim Tipi:       [Farm     ▼]    |
|                                       |
| [ Kaydet ]  [ İptal ]                 |
+---------------------------------------+
```

---

**Last Updated:** 2025-10-29
**Version:** 1.0
