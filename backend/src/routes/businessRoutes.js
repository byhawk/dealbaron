const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const businessController = require('../controllers/businessController');
const { authenticate } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validate');

/**
 * GET /api/v1/business
 * Get all businesses of current player
 */
router.get('/', authenticate, businessController.getMyBusinesses);

/**
 * GET /api/v1/business/:id
 * Get business by ID
 */
router.get('/:id', authenticate, validateUUID('id'), businessController.getBusinessById);

/**
 * POST /api/v1/business
 * Create a new business
 */
router.post(
  '/',
  authenticate,
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Name must be between 3-100 characters'),
    body('businessType')
      .isIn(['farm', 'factory', 'warehouse'])
      .withMessage('Business type must be farm, factory, or warehouse'),
  ],
  validate,
  businessController.createBusiness
);

/**
 * GET /api/v1/business/:id/inventory
 * Get business inventory
 */
router.get(
  '/:id/inventory',
  authenticate,
  validateUUID('id'),
  businessController.getInventory
);

module.exports = router;
