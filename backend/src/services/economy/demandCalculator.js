/**
 * Talep Hesaplama Servisi
 * Formula: Q = a - bP
 *
 * @module services/economy/demandCalculator
 */

/**
 * Ürün talebi hesapla
 * @param {Object} product - Ürün bilgileri
 * @param {number} product.demandCoeffA - Taban talep katsayısı (a)
 * @param {number} product.demandCoeffB - Fiyat duyarlılık katsayısı (b)
 * @param {number} price - Ürün fiyatı
 * @returns {number} Talep miktarı (negatifse 0 döner)
 */
function calculateDemand(product, price) {
  // Parametre validasyonu
  if (!product || typeof product.demandCoeffA !== 'number' || typeof product.demandCoeffB !== 'number') {
    throw new Error('Invalid product parameters: demandCoeffA and demandCoeffB required');
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error('Invalid price: must be a non-negative number');
  }

  // Q = a - bP
  const demand = product.demandCoeffA - (product.demandCoeffB * price);

  // Negatif talep olamaz, sıfıra yuvarla
  return Math.max(0, demand);
}

/**
 * Optimal fiyat hesapla (maksimum gelir için)
 * Gelir = P * Q = P * (a - bP) = aP - bP²
 * dR/dP = a - 2bP = 0
 * P_optimal = a / (2b)
 *
 * @param {Object} product - Ürün bilgileri
 * @returns {number} Optimal fiyat
 */
function calculateOptimalPrice(product) {
  if (!product || typeof product.demandCoeffA !== 'number' || typeof product.demandCoeffB !== 'number') {
    throw new Error('Invalid product parameters');
  }

  if (product.demandCoeffB === 0) {
    throw new Error('demandCoeffB cannot be zero');
  }

  return product.demandCoeffA / (2 * product.demandCoeffB);
}

/**
 * Fiyat elastikiyeti hesapla
 * Elasticity = (dQ/dP) * (P/Q)
 * dQ/dP = -b
 * E = -b * P / Q
 *
 * @param {Object} product - Ürün bilgileri
 * @param {number} price - Fiyat
 * @returns {number} Fiyat elastikiyeti
 */
function calculatePriceElasticity(product, price) {
  const demand = calculateDemand(product, price);

  if (demand === 0) {
    return Infinity; // Talep sıfırsa elastikiyet sonsuz
  }

  const elasticity = Math.abs(-product.demandCoeffB * price / demand);
  return elasticity;
}

module.exports = {
  calculateDemand,
  calculateOptimalPrice,
  calculatePriceElasticity,
};
