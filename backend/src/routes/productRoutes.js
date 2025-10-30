const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const productController = require('../controllers/productController');
const { optionalAuth } = require('../middleware/auth');
const { validate, validateUUID, validatePagination } = require('../middleware/validate');

/**
 * GET /api/v1/products
 * Get all products with optional filtering
 */
router.get(
  '/',
  optionalAuth,
  validatePagination,
  [
    query('category')
      .optional()
      .isIn(['raw_material', 'intermediate', 'finished_good', 'luxury'])
      .withMessage('Invalid category'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
  validate,
  productController.getAllProducts
);

/**
 * GET /api/v1/products/:id
 * Get product details by ID
 */
router.get(
  '/:id',
  optionalAuth,
  validateUUID('id'),
  productController.getProductById
);

/**
 * GET /api/v1/products/:id/price-history
 * Get product price history for charts (last 7 days by default)
 */
router.get(
  '/:id/price-history',
  optionalAuth,
  validateUUID('id'),
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Days must be between 1 and 30'),
  ],
  validate,
  productController.getPriceHistory
);

/**
 * GET /api/v1/products/:id/stats
 * Get product market statistics (last 24h activity)
 */
router.get(
  '/:id/stats',
  optionalAuth,
  validateUUID('id'),
  productController.getProductStats
);

/**
 * GET /api/v1/products/:id/calculate-price
 * Calculate price with market pressure simulation
 */
router.get(
  '/:id/calculate-price',
  optionalAuth,
  validateUUID('id'),
  [
    query('markup')
      .optional()
      .isFloat({ min: -1, max: 5 })
      .withMessage('Markup must be between -1 and 5'),
    query('supply')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Supply must be a positive integer'),
    query('avgDemand')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Average demand must be a positive integer'),
  ],
  validate,
  productController.calculatePrice
);

module.exports = router;
