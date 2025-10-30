const db = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * Calculate DealBaron price for a product
 * Based on average of last 100 transactions (weighted by quantity)
 */
const calculateDealBaronPrice = async (productId) => {
  const avgPrice = await db.Transaction.calculateAveragePrice(productId, 100);

  if (!avgPrice) {
    // No transaction history, use base price
    const product = await db.Product.findByPk(productId);
    return product ? parseFloat(product.base_price) : null;
  }

  return avgPrice;
};

/**
 * Get DealBaron price for a product
 * GET /api/v1/dealbaron/price/:productId
 */
const getDealBaronPrice = async (productId) => {
  const product = await db.Product.findByPk(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const dealBaronPrice = await calculateDealBaronPrice(productId);

  return {
    productId,
    productName: product.name,
    dealBaronPrice: Math.round(dealBaronPrice * 100) / 100,
    basePrice: product.base_price,
    playerPriceRange: {
      min: Math.round(dealBaronPrice * 0.8 * 100) / 100,
      max: Math.round(dealBaronPrice * 0.9 * 100) / 100,
    },
  };
};

/**
 * Buy from DealBaron
 * Player purchases products at DealBaron's average price
 */
const buyFromDealBaron = async (playerId, productId, quantity, businessId) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Get player
    const player = await db.Player.findByPk(playerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    // Get product
    const product = await db.Product.findByPk(productId, { transaction });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Get business
    const business = await db.Business.findOne({
      where: { id: businessId, player_id: playerId },
      transaction,
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    // Calculate DealBaron price
    const dealBaronPrice = await calculateDealBaronPrice(productId);
    const totalCost = dealBaronPrice * quantity;

    // Check player balance
    if (parseFloat(player.balance) < totalCost) {
      throw new AppError('Insufficient balance', 400, {
        required: totalCost,
        available: player.balance,
      });
    }

    // Check warehouse capacity
    const productVolume = parseFloat(product.volume);
    const canStore = await business.canStore(productVolume, quantity);

    if (!canStore) {
      throw new AppError('Insufficient warehouse capacity', 400);
    }

    // Deduct payment
    player.balance = parseFloat(player.balance) - totalCost;
    player.total_transactions += 1;
    await player.save({ transaction });

    // Add to inventory
    let inventory = await db.Inventory.findOne({
      where: { business_id: businessId, product_id: productId },
      transaction,
    });

    if (inventory) {
      await inventory.addQuantity(quantity);
    } else {
      inventory = await db.Inventory.create(
        {
          business_id: businessId,
          product_id: productId,
          quantity,
        },
        { transaction }
      );
    }

    // Create transaction record (seller_id = NULL for DealBaron)
    const txRecord = await db.Transaction.create(
      {
        buyer_id: playerId,
        seller_id: null,
        product_id: productId,
        market_listing_id: null,
        quantity,
        unit_price: dealBaronPrice,
        transaction_type: 'dealbaron_buy',
      },
      { transaction }
    );

    await transaction.commit();

    return {
      transaction: txRecord,
      totalCost: Math.round(totalCost * 100) / 100,
      unitPrice: Math.round(dealBaronPrice * 100) / 100,
      newBalance: Math.round(parseFloat(player.balance) * 100) / 100,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Sell to DealBaron
 * Player sells products at DealBaron's average price (no market fee)
 */
const sellToDealBaron = async (playerId, productId, quantity, businessId) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Get player
    const player = await db.Player.findByPk(playerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    // Get product
    const product = await db.Product.findByPk(productId, { transaction });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Get business and inventory
    const business = await db.Business.findOne({
      where: { id: businessId, player_id: playerId },
      transaction,
    });

    if (!business) {
      throw new AppError('Business not found or not owned by player', 404);
    }

    const inventory = await db.Inventory.findOne({
      where: { business_id: businessId, product_id: productId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new AppError('Insufficient inventory', 400, {
        required: quantity,
        available: inventory?.quantity || 0,
      });
    }

    // Calculate DealBaron price
    const dealBaronPrice = await calculateDealBaronPrice(productId);
    const totalRevenue = dealBaronPrice * quantity;

    // Remove from inventory
    await inventory.removeQuantity(quantity);

    // Add revenue to player (no market fee for DealBaron sales)
    player.balance = parseFloat(player.balance) + totalRevenue;
    player.total_transactions += 1;
    player.total_revenue = parseFloat(player.total_revenue) + totalRevenue;
    await player.save({ transaction });

    // Create transaction record (buyer_id = NULL for DealBaron)
    const txRecord = await db.Transaction.create(
      {
        buyer_id: null,
        seller_id: playerId,
        product_id: productId,
        market_listing_id: null,
        quantity,
        unit_price: dealBaronPrice,
        transaction_type: 'dealbaron_sell',
      },
      { transaction }
    );

    await transaction.commit();

    return {
      transaction: txRecord,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      unitPrice: Math.round(dealBaronPrice * 100) / 100,
      newBalance: Math.round(parseFloat(player.balance) * 100) / 100,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  calculateDealBaronPrice,
  getDealBaronPrice,
  buyFromDealBaron,
  sellToDealBaron,
};
