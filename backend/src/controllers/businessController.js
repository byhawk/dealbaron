const { AppError } = require('../middleware/errorHandler');
const db = require('../models');

/**
 * Get all businesses of current player
 * GET /api/v1/business
 */
const getMyBusinesses = async (req, res, next) => {
  try {
    const playerId = req.playerId;

    const businesses = await db.Business.findAll({
      where: { player_id: playerId },
      include: [
        {
          model: db.Worker,
          as: 'workers',
          where: { status: 'active' },
          required: false,
        },
      ],
      order: [['created_at', 'ASC']],
    });

    // Calculate used capacity for each business
    const businessesWithCapacity = await Promise.all(
      businesses.map(async (business) => {
        const usedCapacity = await business.calculateUsedCapacity();
        const freeCapacity = await business.getFreeCapacity();

        return {
          ...business.toJSON(),
          usedCapacity: Math.round(usedCapacity * 100) / 100,
          freeCapacity: Math.round(freeCapacity * 100) / 100,
          capacityPercentage: Math.round((usedCapacity / parseFloat(business.warehouse_capacity)) * 100),
        };
      })
    );

    res.json({
      success: true,
      data: businessesWithCapacity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get business by ID
 * GET /api/v1/business/:id
 */
const getBusinessById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const playerId = req.playerId;

    const business = await db.Business.findOne({
      where: { id, player_id: playerId },
      include: [
        {
          model: db.Worker,
          as: 'workers',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    const usedCapacity = await business.calculateUsedCapacity();
    const freeCapacity = await business.getFreeCapacity();
    const workerBoost = await business.getWorkerBoost();

    res.json({
      success: true,
      data: {
        ...business.toJSON(),
        usedCapacity: Math.round(usedCapacity * 100) / 100,
        freeCapacity: Math.round(freeCapacity * 100) / 100,
        capacityPercentage: Math.round((usedCapacity / parseFloat(business.warehouse_capacity)) * 100),
        workerBoost: Math.round(workerBoost * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new business
 * POST /api/v1/business
 */
const createBusiness = async (req, res, next) => {
  try {
    const { name, businessType } = req.body;
    const playerId = req.playerId;

    // Check if player already has a business of this type
    const existingBusiness = await db.Business.findOne({
      where: { player_id: playerId, business_type: businessType },
    });

    if (existingBusiness) {
      throw new AppError(`You already have a ${businessType} business`, 400);
    }

    const business = await db.Business.create({
      player_id: playerId,
      name,
      business_type: businessType,
    });

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get business inventory
 * GET /api/v1/business/:id/inventory
 */
const getInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const playerId = req.playerId;

    const business = await db.Business.findOne({
      where: { id, player_id: playerId },
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    const inventory = await db.Inventory.findAll({
      where: { business_id: id },
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'image_url', 'volume', 'base_price'],
        },
      ],
      order: [[{ model: db.Product, as: 'product' }, 'name', 'ASC']],
    });

    const inventoryWithVolume = inventory.map((item) => ({
      ...item.toJSON(),
      totalVolume: Math.round(parseFloat(item.product.volume) * item.quantity * 100) / 100,
      estimatedValue: Math.round(parseFloat(item.product.base_price) * item.quantity * 100) / 100,
    }));

    res.json({
      success: true,
      data: {
        businessId: id,
        businessName: business.name,
        inventory: inventoryWithVolume,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyBusinesses,
  getBusinessById,
  createBusiness,
  getInventory,
};
