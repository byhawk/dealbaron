const { AppError } = require('../middleware/errorHandler');
const db = require('../models');

/**
 * Start production
 * POST /api/v1/production/start
 */
const startProduction = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { businessId, productId, quantity } = req.body;
    const playerId = req.playerId;

    // Get business and verify ownership
    const business = await db.Business.findOne({
      where: { id: businessId, player_id: playerId },
      transaction,
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    // Get product
    const product = await db.Product.findByPk(productId, { transaction });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isProducible()) {
      throw new AppError('This product cannot be produced', 400);
    }

    // Get player
    const player = await db.Player.findByPk(playerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Calculate production cost
    const totalCost = parseFloat(product.production_cost) * quantity;

    if (parseFloat(player.balance) < totalCost) {
      throw new AppError('Insufficient balance for production cost', 400, {
        required: totalCost,
        available: player.balance,
      });
    }

    // Check warehouse capacity for finished goods
    const productVolume = parseFloat(product.volume);
    const canStore = await business.canStore(productVolume, quantity);

    if (!canStore) {
      throw new AppError('Insufficient warehouse capacity for finished goods', 400);
    }

    // Get worker boost
    const workerBoost = await business.getWorkerBoost();

    // Calculate production time
    const baseProductionTime = product.production_time * quantity;
    const actualProductionTime = Math.floor(baseProductionTime / workerBoost);

    // Deduct production cost
    player.balance = parseFloat(player.balance) - totalCost;
    await player.save({ transaction });

    // Create production job
    const job = await db.ProductionJob.create(
      {
        business_id: businessId,
        product_id: productId,
        quantity,
        base_production_time: baseProductionTime,
        actual_production_time: actualProductionTime,
        worker_boost: workerBoost,
        status: 'in_progress',
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Production started',
      data: {
        job: {
          ...job.toJSON(),
          progress: 0,
          remainingTime: actualProductionTime,
        },
        cost: totalCost,
        newBalance: player.balance,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get active production jobs
 * GET /api/v1/production/active/:businessId
 */
const getActiveProduction = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const playerId = req.playerId;

    const business = await db.Business.findOne({
      where: { id: businessId, player_id: playerId },
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    const jobs = await db.ProductionJob.findActiveByBusiness(businessId);

    const jobsWithProgress = jobs.map((job) => ({
      ...job.toJSON(),
      progress: job.getProgress(),
      remainingTime: job.getRemainingTime(),
      isCompleted: job.isCompleted(),
    }));

    res.json({
      success: true,
      data: jobsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get completed production jobs (ready to collect)
 * GET /api/v1/production/completed/:businessId
 */
const getCompletedProduction = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const playerId = req.playerId;

    const business = await db.Business.findOne({
      where: { id: businessId, player_id: playerId },
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    const jobs = await db.ProductionJob.findCompletedByBusiness(businessId);

    const jobsWithProgress = jobs.map((job) => ({
      ...job.toJSON(),
      progress: 100,
      remainingTime: 0,
    }));

    res.json({
      success: true,
      data: jobsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Collect finished production
 * POST /api/v1/production/collect/:jobId
 */
const collectProduction = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { jobId } = req.params;
    const playerId = req.playerId;

    const job = await db.ProductionJob.findByPk(jobId, {
      include: [
        {
          model: db.Business,
          as: 'business',
          where: { player_id: playerId },
        },
        {
          model: db.Product,
          as: 'product',
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!job) {
      throw new AppError('Production job not found or not owned by player', 404);
    }

    if (job.status !== 'completed') {
      // Check if production is actually complete
      if (job.isCompleted() && job.status === 'in_progress') {
        await job.complete();
      } else {
        throw new AppError('Production not yet complete', 400, {
          remainingTime: job.getRemainingTime(),
        });
      }
    }

    // Add to inventory
    let inventory = await db.Inventory.findOne({
      where: {
        business_id: job.business_id,
        product_id: job.product_id,
      },
      transaction,
    });

    if (inventory) {
      await inventory.addQuantity(job.quantity);
    } else {
      inventory = await db.Inventory.create(
        {
          business_id: job.business_id,
          product_id: job.product_id,
          quantity: job.quantity,
        },
        { transaction }
      );
    }

    // Mark as collected
    await job.collect();

    // Create transaction record for production
    await db.Transaction.create(
      {
        buyer_id: playerId,
        seller_id: null,
        product_id: job.product_id,
        market_listing_id: null,
        quantity: job.quantity,
        unit_price: job.product.production_cost,
        transaction_type: 'production',
      },
      { transaction }
    );

    // Award XP
    const player = await db.Player.findByPk(playerId, { transaction });
    const xpGained = job.quantity * 10; // 10 XP per item produced
    await player.addExperience(xpGained);

    await transaction.commit();

    res.json({
      success: true,
      message: 'Production collected successfully',
      data: {
        product: job.product.name,
        quantity: job.quantity,
        xpGained,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Cancel production (refund partial cost)
 * DELETE /api/v1/production/:jobId
 */
const cancelProduction = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { jobId } = req.params;
    const playerId = req.playerId;

    const job = await db.ProductionJob.findByPk(jobId, {
      include: [
        {
          model: db.Business,
          as: 'business',
          where: { player_id: playerId },
        },
        {
          model: db.Product,
          as: 'product',
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!job) {
      throw new AppError('Production job not found or not owned by player', 404);
    }

    if (job.status !== 'in_progress') {
      throw new AppError('Only in-progress jobs can be cancelled', 400);
    }

    // Calculate refund (50% of remaining time)
    const progress = job.getProgress();
    const totalCost = parseFloat(job.product.production_cost) * job.quantity;
    const refund = totalCost * (100 - progress) / 100 * 0.5;

    // Refund to player
    const player = await db.Player.findByPk(playerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    player.balance = parseFloat(player.balance) + refund;
    await player.save({ transaction });

    // Cancel job
    await job.cancel();

    await transaction.commit();

    res.json({
      success: true,
      message: 'Production cancelled',
      data: {
        refund: Math.round(refund * 100) / 100,
        newBalance: player.balance,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  startProduction,
  getActiveProduction,
  getCompletedProduction,
  collectProduction,
  cancelProduction,
};
