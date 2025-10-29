const {
  calculateDemand,
  calculateOptimalPrice,
  calculatePriceElasticity,
} = require('../../../src/services/economy/demandCalculator');

describe('demandCalculator', () => {
  const testProduct = {
    demandCoeffA: 1000,
    demandCoeffB: 2,
  };

  describe('calculateDemand', () => {
    test('should calculate demand at zero price', () => {
      const demand = calculateDemand(testProduct, 0);
      expect(demand).toBe(1000);
    });

    test('should calculate demand at normal price', () => {
      const demand = calculateDemand(testProduct, 100);
      expect(demand).toBe(800); // 1000 - 2*100
    });

    test('should calculate demand at high price', () => {
      const demand = calculateDemand(testProduct, 400);
      expect(demand).toBe(200); // 1000 - 2*400
    });

    test('should return zero for maximum price', () => {
      const demand = calculateDemand(testProduct, 500);
      expect(demand).toBe(0); // 1000 - 2*500
    });

    test('should return zero for price above maximum (negative demand)', () => {
      const demand = calculateDemand(testProduct, 600);
      expect(demand).toBe(0); // Negatif talep sıfıra yuvarlanır
    });

    test('should handle floating point prices correctly', () => {
      const demand = calculateDemand(testProduct, 99.99);
      expect(demand).toBeCloseTo(800.02, 2);
    });

    test('should throw error for invalid product', () => {
      expect(() => calculateDemand(null, 100)).toThrow('Invalid product parameters');
      expect(() => calculateDemand({}, 100)).toThrow('Invalid product parameters');
      expect(() => calculateDemand({ demandCoeffA: 100 }, 100)).toThrow('Invalid product parameters');
    });

    test('should throw error for negative price', () => {
      expect(() => calculateDemand(testProduct, -10)).toThrow('Invalid price');
    });

    test('should throw error for non-numeric price', () => {
      expect(() => calculateDemand(testProduct, 'abc')).toThrow('Invalid price');
    });
  });

  describe('calculateOptimalPrice', () => {
    test('should calculate optimal price correctly', () => {
      const optimalPrice = calculateOptimalPrice(testProduct);
      expect(optimalPrice).toBe(250); // 1000 / (2*2)
    });

    test('should calculate optimal price for different product', () => {
      const product = {
        demandCoeffA: 500,
        demandCoeffB: 5,
      };
      const optimalPrice = calculateOptimalPrice(product);
      expect(optimalPrice).toBe(50); // 500 / (2*5)
    });

    test('should throw error for zero demandCoeffB', () => {
      const product = {
        demandCoeffA: 1000,
        demandCoeffB: 0,
      };
      expect(() => calculateOptimalPrice(product)).toThrow('demandCoeffB cannot be zero');
    });

    test('should throw error for invalid product', () => {
      expect(() => calculateOptimalPrice(null)).toThrow('Invalid product parameters');
    });
  });

  describe('calculatePriceElasticity', () => {
    test('should calculate elasticity at optimal price', () => {
      const elasticity = calculatePriceElasticity(testProduct, 250);
      expect(elasticity).toBe(1); // At optimal price, elasticity = 1
    });

    test('should calculate elasticity at low price', () => {
      const elasticity = calculatePriceElasticity(testProduct, 100);
      expect(elasticity).toBeCloseTo(0.25, 2); // -2 * 100 / 800 = -0.25 (abs)
    });

    test('should calculate elasticity at high price', () => {
      const elasticity = calculatePriceElasticity(testProduct, 400);
      expect(elasticity).toBe(4); // -2 * 400 / 200 = -4 (abs)
    });

    test('should return Infinity for zero demand', () => {
      const elasticity = calculatePriceElasticity(testProduct, 600); // Demand = 0
      expect(elasticity).toBe(Infinity);
    });
  });
});
