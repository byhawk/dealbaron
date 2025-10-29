/**
 * Fiyat Hesaplama Servisi
 * Formula: FinalPrice = BasePrice × (1 + Markup%) × (1 ± ElasticityFactor × MarketPressure)
 *
 * @module services/economy/priceCalculator
 */

/**
 * Final fiyat hesapla
 * @param {number} basePrice - Ürünün baz fiyatı
 * @param {number} markup - Oyuncunun belirlediği kâr oranı (0.2 = %20)
 * @param {number} elasticityFactor - Ürünün elastikiyet faktörü (0.1-2.0)
 * @param {number} marketPressure - Piyasa baskısı (-1.0 ile +2.0 arası)
 * @returns {number} Hesaplanan nihai fiyat
 */
function calculatePrice(basePrice, markup, elasticityFactor, marketPressure) {
  // Parametre validasyonu
  if (typeof basePrice !== 'number' || basePrice <= 0) {
    throw new Error('Invalid basePrice: must be a positive number');
  }

  if (typeof markup !== 'number') {
    throw new Error('Invalid markup: must be a number');
  }

  if (typeof elasticityFactor !== 'number' || elasticityFactor < 0.01 || elasticityFactor > 2.0) {
    throw new Error('Invalid elasticityFactor: must be between 0.01 and 2.0');
  }

  if (typeof marketPressure !== 'number') {
    throw new Error('Invalid marketPressure: must be a number');
  }

  // Markup limitlerini kontrol et
  if (markup < -0.5 || markup > 5.0) {
    throw new Error('Markup must be between -50% and 500%');
  }

  // Market pressure limitlerini kontrol et
  if (marketPressure < -1.0 || marketPressure > 2.0) {
    marketPressure = Math.max(-1.0, Math.min(2.0, marketPressure));
  }

  // Fiyat hesaplama
  const priceWithMarkup = basePrice * (1 + markup);
  const pressureFactor = 1 + (elasticityFactor * marketPressure);
  const finalPrice = priceWithMarkup * pressureFactor;

  // Negatif fiyat olamaz
  return Math.max(0.01, finalPrice);
}

/**
 * Gelir hesapla
 * @param {number} price - Fiyat
 * @param {number} quantity - Miktar
 * @returns {number} Toplam gelir
 */
function calculateRevenue(price, quantity) {
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Invalid price');
  }

  if (typeof quantity !== 'number' || quantity < 0) {
    throw new Error('Invalid quantity');
  }

  return price * quantity;
}

/**
 * Kar marjı hesapla
 * @param {number} sellingPrice - Satış fiyatı
 * @param {number} cost - Maliyet
 * @returns {number} Kar marjı yüzdesi
 */
function calculateProfitMargin(sellingPrice, cost) {
  if (cost === 0) {
    return Infinity;
  }

  return ((sellingPrice - cost) / cost) * 100;
}

/**
 * Oyuncunun belirleyebileceği minimum ve maksimum fiyatları hesapla
 * DealBaron kuralı: Oyuncu fiyatı DealBaron ortalamasının %80-90'ı arasında olmalı
 *
 * @param {number} dealBaronPrice - DealBaron'un ortalama fiyatı
 * @returns {Object} {min, max} fiyat aralığı
 */
function calculatePlayerPriceRange(dealBaronPrice) {
  if (typeof dealBaronPrice !== 'number' || dealBaronPrice <= 0) {
    throw new Error('Invalid DealBaron price');
  }

  return {
    min: dealBaronPrice * 0.80,
    max: dealBaronPrice * 0.90,
  };
}

/**
 * Fiyatın DealBaron kurallarına uygun olup olmadığını kontrol et
 * @param {number} playerPrice - Oyuncunun belirlediği fiyat
 * @param {number} dealBaronPrice - DealBaron ortalama fiyatı
 * @returns {boolean} Geçerli mi?
 */
function validatePlayerPrice(playerPrice, dealBaronPrice) {
  const range = calculatePlayerPriceRange(dealBaronPrice);
  return playerPrice >= range.min && playerPrice <= range.max;
}

module.exports = {
  calculatePrice,
  calculateRevenue,
  calculateProfitMargin,
  calculatePlayerPriceRange,
  validatePlayerPrice,
};
