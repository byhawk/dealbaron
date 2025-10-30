const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const productionController = require('../controllers/productionController');
const { authenticate } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validate');
const { productionLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/v1/production/start
 * Start production
 */
router.post(
  '/start',
  authenticate,
  productionLimiter,
  [
    body('businessId').isUUID().withMessage('Business ID must be a valid UUID'),
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  productionController.startProduction
);

/**
 * GET /api/v1/production/active/:businessId
 * Get active production jobs
 */
router.get(
  '/active/:businessId',
  authenticate,
  validateUUID('businessId'),
  productionController.getActiveProduction
);

/**
 * GET /api/v1/production/completed/:businessId
 * Get completed production jobs
 */
router.get(
  '/completed/:businessId',
  authenticate,
  validateUUID('businessId'),
  productionController.getCompletedProduction
);

/**
 * POST /api/v1/production/collect/:jobId
 * Collect finished production
 */
router.post(
  '/collect/:jobId',
  authenticate,
  productionLimiter,
  validateUUID('jobId'),
  productionController.collectProduction
);

/**
 * DELETE /api/v1/production/:jobId
 * Cancel production
 */
router.delete(
  '/:jobId',
  authenticate,
  validateUUID('jobId'),
  productionController.cancelProduction
);

module.exports = router;
