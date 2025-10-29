# DealBaron Test Stratejisi ve Test Case'leri

## 📋 İçindekiler
1. [Test Piramidi](#test-piramidi)
2. [Unit Test Senaryoları](#unit-test-senaryoları)
3. [Integration Test Senaryoları](#integration-test-senaryoları)
4. [Ekonomi Simülasyon Testleri](#ekonomi-simülasyon-testleri)
5. [Performance Test Senaryoları](#performance-test-senaryoları)
6. [Security & Exploit Test Senaryoları](#security--exploit-test-senaryoları)
7. [User Acceptance Test (UAT)](#user-acceptance-test-uat)
8. [Test Otomasyonu](#test-otomasyonu)

---

## 🔺 Test Piramidi

```
           /\
          /  \        E2E Tests (10%)
         /____\       - User flows
        /      \      - Critical paths
       /________\
      /          \    Integration Tests (30%)
     /____________\   - API endpoints
    /              \  - Service interactions
   /________________\
  /                  \ Unit Tests (60%)
 /____________________\- Functions, methods
                       - Business logic
```

**Hedef Test Sayıları:**
- Unit Tests: ~500+
- Integration Tests: ~150+
- E2E Tests: ~50+
- Toplam Coverage: %85+

---

## 🧪 Unit Test Senaryoları

### 1. Ekonomi Formülleri Testleri

#### 1.1 Talep Hesaplama (calculateDemand)
```javascript
describe('calculateDemand', () => {
  const product = {
    a: 1000,  // base demand
    b: 2,     // price sensitivity
  };

  test('should calculate demand at zero price', () => {
    const demand = calculateDemand(product, 0);
    expect(demand).toBe(1000);
  });

  test('should calculate demand at normal price', () => {
    const demand = calculateDemand(product, 100);
    expect(demand).toBe(800); // 1000 - 2*100
  });

  test('should return zero demand at maximum price', () => {
    const demand = calculateDemand(product, 500);
    expect(demand).toBe(0);
  });

  test('should handle negative demand (price too high)', () => {
    const demand = calculateDemand(product, 600);
    expect(demand).toBeLessThan(0);
    // Sistemde negatif talep sıfıra yuvarlanmalı
  });

  test('should handle floating point prices correctly', () => {
    const demand = calculateDemand(product, 99.99);
    expect(demand).toBeCloseTo(800.02, 2);
  });
});
```

#### 1.2 Fiyat Hesaplama (calculatePrice)
```javascript
describe('calculatePrice', () => {
  test('should calculate price with zero markup', () => {
    const price = calculatePrice(100, 0, 0.1, 0);
    expect(price).toBe(100);
  });

  test('should calculate price with markup only', () => {
    const price = calculatePrice(100, 0.2, 0, 0);
    expect(price).toBe(120); // 100 * 1.2
  });

  test('should calculate price with elasticity and market pressure', () => {
    const price = calculatePrice(100, 0.2, 0.1, 0.5);
    expect(price).toBeCloseTo(126); // 100 * 1.2 * (1 + 0.1*0.5)
  });

  test('should handle negative market pressure (high demand)', () => {
    const price = calculatePrice(100, 0.2, 0.1, -0.5);
    expect(price).toBeCloseTo(114); // 100 * 1.2 * (1 - 0.05)
  });

  test('should handle extreme markup (500%)', () => {
    const price = calculatePrice(100, 5, 0, 0);
    expect(price).toBe(600);
  });

  test('should handle negative markup (discount)', () => {
    const price = calculatePrice(100, -0.2, 0, 0);
    expect(price).toBe(80);
  });
});
```

#### 1.3 Gelir Optimizasyonu (calculateRevenue)
```javascript
describe('calculateRevenue', () => {
  test('should calculate revenue correctly', () => {
    const revenue = calculateRevenue(100, 50);
    expect(revenue).toBe(5000);
  });

  test('should return zero for zero demand', () => {
    const revenue = calculateRevenue(100, 0);
    expect(revenue).toBe(0);
  });

  test('should handle fractional quantities', () => {
    const revenue = calculateRevenue(99.99, 10.5);
    expect(revenue).toBeCloseTo(1049.895, 2);
  });
});
```

#### 1.4 Market Pressure (calculateMarketPressure)
```javascript
describe('calculateMarketPressure', () => {
  test('should calculate zero pressure at equilibrium', () => {
    const pressure = calculateMarketPressure(1000, 1000);
    expect(pressure).toBe(0);
  });

  test('should calculate positive pressure with oversupply', () => {
    const pressure = calculateMarketPressure(1500, 1000);
    expect(pressure).toBe(0.5); // (1500-1000)/1000
  });

  test('should calculate negative pressure with high demand', () => {
    const pressure = calculateMarketPressure(800, 1000);
    expect(pressure).toBe(-0.2); // (800-1000)/1000
  });

  test('should handle extreme oversupply', () => {
    const pressure = calculateMarketPressure(3000, 1000);
    expect(pressure).toBe(2.0);
  });
});
```

---

### 2. Depo Sistemi Testleri

```javascript
describe('Warehouse System', () => {
  let warehouse;

  beforeEach(() => {
    warehouse = new Warehouse({
      capacity: 1000,
      ownerId: 'player1'
    });
  });

  test('should initialize with zero volume', () => {
    expect(warehouse.usedVolume).toBe(0);
    expect(warehouse.freeSpace).toBe(1000);
  });

  test('should add item successfully', () => {
    const product = { id: 1, volume: 10 };
    warehouse.addItem(product, 5);
    expect(warehouse.usedVolume).toBe(50);
    expect(warehouse.freeSpace).toBe(950);
  });

  test('should prevent adding items exceeding capacity', () => {
    const product = { id: 1, volume: 10 };
    expect(() => {
      warehouse.addItem(product, 101);
    }).toThrow('Insufficient warehouse space');
  });

  test('should remove item successfully', () => {
    const product = { id: 1, volume: 10 };
    warehouse.addItem(product, 5);
    warehouse.removeItem(product, 2);
    expect(warehouse.usedVolume).toBe(30);
  });

  test('should prevent removing more than available', () => {
    const product = { id: 1, volume: 10 };
    warehouse.addItem(product, 5);
    expect(() => {
      warehouse.removeItem(product, 10);
    }).toThrow('Insufficient inventory');
  });

  test('should calculate utilization rate correctly', () => {
    const product = { id: 1, volume: 10 };
    warehouse.addItem(product, 50);
    expect(warehouse.utilizationRate()).toBe(50); // 500/1000 * 100
  });

  test('should handle multiple product types', () => {
    const product1 = { id: 1, volume: 10 };
    const product2 = { id: 2, volume: 5 };
    warehouse.addItem(product1, 10); // 100
    warehouse.addItem(product2, 20); // 100
    expect(warehouse.usedVolume).toBe(200);
  });
});
```

---

### 3. DealBaron Otomatik Aracı Testleri

```javascript
describe('DealBaron Agent', () => {
  let agent;

  beforeEach(() => {
    agent = new DealBaronAgent();
  });

  test('should calculate average price from transactions', async () => {
    const mockTransactions = [
      { price: 100, quantity: 10 }, // 1000
      { price: 110, quantity: 5 },  // 550
      { price: 90, quantity: 15 },  // 1350
    ];

    const avgPrice = agent.calculateWeightedAverage(mockTransactions);
    expect(avgPrice).toBeCloseTo(96.67, 2); // 2900 / 30
  });

  test('should use base price when no transactions exist', async () => {
    const product = { basePrice: 100 };
    const avgPrice = await agent.calculateAveragePrice(product.id);
    expect(avgPrice).toBe(100);
  });

  test('should accept player price within 80-90% range', () => {
    const dealBaronPrice = 100;
    expect(agent.validatePlayerPrice(85, dealBaronPrice)).toBe(true);
    expect(agent.validatePlayerPrice(90, dealBaronPrice)).toBe(true);
    expect(agent.validatePlayerPrice(80, dealBaronPrice)).toBe(true);
  });

  test('should reject player price above 90%', () => {
    const dealBaronPrice = 100;
    expect(() => {
      agent.validatePlayerPrice(91, dealBaronPrice);
    }).toThrow('Price too high');
  });

  test('should reject player price below 80%', () => {
    const dealBaronPrice = 100;
    expect(() => {
      agent.validatePlayerPrice(79, dealBaronPrice);
    }).toThrow('Price too low');
  });

  test('should handle instant buy transaction', async () => {
    const result = await agent.instantBuy('player1', 1, 10);
    expect(result).toHaveProperty('transactionId');
    expect(result).toHaveProperty('totalCost');
  });

  test('should reject buy with insufficient balance', async () => {
    await expect(
      agent.instantBuy('poor_player', 1, 10000)
    ).rejects.toThrow('Insufficient funds');
  });
});
```

---

### 4. Oyuncu İlerlemesi Testleri

```javascript
describe('Player Progression', () => {
  test('should calculate XP required for level correctly', () => {
    expect(calculateXPRequired(1)).toBe(100);
    expect(calculateXPRequired(2)).toBe(150);
    expect(calculateXPRequired(3)).toBe(225);
    expect(calculateXPRequired(10)).toBeGreaterThan(1000);
  });

  test('should award XP for successful sale', async () => {
    const player = await Player.findByPk('player1');
    const initialXP = player.xp;
    await player.completeSale(productId, quantity);
    expect(player.xp).toBe(initialXP + 10);
  });

  test('should level up when XP threshold reached', async () => {
    const player = await Player.findByPk('player1');
    player.xp = 99;
    player.level = 1;
    await player.addXP(1);
    expect(player.level).toBe(2);
    expect(player.xp).toBe(0); // overflow XP
  });

  test('should calculate trust score correctly', () => {
    const playerStats = {
      successfulTransactions: 100,
      onTimeLoanPayments: 10,
      daysActive: 30,
      canceledListings: 5,
      lateLoanPayments: 2,
      priceManipulationAttempts: 0
    };

    const score = calculateTrustScore(playerStats);
    expect(score).toBeGreaterThan(100);
    expect(score).toBeLessThan(200);
  });

  test('should unlock market at level 5', async () => {
    const player = await Player.create({
      level: 5,
      totalTransactions: 10,
      totalRevenue: 10000,
      daysActive: 3
    });

    const isUnlocked = await checkMarketUnlock(player.id);
    expect(isUnlocked).toBe(true);
  });
});
```

---

### 5. İşçi ve Üretim Testleri

```javascript
describe('Production System', () => {
  test('should calculate production time with no workers', () => {
    const baseTime = 3600; // 1 saat
    const productionTime = calculateProductionTime(baseTime, []);
    expect(productionTime).toBe(3600);
  });

  test('should reduce production time with basic worker', () => {
    const baseTime = 3600;
    const workers = [{ boostMultiplier: 1.2 }];
    const productionTime = calculateProductionTime(baseTime, workers);
    expect(productionTime).toBe(3000); // 3600 / 1.2
  });

  test('should stack multiple worker boosts', () => {
    const baseTime = 3600;
    const workers = [
      { boostMultiplier: 1.2 },
      { boostMultiplier: 1.5 }
    ];
    const productionTime = calculateProductionTime(baseTime, workers);
    expect(productionTime).toBe(2000); // 3600 / (1.2 * 1.5)
  });

  test('should complete production after time elapsed', async () => {
    const production = await Production.create({
      productId: 1,
      quantity: 10,
      startTime: new Date(Date.now() - 3600000), // 1 saat önce
      endTime: new Date(Date.now() - 1000), // 1 saniye önce
      status: 'IN_PROGRESS'
    });

    const completed = await production.checkCompletion();
    expect(completed).toBe(true);
    expect(production.status).toBe('COMPLETED');
  });
});
```

---

## 🔗 Integration Test Senaryoları

### 1. Tam Satış Akışı (End-to-End)

```javascript
describe('Complete Sales Flow', () => {
  let player, business, product;

  beforeAll(async () => {
    player = await Player.create({ username: 'testuser', balance: 10000 });
    business = await Business.create({ playerId: player.id, type: 'farm' });
    product = await Product.findOne({ where: { name: 'Wheat' } });
  });

  test('Full sales cycle: produce → list → sell', async () => {
    // 1. Üretimi başlat
    const production = await business.startProduction(product.id, 100);
    expect(production.status).toBe('IN_PROGRESS');

    // 2. Üretimi simüle et (zaman atlama)
    await production.complete();
    expect(production.status).toBe('COMPLETED');

    // 3. Envantere ekle
    await business.collectProduction(production.id);
    const inventory = await Inventory.findOne({
      where: { businessId: business.id, productId: product.id }
    });
    expect(inventory.quantity).toBe(100);

    // 4. Pazara ilan ver
    const dealBaronPrice = await DealBaronAgent.getAveragePrice(product.id);
    const playerPrice = dealBaronPrice * 0.85;

    const listing = await MarketListing.create({
      sellerId: player.id,
      productId: product.id,
      quantity: 100,
      price: playerPrice
    });
    expect(listing.status).toBe('ACTIVE');

    // 5. Başka oyuncu satın alsın
    const buyer = await Player.create({ username: 'buyer', balance: 10000 });
    const transaction = await MarketService.buy(buyer.id, listing.id, 50);

    expect(transaction.quantity).toBe(50);
    expect(transaction.buyerId).toBe(buyer.id);
    expect(transaction.sellerId).toBe(player.id);

    // 6. Bakiyeleri kontrol et
    await player.reload();
    await buyer.reload();

    const expectedRevenue = playerPrice * 50 * 0.95; // %5 pazar ücreti
    expect(player.balance).toBeCloseTo(10000 + expectedRevenue, 2);
    expect(buyer.balance).toBeCloseTo(10000 - (playerPrice * 50), 2);

    // 7. Envanter güncellemelerini kontrol et
    await inventory.reload();
    expect(inventory.quantity).toBe(50);

    const buyerInventory = await Inventory.findOne({
      where: { ownerId: buyer.id, productId: product.id }
    });
    expect(buyerInventory.quantity).toBe(50);
  });
});
```

---

### 2. Pazar Erişim Kontrolü

```javascript
describe('Market Access Control', () => {
  test('should prevent low-level player from accessing market', async () => {
    const newPlayer = await Player.create({
      username: 'newbie',
      level: 1,
      totalTransactions: 0
    });

    const canAccess = await MarketService.checkAccess(newPlayer.id);
    expect(canAccess).toBe(false);

    await expect(
      MarketService.browse(newPlayer.id)
    ).rejects.toThrow('Market not unlocked');
  });

  test('should unlock market after meeting requirements', async () => {
    const player = await Player.create({
      username: 'veteran',
      level: 5,
      totalTransactions: 10,
      totalRevenue: 10000,
      daysActive: 3
    });

    const canAccess = await MarketService.checkAccess(player.id);
    expect(canAccess).toBe(true);

    const listings = await MarketService.browse(player.id);
    expect(listings).toBeInstanceOf(Array);
  });
});
```

---

### 3. Fiyat Kısıtlama Entegrasyonu

```javascript
describe('Price Constraint Integration', () => {
  test('should reject listing with price above DealBaron', async () => {
    const player = await createUnlockedPlayer();
    const product = await Product.findOne();
    const dealBaronPrice = await DealBaronAgent.getAveragePrice(product.id);

    await expect(
      MarketListing.create({
        sellerId: player.id,
        productId: product.id,
        quantity: 10,
        price: dealBaronPrice * 1.1 // %110 - TOO HIGH
      })
    ).rejects.toThrow('Price exceeds maximum allowed');
  });

  test('should accept listing within 80-90% range', async () => {
    const player = await createUnlockedPlayer();
    const product = await Product.findOne();
    const dealBaronPrice = await DealBaronAgent.getAveragePrice(product.id);

    const listing = await MarketListing.create({
      sellerId: player.id,
      productId: product.id,
      quantity: 10,
      price: dealBaronPrice * 0.85 // %85 - OK
    });

    expect(listing.status).toBe('ACTIVE');
  });
});
```

---

## 📊 Ekonomi Simülasyon Testleri

### 1. 30-Günlük Ekonomi Simülasyonu

```javascript
describe('Economy Simulation - 30 Days', () => {
  const config = {
    players: 100,
    days: 30,
    transactionsPerDay: 100,
  };

  test('should maintain price stability', async () => {
    const simulator = new EconomySimulator(config);
    const results = await simulator.run();

    // Günlük fiyat değişim oranı
    const dailyChanges = results.priceHistory.map((day, i) => {
      if (i === 0) return 0;
      return (day.avgPrice - results.priceHistory[i-1].avgPrice) / results.priceHistory[i-1].avgPrice;
    });

    const avgDailyChange = average(dailyChanges);
    expect(Math.abs(avgDailyChange)).toBeLessThan(0.1); // %10'dan az değişim
  });

  test('should prevent hyperinflation', async () => {
    const simulator = new EconomySimulator(config);
    const results = await simulator.run();

    const totalInflation = (
      results.finalAvgPrice - results.initialAvgPrice
    ) / results.initialAvgPrice;

    expect(totalInflation).toBeLessThan(0.5); // 30 günde %50'den az
  });

  test('should maintain healthy Gini coefficient', async () => {
    const simulator = new EconomySimulator(config);
    const results = await simulator.run();

    // Zenginlik dağılımı
    const gini = calculateGiniCoefficient(results.playerWealth);
    expect(gini).toBeLessThan(0.6); // Sağlıklı eşitsizlik seviyesi
  });

  test('should maintain market liquidity', async () => {
    const simulator = new EconomySimulator(config);
    const results = await simulator.run();

    const liquidity = results.productsTraded / results.totalProducts;
    expect(liquidity).toBeGreaterThan(0.7); // %70+ ürün aktif
  });
});
```

---

### 2. Stres Test - Ekstrem Senaryolar

```javascript
describe('Economy Stress Tests', () => {
  test('should handle sudden supply shock', async () => {
    // 1000 oyuncu aynı anda aynı ürünü satışa sunarsa
    const players = await createPlayers(1000);
    const product = await Product.findOne();

    const listings = await Promise.all(
      players.map(player =>
        MarketListing.create({
          sellerId: player.id,
          productId: product.id,
          quantity: 100,
          price: product.basePrice
        })
      )
    );

    // Sistem çökmemeli
    expect(listings.length).toBe(1000);

    // Fiyatlar düşmeli (market pressure)
    const marketState = await MarketState.findOne({ where: { productId: product.id } });
    expect(marketState.pressure).toBeGreaterThan(5); // Çok yüksek arz
  });

  test('should handle demand shock', async () => {
    // 1000 oyuncu aynı anda aynı ürünü almaya çalışırsa
    const buyers = await createPlayers(1000);
    const product = await Product.findOne();

    // Yeterli arz olmadığı için bazıları alamayacak
    const results = await Promise.allSettled(
      buyers.map(buyer =>
        DealBaronAgent.instantBuy(buyer.id, product.id, 100)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    expect(successful).toBeGreaterThan(0);
    expect(failed).toBeGreaterThan(0); // Bazıları başarısız olmalı
  });
});
```

---

## ⚡ Performance Test Senaryoları

### 1. Load Test - k6 Script

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // %95 < 500ms
    'http_req_failed': ['rate<0.01'],   // %1'den az hata
    'errors': ['rate<0.1'],             // %10'dan az error
  },
};

export default function () {
  // 1. Browse Market
  let res = http.get('https://api.dealbaron.com/market/listings');
  check(res, {
    'market listings loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // 2. Get Product Details
  res = http.get('https://api.dealbaron.com/products/1');
  check(res, {
    'product details loaded': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // 3. Buy Product
  res = http.post('https://api.dealbaron.com/market/buy', JSON.stringify({
    listingId: 123,
    quantity: 5,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'purchase successful': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}
```

---

### 2. Database Query Performance

```javascript
describe('Database Performance', () => {
  test('market listings query should be fast', async () => {
    const start = Date.now();
    const listings = await MarketListing.findAll({
      where: { status: 'ACTIVE' },
      include: [Product, Player],
      limit: 100
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100); // < 100ms
    expect(listings.length).toBeGreaterThan(0);
  });

  test('player statistics aggregation should be fast', async () => {
    const start = Date.now();
    const stats = await Transaction.aggregate({
      where: { buyerId: 'player1' },
      attributes: [
        [sequelize.fn('COUNT', '*'), 'totalTransactions'],
        [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalSpent'],
      ]
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50); // < 50ms
  });
});
```

---

## 🔒 Security & Exploit Test Senaryoları

### 1. Price Manipulation Tests

```javascript
describe('Price Manipulation Prevention', () => {
  test('should prevent wash trading (self-dealing)', async () => {
    const player = await Player.create({ username: 'manipulator' });

    // Kendi kendine satış denemesi
    await expect(
      MarketService.sell(player.id, {
        productId: 1,
        quantity: 10,
        buyerId: player.id // aynı oyuncu
      })
    ).rejects.toThrow('Cannot trade with yourself');
  });

  test('should detect pump and dump pattern', async () => {
    const player = await Player.create({ username: 'pumper' });

    // Hızlı alım
    for (let i = 0; i < 10; i++) {
      await DealBaronAgent.instantBuy(player.id, 1, 100);
    }

    // Hemen satış denemesi
    const listing = await MarketListing.create({
      sellerId: player.id,
      productId: 1,
      quantity: 1000,
      price: 200 // çok yüksek
    });

    // Sistem flaglemeli
    expect(listing.flagged).toBe(true);
    expect(listing.flagReason).toContain('Suspicious activity');
  });

  test('should detect price collusion', async () => {
    const players = await createPlayers(5);
    const product = await Product.findOne();

    // Hepsi aynı fiyatı belirlerse
    const suspiciousPrice = 123.456789; // çok spesifik

    const listings = await Promise.all(
      players.map(p =>
        MarketListing.create({
          sellerId: p.id,
          productId: product.id,
          quantity: 10,
          price: suspiciousPrice
        })
      )
    );

    // Pattern detection
    const flaggedListings = listings.filter(l => l.flagged);
    expect(flaggedListings.length).toBeGreaterThan(0);
  });
});
```

---

### 2. Inventory Exploit Tests

```javascript
describe('Inventory Exploits', () => {
  test('should prevent item duplication via race condition', async () => {
    const player = await Player.create({ username: 'exploiter' });
    const business = await Business.create({ playerId: player.id });

    await Inventory.create({
      businessId: business.id,
      productId: 1,
      quantity: 10
    });

    // Aynı anda iki satış işlemi
    const results = await Promise.allSettled([
      MarketService.sell(player.id, { productId: 1, quantity: 10 }),
      MarketService.sell(player.id, { productId: 1, quantity: 10 })
    ]);

    // Biri başarılı, biri başarısız olmalı
    const successful = results.filter(r => r.status === 'fulfilled').length;
    expect(successful).toBe(1);
  });

  test('should prevent negative inventory', async () => {
    const player = await Player.create({ username: 'cheater' });
    const business = await Business.create({ playerId: player.id });

    await Inventory.create({
      businessId: business.id,
      productId: 1,
      quantity: 5
    });

    // 10 satmaya çalış (sadece 5 var)
    await expect(
      MarketService.sell(player.id, { productId: 1, quantity: 10 })
    ).rejects.toThrow('Insufficient inventory');
  });

  test('should use pessimistic locking for critical operations', async () => {
    const player = await Player.create({ username: 'tester' });

    const result = await sequelize.transaction(async (t) => {
      const inventory = await Inventory.findOne({
        where: { ownerId: player.id, productId: 1 },
        lock: t.LOCK.UPDATE, // Pessimistic lock
        transaction: t
      });

      inventory.quantity -= 10;
      await inventory.save({ transaction: t });

      return inventory;
    });

    expect(result.quantity).toBeGreaterThanOrEqual(0);
  });
});
```

---

### 3. Currency Exploit Tests

```javascript
describe('Currency Exploits', () => {
  test('should prevent negative balance', async () => {
    const player = await Player.create({
      username: 'poorplayer',
      balance: 100
    });

    await expect(
      DealBaronAgent.instantBuy(player.id, 1, 1000) // çok pahalı
    ).rejects.toThrow('Insufficient funds');
  });

  test('should prevent integer overflow', async () => {
    const player = await Player.create({
      username: 'richplayer',
      balance: Number.MAX_SAFE_INTEGER
    });

    // Çok büyük miktarda satış
    const revenue = Number.MAX_SAFE_INTEGER;

    await expect(
      player.addBalance(revenue)
    ).rejects.toThrow('Balance overflow');
  });

  test('should handle floating point precision correctly', async () => {
    const player = await Player.create({
      username: 'preciseplayer',
      balance: 100.00
    });

    // 0.1 + 0.2 = 0.30000000000000004 bug'ı
    await player.addBalance(0.1);
    await player.addBalance(0.2);

    expect(player.balance).toBeCloseTo(100.3, 2);
  });
});
```

---

### 4. Rate Limiting Tests

```javascript
describe('Rate Limiting', () => {
  test('should limit API requests per user', async () => {
    const player = await Player.create({ username: 'spammer' });

    // 100 istek/dakika limiti
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(
        http.get('/api/market/listings', {
          headers: { 'Authorization': `Bearer ${player.token}` }
        })
      );
    }

    const results = await Promise.all(requests);
    const rateLimited = results.filter(r => r.status === 429).length;

    expect(rateLimited).toBeGreaterThan(0);
  });

  test('should prevent rapid listing creation', async () => {
    const player = await Player.create({ username: 'rapid' });

    // 10 ilan/dakika limiti
    for (let i = 0; i < 11; i++) {
      if (i < 10) {
        const listing = await MarketListing.create({
          sellerId: player.id,
          productId: 1,
          quantity: 1,
          price: 100
        });
        expect(listing).toBeTruthy();
      } else {
        await expect(
          MarketListing.create({
            sellerId: player.id,
            productId: 1,
            quantity: 1,
            price: 100
          })
        ).rejects.toThrow('Rate limit exceeded');
      }
    }
  });
});
```

---

## 👥 User Acceptance Test (UAT)

### Test Senaryoları

#### UAT-001: Yeni Oyuncu İlk Giriş
**Amaç:** Yeni oyuncunun oyuna başlaması ve ilk satışını yapması

**Adımlar:**
1. Kayıt olun (email, username, password)
2. Tutorial'ı tamamlayın
3. İlk çiftliğinizi seçin
4. İlk üretimi başlatın (örn: Buğday)
5. Üretimi bekleyin veya hızlandırıcı kullanın
6. Ürünü DealBaron'a satın
7. Kazandığınız para ile yeni ürün üretin

**Beklenen Sonuç:**
- Tüm adımlar sorunsuz tamamlanmalı
- UI açık ve anlaşılır olmalı
- Para kazanıldığında bakiye güncel lenmeli
- XP kazanılmalı

**Başarı Kriterleri:**
- [ ] Tutorial %100 tamamlanma
- [ ] İlk satış 5 dakikada yapılmalı
- [ ] Oyuncu kafası karışmamalı

---

#### UAT-002: Pazar Keşfi
**Amaç:** Seviye 5'e ulaşan oyuncunun pazarı keşfetmesi

**Adımlar:**
1. Seviye 5'e ulaşın (veya test için atla)
2. "Pazar Açıldı" bildirimini görün
3. Pazar sekmesine tıklayın
4. Diğer oyuncuların ilanlarını görün
5. Fiyatları karşılaştırın
6. En uygun fiyatlı ürünü satın alın
7. Kendi ürününüzü pazara listeleyin

**Beklenen Sonuç:**
- Pazar ekranı smooth açılmalı
- Fiyat karşılaştırması kolay olmalı
- Satın alma süreci hızlı olmalı

**Başarı Kriterleri:**
- [ ] Pazar browsing < 30 saniye
- [ ] İlk pazar alımı yapılmalı
- [ ] İlk ilan oluşturulmalı

---

#### UAT-003: Fiyat Stratejisi
**Amaç:** Deneyimli oyuncunun fiyat optimizasyonu yapması

**Adımlar:**
1. Ürün seçin (örn: Çelik)
2. 7 günlük fiyat grafiğine bakın
3. DealBaron fiyatını kontrol edin
4. Farklı markup değerleri deneyin
5. Talep tahmini grafiğini inceleyin
6. Optimal fiyatı belirleyin
7. İlan oluşturun
8. Satış performansını takip edin

**Beklenen Sonuç:**
- Fiyat grafiği bilgilendirici olmalı
- Talep tahmini doğru olmalı
- Oyuncu optimal fiyatı bulabilmeli

**Başarı Kriterleri:**
- [ ] Grafik anlaşılabilir
- [ ] 3 farklı fiyat test edilmeli
- [ ] Optimal fiyat %10 içinde bulunmalı

---

## 🤖 Test Otomasyonu

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:e2e

  economy-simulation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:economy-sim
      - name: Check economy health
        run: |
          if [ $(cat results/inflation.txt) -gt 10 ]; then
            echo "⚠️ High inflation detected!"
            exit 1
          fi

  load-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load-test.js
```

---

### Test Coverage Raporu

**Hedef Coverage:**
- Overall: %85+
- Critical Paths: %95+
- Economy Logic: %100

**Coverage Araçları:**
- Jest Coverage
- Istanbul
- Codecov

```bash
# Coverage komutları
npm run test:coverage
npm run test:coverage:report
```

---

## 📝 Test Dokümantasyonu

### Test Case Template

```markdown
## TC-XXX: [Test Case Adı]

**Öncelik:** [Kritik/Yüksek/Orta/Düşük]
**Kategori:** [Unit/Integration/E2E/UAT]
**Modül:** [Economy/Market/Player/etc]

### Amaç
[Test senaryosunun amacı]

### Ön Koşullar
- [ ] Koşul 1
- [ ] Koşul 2

### Test Adımları
1. Adım 1
2. Adım 2
3. Adım 3

### Beklenen Sonuç
[Ne olması bekleniyor]

### Gerçekleşen Sonuç
[Test sonrası doldurulacak]

### Durum
[ ] Passed
[ ] Failed
[ ] Blocked

### Notlar
[Ek bilgiler]
```

---

## 🎯 Test Execution Plan

### Sprint Bazında Test Planı

**Sprint 1-2:**
- Unit testler (%100 coverage)
- Ekonomi formül testleri

**Sprint 3-4:**
- Integration testler
- API testleri
- Ekonomi simülasyonu (ilk)

**Sprint 5-6:**
- E2E testler
- UI testleri
- Performance testleri (ilk)

**Sprint 7:**
- UAT
- Security testleri
- Exploit testleri

**Sprint 8:**
- Regression testleri
- Load testleri
- Beta test hazırlığı

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 1.0
