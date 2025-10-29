# DealBaron Hızlı Başlangıç Kılavuzu

## 🚀 İlk 2 Hafta - Sprint 1 Görevleri

Bu kılavuz, DealBaron projesine yeni katılan geliştiriciler için hazırlanmıştır. İlk 2 haftalık sprint'te yapılması gereken görevleri öncelik sırasına göre listeler.

---

## 📋 Sprint 1 Hedefi

**Temel altyapıyı kurmak ve ekonomi motorunun çekirdeğini oluşturmak.**

**Teslim Edilebilirler:**
- ✅ Çalışan veritabanı şeması
- ✅ Temel API endpoint'leri
- ✅ Ekonomi formülleri (test edilmiş)
- ✅ Unit test suite (%80+ coverage)

---

## 🛠️ Geliştirme Ortamı Kurulumu

### 1. Gereksinimler

**Backend:**
```bash
- Node.js 18+ veya Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Git
```

**Frontend:**
```bash
- Node.js 18+
- npm veya yarn
```

### 2. Proje Kurulumu

```bash
# Repository'yi klonla
git clone https://github.com/yourorg/dealbaron.git
cd dealbaron

# Backend bağımlılıkları kur
cd backend
npm install
# veya
pip install -r requirements.txt

# Frontend bağımlılıkları kur
cd ../frontend
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle
```

### 3. Veritabanı Kurulumu

```bash
# PostgreSQL başlat
sudo service postgresql start

# Database oluştur
createdb dealbaron_dev

# Migration'ları çalıştır
npm run db:migrate
# veya
python manage.py migrate

# Seed data ekle
npm run db:seed
```

### 4. Redis Başlat

```bash
redis-server

# Test et
redis-cli ping
# PONG dönmeli
```

### 5. Development Server Başlat

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (zaten başlatıldı)
# Terminal 4 - Test watch mode
npm run test:watch
```

---

## 📊 Gün Gün Görev Planı (İlk 2 Hafta)

### 🗓️ Hafta 1: Temel Altyapı

#### **Gün 1: Veritabanı Şeması**
**Görev:** Veritabanı tablolarını oluştur
**Tahmini Süre:** 6-8 saat

**Yapılacaklar:**
1. Migration dosyaları oluştur
2. Tablo şemalarını tanımla
3. İlişkileri kur (foreign keys)
4. Index'leri ekle
5. Seed data hazırla

**Dosyalar:**
```
migrations/
  001_create_players.sql
  002_create_products.sql
  003_create_businesses.sql
  004_create_inventory.sql
  005_create_market_listings.sql
  006_create_transactions.sql
```

**Örnek Migration:**
```sql
-- 001_create_players.sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 1000.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 100,
  market_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_level ON players(level);
```

**Kontrol:**
```bash
# Migration'ı çalıştır
npm run db:migrate

# Tabloları kontrol et
psql dealbaron_dev
\dt
# Tüm tablolar görünmeli
```

---

#### **Gün 2: Model ve ORM Kurulumu**
**Görev:** Veritabanı model'lerini oluştur
**Tahmini Süre:** 6-8 saat

**Yapılacaklar:**
1. ORM model'lerini yaz (Sequelize/TypeORM/SQLAlchemy)
2. İlişkileri tanımla (hasMany, belongsTo, etc.)
3. Validation kuralları ekle
4. Model metodları yaz (helper functions)

**Dosyalar:**
```
models/
  Player.js
  Product.js
  Business.js
  Inventory.js
  MarketListing.js
  Transaction.js
  index.js
```

**Örnek Model (Sequelize):**
```javascript
// models/Player.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 1000.00,
      validate: {
        min: 0
      }
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100
      }
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    trustScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      field: 'trust_score'
    },
    marketUnlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'market_unlocked'
    }
  }, {
    tableName: 'players',
    underscored: true,
    timestamps: true
  });

  // İlişkiler
  Player.associate = (models) => {
    Player.hasMany(models.Business, {
      foreignKey: 'playerId',
      as: 'businesses'
    });
    Player.hasMany(models.Transaction, {
      foreignKey: 'buyerId',
      as: 'purchases'
    });
    Player.hasMany(models.Transaction, {
      foreignKey: 'sellerId',
      as: 'sales'
    });
  };

  // Helper metodlar
  Player.prototype.addBalance = async function(amount) {
    this.balance = parseFloat(this.balance) + parseFloat(amount);
    return this.save();
  };

  Player.prototype.addXP = async function(amount) {
    this.xp += amount;
    const requiredXP = this.calculateRequiredXP();
    if (this.xp >= requiredXP) {
      this.level += 1;
      this.xp -= requiredXP;
    }
    return this.save();
  };

  Player.prototype.calculateRequiredXP = function() {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  };

  return Player;
};
```

**Kontrol:**
```bash
# Model test
node
> const db = require('./models');
> db.Player.findAll();
# Hata vermemeli
```

---

#### **Gün 3: Ekonomi Motoru - Formüller**
**Görev:** Ekonomi hesaplama fonksiyonlarını yaz
**Tahmini Süre:** 6-8 saat

**Yapılacaklar:**
1. Talep hesaplama fonksiyonu
2. Fiyat hesaplama fonksiyonu
3. Gelir hesaplama fonksiyonu
4. Market pressure hesaplama
5. Unit testler yaz

**Dosyalar:**
```
services/
  economy/
    demandCalculator.js
    priceCalculator.js
    revenueCalculator.js
    marketPressureCalculator.js
    index.js
```

**Örnek Kod:**
```javascript
// services/economy/demandCalculator.js

/**
 * Talep hesaplama: Q = a - bP
 * @param {Object} product - Ürün bilgileri
 * @param {number} product.a - Taban talep katsayısı
 * @param {number} product.b - Fiyat duyarlılık katsayısı
 * @param {number} price - Ürün fiyatı
 * @returns {number} - Talep miktarı
 */
function calculateDemand(product, price) {
  if (!product || typeof product.a !== 'number' || typeof product.b !== 'number') {
    throw new Error('Invalid product parameters');
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error('Invalid price');
  }

  const demand = product.a - (product.b * price);

  // Negatif talep sıfıra yuvarla
  return Math.max(0, demand);
}

module.exports = {
  calculateDemand
};
```

**Test Dosyası:**
```javascript
// tests/unit/economy/demandCalculator.test.js
const { calculateDemand } = require('../../../services/economy/demandCalculator');

describe('calculateDemand', () => {
  const product = { a: 1000, b: 2 };

  test('should calculate demand at zero price', () => {
    expect(calculateDemand(product, 0)).toBe(1000);
  });

  test('should calculate demand at normal price', () => {
    expect(calculateDemand(product, 100)).toBe(800);
  });

  test('should return zero for negative demand', () => {
    expect(calculateDemand(product, 600)).toBe(0);
  });

  test('should throw error for invalid product', () => {
    expect(() => calculateDemand(null, 100)).toThrow('Invalid product');
  });

  test('should throw error for negative price', () => {
    expect(() => calculateDemand(product, -10)).toThrow('Invalid price');
  });
});
```

**Kontrol:**
```bash
# Testleri çalıştır
npm test services/economy/demandCalculator.test.js

# Tüm ekonomi testleri
npm test tests/unit/economy/
```

---

#### **Gün 4-5: Ekonomi Motoru - Tümleştirme**
**Görev:** Tüm ekonomi fonksiyonlarını birleştir ve test et
**Tahmini Süre:** 12-16 saat

**Yapılacaklar:**
1. `priceCalculator.js` yaz
2. `marketPressureCalculator.js` yaz
3. `EconomyEngine` service oluştur
4. Integration testler yaz
5. Edge case'leri test et

**Ana Service:**
```javascript
// services/economy/EconomyEngine.js
const { calculateDemand } = require('./demandCalculator');
const { calculatePrice } = require('./priceCalculator');
const { calculateMarketPressure } = require('./marketPressureCalculator');

class EconomyEngine {
  constructor() {
    this.updateInterval = 5 * 60 * 1000; // 5 dakika
  }

  /**
   * Ürün için piyasa durumunu hesapla
   */
  async calculateMarketState(productId) {
    const product = await Product.findByPk(productId);
    const totalSupply = await this.getTotalSupply(productId);
    const avgPrice = await this.getAveragePrice(productId);

    const theoreticalDemand = calculateDemand(product, avgPrice);
    const pressure = calculateMarketPressure(totalSupply, theoreticalDemand);

    return {
      productId,
      supply: totalSupply,
      demand: theoreticalDemand,
      avgPrice,
      pressure,
      timestamp: new Date()
    };
  }

  /**
   * Oyuncu için optimal fiyat öner
   */
  async suggestOptimalPrice(productId, markup) {
    const marketState = await this.calculateMarketState(productId);
    const product = await Product.findByPk(productId);

    const price = calculatePrice(
      product.basePrice,
      markup,
      product.elasticityFactor,
      marketState.pressure
    );

    const demand = calculateDemand(product, price);
    const revenue = price * demand;

    return {
      price,
      expectedDemand: demand,
      expectedRevenue: revenue,
      marketPressure: marketState.pressure
    };
  }

  // ... diğer metodlar
}

module.exports = new EconomyEngine();
```

**Integration Test:**
```javascript
// tests/integration/economy.test.js
const EconomyEngine = require('../../services/economy/EconomyEngine');
const { Product } = require('../../models');

describe('Economy Engine Integration', () => {
  beforeAll(async () => {
    // Test database setup
    await setupTestDatabase();
  });

  test('should calculate market state for a product', async () => {
    const product = await Product.create({
      name: 'Test Wheat',
      basePrice: 10,
      a: 1000,
      b: 2,
      elasticityFactor: 0.1
    });

    const state = await EconomyEngine.calculateMarketState(product.id);

    expect(state).toHaveProperty('supply');
    expect(state).toHaveProperty('demand');
    expect(state).toHaveProperty('avgPrice');
    expect(state).toHaveProperty('pressure');
  });

  test('should suggest optimal price', async () => {
    const product = await Product.findOne();
    const suggestion = await EconomyEngine.suggestOptimalPrice(product.id, 0.2);

    expect(suggestion.price).toBeGreaterThan(0);
    expect(suggestion.expectedDemand).toBeGreaterThanOrEqual(0);
    expect(suggestion.expectedRevenue).toBeGreaterThanOrEqual(0);
  });
});
```

---

### 🗓️ Hafta 2: API ve Depo Sistemi

#### **Gün 6: REST API Yapısı**
**Görev:** Temel API endpoint'lerini oluştur
**Tahmini Süre:** 6-8 saat

**Yapılacaklar:**
1. API router yapısı kur
2. Authentication middleware
3. Validation middleware
4. Error handling middleware

**Dosya Yapısı:**
```
routes/
  api/
    v1/
      products.js
      players.js
      market.js
      businesses.js
      index.js
middleware/
  auth.js
  validate.js
  errorHandler.js
```

**Örnek Router:**
```javascript
// routes/api/v1/products.js
const express = require('express');
const router = express.Router();
const { Product } = require('../../../models');
const { authenticate } = require('../../../middleware/auth');

/**
 * GET /api/v1/products
 * Tüm ürünleri listele
 */
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'basePrice', 'category', 'rarity']
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/:id
 * Ürün detayı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/products/calculate-demand
 * Talep hesaplama
 */
router.post('/calculate-demand', authenticate, async (req, res, next) => {
  try {
    const { productId, price } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const demand = calculateDemand(product, price);

    res.json({
      success: true,
      data: {
        productId,
        price,
        demand
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**Error Handler:**
```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
```

---

#### **Gün 7-8: Depo Sistemi**
**Görev:** Warehouse ve Inventory sistemi
**Tahmini Süre:** 12-16 saat

**Yapılacaklar:**
1. Warehouse service yaz
2. Inventory management
3. Volume calculation
4. Capacity checks
5. Unit ve integration testler

**Service:**
```javascript
// services/warehouse/WarehouseService.js
class WarehouseService {
  /**
   * Ürün ekle
   */
  async addItem(businessId, productId, quantity) {
    const business = await Business.findByPk(businessId);
    const product = await Product.findByPk(productId);

    // Hacim kontrolü
    const requiredVolume = product.volume * quantity;
    const currentUsage = await this.calculateUsedVolume(businessId);
    const freeSpace = business.warehouseCapacity - currentUsage;

    if (requiredVolume > freeSpace) {
      throw new Error(`Insufficient warehouse space. Required: ${requiredVolume}, Available: ${freeSpace}`);
    }

    // Envantere ekle
    const [inventory, created] = await Inventory.findOrCreate({
      where: { businessId, productId },
      defaults: { quantity: 0, averageCost: product.basePrice }
    });

    inventory.quantity += quantity;
    await inventory.save();

    return inventory;
  }

  /**
   * Ürün çıkar
   */
  async removeItem(businessId, productId, quantity) {
    const inventory = await Inventory.findOne({
      where: { businessId, productId }
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }

    inventory.quantity -= quantity;
    await inventory.save();

    return inventory;
  }

  /**
   * Kullanılan hacmi hesapla
   */
  async calculateUsedVolume(businessId) {
    const inventories = await Inventory.findAll({
      where: { businessId },
      include: [Product]
    });

    let totalVolume = 0;
    for (let inv of inventories) {
      totalVolume += inv.Product.volume * inv.quantity;
    }

    return totalVolume;
  }

  /**
   * Depo durumu
   */
  async getWarehouseStatus(businessId) {
    const business = await Business.findByPk(businessId);
    const usedVolume = await this.calculateUsedVolume(businessId);

    return {
      capacity: business.warehouseCapacity,
      used: usedVolume,
      free: business.warehouseCapacity - usedVolume,
      utilizationRate: (usedVolume / business.warehouseCapacity) * 100
    };
  }
}

module.exports = new WarehouseService();
```

**API Endpoint:**
```javascript
// routes/api/v1/warehouse.js
router.get('/:businessId/status', authenticate, async (req, res, next) => {
  try {
    const status = await WarehouseService.getWarehouseStatus(req.params.businessId);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

router.post('/:businessId/add', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const inventory = await WarehouseService.addItem(
      req.params.businessId,
      productId,
      quantity
    );
    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
});
```

---

#### **Gün 9-10: Test Coverage ve Bug Fix**
**Görev:** Test coverage %80'e çıkar ve bugları düzelt
**Tahmini Süre:** 12-16 saat

**Yapılacaklar:**
1. Coverage raporu çıkar
2. Eksik testleri yaz
3. Integration testler ekle
4. Bulunan bugları düzelt
5. Code review yap

**Coverage Kontrolü:**
```bash
# Coverage raporu
npm run test:coverage

# HTML rapor aç
open coverage/index.html

# Kritik dosyalar %100 olmalı:
# - economy/*.js
# - warehouse/*.js
# - models/Player.js
# - models/Product.js
```

---

## ✅ Sprint 1 Tamamlanma Kontrol Listesi

### Backend
- [ ] Veritabanı şeması tamamlandı
- [ ] Migration'lar çalışıyor
- [ ] Seed data hazır
- [ ] Tüm model'ler oluşturuldu
- [ ] İlişkiler (associations) doğru çalışıyor
- [ ] Ekonomi formülleri yazıldı ve test edildi
- [ ] Depo sistemi çalışıyor
- [ ] API endpoint'leri hazır
- [ ] Authentication middleware çalışıyor
- [ ] Error handling doğru çalışıyor

### Test
- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] Test coverage %80+
- [ ] Tüm testler geçiyor
- [ ] CI/CD pipeline kuruldu

### Dokümantasyon
- [ ] API dokümantasyonu (Swagger)
- [ ] README güncellendi
- [ ] Setup guide yazıldı
- [ ] Code comment'leri eklendi

---

## 🎯 Sprint 1 Demo Hazırlığı

### Demo Senaryosu

**1. Veritabanı Gösterimi**
```sql
-- Tabloları göster
\dt

-- Sample data
SELECT * FROM products LIMIT 5;
SELECT * FROM players LIMIT 3;
```

**2. API Testleri (Postman/Insomnia)**
```
GET  /api/v1/products
GET  /api/v1/products/1
POST /api/v1/products/calculate-demand
  Body: { "productId": 1, "price": 100 }
```

**3. Test Coverage**
```bash
npm run test:coverage
# %80+ göster
```

**4. Ekonomi Hesaplaması**
```javascript
// Node REPL
const EconomyEngine = require('./services/economy/EconomyEngine');

// Talep hesapla
const product = { a: 1000, b: 2 };
calculateDemand(product, 100); // 800

// Optimal fiyat öner
EconomyEngine.suggestOptimalPrice(1, 0.2);
```

---

## 🚨 Sık Karşılaşılan Sorunlar

### Problem: Database connection error
```bash
# Çözüm 1: PostgreSQL çalışıyor mu?
sudo service postgresql status

# Çözüm 2: Connection string doğru mu?
# .env dosyasını kontrol et
DATABASE_URL=postgresql://user:password@localhost:5432/dealbaron_dev
```

### Problem: Migration hatası
```bash
# Çözüm: Database'i sıfırla
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Problem: Test fail ediyor
```bash
# Çözüm 1: Test database kullan
NODE_ENV=test npm test

# Çözüm 2: Test database'i temizle
npm run test:db:reset
```

### Problem: Port already in use
```bash
# Çözüm: Portu öldür
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Faydalı Komutlar

```bash
# Development
npm run dev              # Dev server başlat
npm run dev:watch        # Watch mode
npm run db:migrate       # Migration çalıştır
npm run db:seed          # Seed data ekle
npm run db:reset         # Database sıfırla

# Test
npm test                 # Tüm testler
npm run test:unit        # Sadece unit testler
npm run test:integration # Integration testler
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage raporu

# Linting
npm run lint             # Lint kontrolü
npm run lint:fix         # Auto-fix

# Build
npm run build            # Production build
npm run start            # Production server
```

---

## 📞 Yardım ve Destek

**Teknik Sorular:**
- Slack: #dealbaron-dev
- Email: dev-team@dealbaron.com

**Dokümantasyon:**
- API Docs: http://localhost:3000/api-docs
- Main Docs: /docs folder

**Code Review:**
- PR açın
- 2 approval gerekli
- CI/CD pass olmalı

---

## 🎉 Sprint 1 Tamamlandı!

Tebrikler! İlk sprint'i tamamladınız. Artık:
- ✅ Sağlam bir veritabanı yapınız var
- ✅ Ekonomi motoru çalışıyor
- ✅ Temel API'ler hazır
- ✅ Test suite %80+ coverage

**Sırada ne var?**
Sprint 2'de DealBaron pazar sistemi ve işletme mekaniklerini geliştireceğiz!

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 1.0
