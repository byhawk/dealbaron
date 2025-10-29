/**
 * Market Pressure (Piyasa Baskısı) Hesaplama Servisi
 * Formula: MarketPressure = (Supply - AvgDemand) / AvgDemand
 *
 * @module services/economy/marketPressureCalculator
 */

/**
 * Piyasa baskısını hesapla
 * Pozitif değer = Arz fazlası (fiyat düşmeli)
 * Negatif değer = Talep fazlası (fiyat yükselmeli)
 *
 * @param {number} supply - Toplam arz (stok)
 * @param {number} avgDemand - Ortalama talep
 * @returns {number} Piyasa baskısı (-1.0 ile +2.0 arası)
 */
function calculateMarketPressure(supply, avgDemand) {
  if (typeof supply !== 'number' || supply < 0) {
    throw new Error('Invalid supply: must be a non-negative number');
  }

  if (typeof avgDemand !== 'number' || avgDemand < 0) {
    throw new Error('Invalid avgDemand: must be a non-negative number');
  }

  // Talep sıfırsa, arz varsa maksimum baskı
  if (avgDemand === 0) {
    return supply > 0 ? 2.0 : 0;
  }

  const pressure = (supply - avgDemand) / avgDemand;

  // -1.0 ile +2.0 arasında sınırla
  return Math.max(-1.0, Math.min(2.0, pressure));
}

/**
 * Piyasa durumunu kategorize et
 * @param {number} pressure - Piyasa baskısı
 * @returns {string} Durum: 'oversupply', 'balanced', 'high_demand'
 */
function getMarketCondition(pressure) {
  if (pressure > 0.5) {
    return 'oversupply'; // Arz fazlası
  } else if (pressure < -0.3) {
    return 'high_demand'; // Talep patlaması
  } else {
    return 'balanced'; // Dengede
  }
}

/**
 * Fiyat trend'ini belirle
 * @param {number} pressure - Piyasa baskısı
 * @returns {string} Trend: 'rising', 'falling', 'stable'
 */
function getPriceTrend(pressure) {
  if (pressure > 0.5) {
    return 'falling'; // Fiyat düşüyor
  } else if (pressure < -0.3) {
    return 'rising'; // Fiyat yükseliyor
  } else {
    return 'stable'; // Fiyat stabil
  }
}

/**
 * Satış hızını (velocity) hesapla
 * @param {number} salesLast24h - Son 24 saatte yapılan satış miktarı
 * @param {number} totalSupply - Toplam stok
 * @returns {number} Satış hızı (günlük devir oranı)
 */
function calculateSalesVelocity(salesLast24h, totalSupply) {
  if (typeof salesLast24h !== 'number' || salesLast24h < 0) {
    throw new Error('Invalid salesLast24h');
  }

  if (typeof totalSupply !== 'number' || totalSupply < 0) {
    throw new Error('Invalid totalSupply');
  }

  if (totalSupply === 0) {
    return 0;
  }

  // Günlük devir oranı
  return salesLast24h / totalSupply;
}

/**
 * Stok tükenme süresini tahmin et (gün)
 * @param {number} currentStock - Mevcut stok
 * @param {number} dailySales - Günlük ortalama satış
 * @returns {number} Tahmini tükenme süresi (gün)
 */
function estimateStockoutDays(currentStock, dailySales) {
  if (typeof currentStock !== 'number' || currentStock < 0) {
    throw new Error('Invalid currentStock');
  }

  if (typeof dailySales !== 'number' || dailySales < 0) {
    throw new Error('Invalid dailySales');
  }

  if (dailySales === 0) {
    return Infinity; // Satış yoksa tükenmez
  }

  return currentStock / dailySales;
}

/**
 * Piyasa sağlık skoru hesapla (0-100)
 * 100 = Mükemmel denge
 * 0 = Kötü durum (çok fazla arz veya talep)
 *
 * @param {number} pressure - Piyasa baskısı
 * @returns {number} Sağlık skoru (0-100)
 */
function calculateMarketHealthScore(pressure) {
  // İdeal baskı = 0 (tam denge)
  // -0.3 ile +0.5 arası "sağlıklı" kabul edilir
  const idealMin = -0.3;
  const idealMax = 0.5;

  if (pressure >= idealMin && pressure <= idealMax) {
    // Sağlıklı bölge: 80-100 puan
    const normalized = (pressure - idealMin) / (idealMax - idealMin);
    return 80 + (20 * (1 - Math.abs(normalized - 0.5) * 2));
  }

  // Sağlıksız bölge: pressure ne kadar uçtaysa skor o kadar düşük
  const deviation = Math.abs(pressure) - Math.max(Math.abs(idealMin), idealMax);
  const score = Math.max(0, 80 - (deviation * 40));
  return score;
}

module.exports = {
  calculateMarketPressure,
  getMarketCondition,
  getPriceTrend,
  calculateSalesVelocity,
  estimateStockoutDays,
  calculateMarketHealthScore,
};
