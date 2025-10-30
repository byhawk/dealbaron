const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const dealBaronController = require('../controllers/dealBaronController');
const { authenticate } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validate');
const { marketListingLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/v1/dealbaron/price/:productId
 * Get DealBaron price for a product
 */
router.get(
  '/price/:productId',
  authenticate,
  validateUUID('productId'),
  dealBaronController.getPrice
);

/**
 * POST /api/v1/dealbaron/buy
 * Buy from DealBaron
 */
router.post(
  '/buy',
  authenticate,
  marketListingLimiter,
  [
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('businessId').isUUID().withMessage('Business ID must be a valid UUID'),
  ],
  validate,
  dealBaronController.buy
);

/**
 * POST /api/v1/dealbaron/sell
 * Sell to DealBaron
 */
router.post(
  '/sell',
  authenticate,
  marketListingLimiter,
  [
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('businessId').isUUID().withMessage('Business ID must be a valid UUID'),
  ],
  validate,
  dealBaronController.sell
);

module.exports = router;
