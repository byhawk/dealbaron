const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const marketController = require('../controllers/marketController');
const { authenticate, requireMarketAccess } = require('../middleware/auth');
const { validate, validateUUID, validatePagination } = require('../middleware/validate');
const { marketListingLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/v1/market/listings
 * Get all active market listings
 */
router.get(
  '/listings',
  authenticate,
  requireMarketAccess,
  validatePagination,
  [
    query('productId').optional().isUUID().withMessage('Product ID must be a valid UUID'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be >= 0'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be >= 0'),
    query('sortBy')
      .optional()
      .isIn(['price_asc', 'price_desc', 'newest'])
      .withMessage('Sort by must be price_asc, price_desc, or newest'),
  ],
  validate,
  marketController.getMarketListings
);

/**
 * GET /api/v1/market/my-listings
 * Get my listings
 */
router.get(
  '/my-listings',
  authenticate,
  requireMarketAccess,
  validatePagination,
  [
    query('status')
      .optional()
      .isIn(['active', 'sold', 'cancelled', 'expired'])
      .withMessage('Invalid status'),
  ],
  validate,
  marketController.getMyListings
);

/**
 * POST /api/v1/market/listings
 * Create a new market listing
 */
router.post(
  '/listings',
  authenticate,
  requireMarketAccess,
  marketListingLimiter,
  [
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('unitPrice').isFloat({ min: 0.01 }).withMessage('Unit price must be at least 0.01'),
    body('businessId').isUUID().withMessage('Business ID must be a valid UUID'),
  ],
  validate,
  marketController.createListing
);

/**
 * DELETE /api/v1/market/listings/:id
 * Cancel a listing
 */
router.delete(
  '/listings/:id',
  authenticate,
  requireMarketAccess,
  validateUUID('id'),
  marketController.cancelListing
);

/**
 * POST /api/v1/market/buy/:id
 * Buy from market listing
 */
router.post(
  '/buy/:id',
  authenticate,
  requireMarketAccess,
  marketListingLimiter,
  validateUUID('id'),
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('businessId').isUUID().withMessage('Business ID must be a valid UUID'),
  ],
  validate,
  marketController.buyFromMarket
);

module.exports = router;
