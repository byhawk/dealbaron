# DealBaron - Ekonomi Simülasyon Oyunu

DealBaron, oyuncuların kendi ticaret imparatorluklarını kurduğu, arz-talep dengesine ve dinamik fiyatlandırmaya dayalı bir ekonomi simülasyon oyunudur.

## 🎮 Oyun Özellikleri

- **Elastikiyet Tabanlı Ekonomi:** Gerçek piyasa prensipleriyle çalışan dinamik fiyatlandırma
- **DealBaron Otomatik Aracı:** Piyasa likiditesi sağlayan ve referans fiyat belirleyen sistem
- **İşletme Yönetimi:** Çiftlik ve sanayi işletmeleri kurma ve yönetme
- **Dinamik Pazar:** Oyuncular arası ticaret ve rekabet
- **İlerleme Sistemi:** Seviye, XP, itibar ve başarımlar

## 🏗️ Teknik Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Process Manager:** PM2
- **Web Server:** Nginx (Reverse Proxy)

### Mobile App
- **Framework:** Flutter 3.x
- **Platform:** Android
- **State Management:** Riverpod
- **API Client:** Dio + Retrofit
- **Local Storage:** Hive
- **Notifications:** Firebase Cloud Messaging

### Admin Panel (Web)
- **Framework:** React.js (planlı)
- **UI Library:** Ant Design
- **Features:** Product management, game config, player management, analytics

### Deployment
- **Server:** Linux VDS (Ubuntu 22.04)
- **SSL:** Let's Encrypt (Certbot)
- **CI/CD:** GitHub Actions (planlı)

## 📁 Proje Yapısı

```
DealBaronV2/
├── backend/                 # Node.js backend API (yapım aşamasında)
├── flutter_app/            # Flutter mobil uygulama (yapım aşamasında)
├── docs/                   # Dokümantasyon
│   ├── CLAUDE.md          # Claude Code için rehber
│   ├── API_SPECIFICATION.md
│   ├── FLUTTER_DEVELOPMENT_PLAN.md
│   ├── LINUX_VDS_DEPLOYMENT.md
│   └── ...
└── README.md
```

## 📚 Dokümantasyon

- **[CLAUDE.md](CLAUDE.md)** - Geliştirici rehberi (Claude Code için)
- **[dealbaron_game_design(1).md](dealbaron_game_design(1).md)** - Oyun tasarım dokümanı
- **[DealBaron_AI_System_Prompt.md](DealBaron_AI_System_Prompt.md)** - Ekonomi sistemi detayları
- **[API_SPECIFICATION.md](API_SPECIFICATION.md)** - Backend API dokümantasyonu (67 endpoints)
- **[ADMIN_PANEL_SPECIFICATION.md](ADMIN_PANEL_SPECIFICATION.md)** - Admin panel özellikleri ve API'ler
- **[FLUTTER_DEVELOPMENT_PLAN.md](FLUTTER_DEVELOPMENT_PLAN.md)** - Flutter geliştirme planı
- **[LINUX_VDS_DEPLOYMENT.md](LINUX_VDS_DEPLOYMENT.md)** - Deployment rehberi
- **[TEST_STRATEGY.md](TEST_STRATEGY.md)** - Test stratejisi
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Hızlı başlangıç kılavuzu

## 🚀 Başlangıç

### Backend Kurulum (Yapım Aşamasında)
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

### Flutter Kurulum (Yapım Aşamasında)
```bash
cd flutter_app
flutter pub get
flutter run
```

## 📊 Geliştirme Durumu

**Mevcut Faz:** Dokümantasyon ve Planlama ✅

**Sıradaki Adımlar:**
- [ ] Backend proje kurulumu
- [ ] Veritabanı şeması
- [ ] API endpoint'leri
- [ ] Flutter proje kurulumu
- [ ] UI/UX implementasyonu

## 🔑 Temel Ekonomi Formülleri

**Talep Hesaplama:**
```
Q = a - bP
```

**Fiyat Hesaplama:**
```
FinalPrice = BasePrice × (1 + Markup%) × (1 ± ElasticityFactor × MarketPressure)
```

**DealBaron Kuralı:**
- Oyuncu fiyatları DealBaron ortalamasının %80-90'ı arasında olmalıdır

## 🤝 Katkıda Bulunma

Proje şu anda aktif geliştirme aşamasındadır. Katkıda bulunmak için lütfen dokümantasyonu inceleyin.

## 📄 Lisans

[Lisans bilgisi eklenecek]

## 📞 İletişim

- **Geliştirici:** byhawk
- **GitHub:** https://github.com/byhawk/dealbaron

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 0.1.0 (Planning Phase)
