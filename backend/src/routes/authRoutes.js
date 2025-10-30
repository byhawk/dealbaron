const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/v1/auth/register
 * Register a new player
 */
router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3-50 characters')
      .isAlphanumeric()
      .withMessage('Username must be alphanumeric'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Display name must be max 100 characters'),
  ],
  validate,
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Login a player
 */
router.post(
  '/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

/**
 * GET /api/v1/auth/me
 * Get current player profile
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * PUT /api/v1/auth/profile
 * Update player profile
 */
router.put(
  '/profile',
  authenticate,
  [
    body('displayName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Display name must be max 100 characters'),
  ],
  validate,
  authController.updateProfile
);

/**
 * POST /api/v1/auth/change-password
 * Change player password
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
