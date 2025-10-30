const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');
const db = require('../models');

/**
 * Register a new player
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check if player already exists
    const existingPlayer = await db.Player.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email }],
      },
    });

    if (existingPlayer) {
      throw new AppError('Username or email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create player
    const player = await db.Player.create({
      username,
      email,
      password_hash: passwordHash,
      display_name: displayName || username,
    });

    // Generate JWT token
    const token = generateToken(player.id);

    // Return player data (excluding password)
    const playerData = {
      id: player.id,
      username: player.username,
      email: player.email,
      displayName: player.display_name,
      level: player.level,
      experience: player.experience,
      balance: player.balance,
      trustScore: player.trust_score,
      marketUnlocked: player.market_unlocked,
    };

    res.status(201).json({
      success: true,
      data: {
        player: playerData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a player
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find player by username or email
    const player = await db.Player.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username },
          { email: username }, // Allow login with email too
        ],
      },
    });

    if (!player) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, player.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    player.last_login = new Date();
    await player.save();

    // Generate JWT token
    const token = generateToken(player.id);

    // Return player data (excluding password)
    const playerData = {
      id: player.id,
      username: player.username,
      email: player.email,
      displayName: player.display_name,
      level: player.level,
      experience: player.experience,
      balance: player.balance,
      trustScore: player.trust_score,
      marketUnlocked: player.market_unlocked,
      totalTransactions: player.total_transactions,
      totalRevenue: player.total_revenue,
      daysActive: player.days_active,
    };

    res.json({
      success: true,
      data: {
        player: playerData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current player profile
 * GET /api/v1/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const player = req.player;

    // Check if player should unlock market
    if (player.shouldUnlockMarket()) {
      player.market_unlocked = true;
      await player.save();
    }

    const playerData = {
      id: player.id,
      username: player.username,
      email: player.email,
      displayName: player.display_name,
      level: player.level,
      experience: player.experience,
      balance: player.balance,
      trustScore: player.trust_score,
      marketUnlocked: player.market_unlocked,
      totalTransactions: player.total_transactions,
      totalRevenue: player.total_revenue,
      daysActive: player.days_active,
      lastLogin: player.last_login,
      createdAt: player.created_at,
    };

    res.json({
      success: true,
      data: playerData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update player profile
 * PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const player = req.player;
    const { displayName } = req.body;

    if (displayName) {
      player.display_name = displayName;
      await player.save();
    }

    const playerData = {
      id: player.id,
      username: player.username,
      email: player.email,
      displayName: player.display_name,
      level: player.level,
      balance: player.balance,
    };

    res.json({
      success: true,
      data: playerData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change player password
 * POST /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const player = req.player;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, player.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    player.password_hash = await bcrypt.hash(newPassword, salt);
    await player.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
