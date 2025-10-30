const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get player from database
    const player = await db.Player.findByPk(decoded.playerId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    // Attach player to request
    req.player = player;
    req.playerId = player.id;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if player has market access
const requireMarketAccess = (req, res, next) => {
  if (!req.player) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.player.market_unlocked) {
    return next(
      new AppError('Market access locked', 403, {
        requirements: {
          level: { required: 5, current: req.player.level },
          transactions: { required: 10, current: req.player.total_transactions },
          revenue: { required: 10000, current: req.player.total_revenue },
          daysActive: { required: 3, current: req.player.days_active },
        },
      })
    );
  }

  next();
};

// Optional authentication (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const player = await db.Player.findByPk(decoded.playerId, {
        attributes: { exclude: ['password_hash'] },
      });

      if (player) {
        req.player = player;
        req.playerId = player.id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Generate JWT token
const generateToken = (playerId, expiresIn = '7d') => {
  return jwt.sign({ playerId }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = {
  authenticate,
  requireMarketAccess,
  optionalAuth,
  generateToken,
};
