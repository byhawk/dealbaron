const { AppError } = require('../middleware/errorHandler');
const db = require('../models');
const { Op } = require('sequelize');

/**
 * Get all market listings with filters
 * GET /api/v1/market/listings
 */
const getMarketListings = async (req, res, next) => {
  try {
    const { productId, minPrice, maxPrice, sortBy } = req.query;
    const { limit, offset } = req.pagination;

    const where = { status: 'active' };

    if (productId) {
      where.product_id = productId;
    }

    if (minPrice || maxPrice) {
      where.unit_price = {};
      if (minPrice) where.unit_price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.unit_price[Op.lte] = parseFloat(maxPrice);
    }

    // Check for expired listings
    where.expires_at = { [Op.gt]: new Date() };

    const orderBy = [];
    if (sortBy === 'price_asc') {
      orderBy.push(['unit_price', 'ASC']);
    } else if (sortBy === 'price_desc') {
      orderBy.push(['unit_price', 'DESC']);
    } else if (sortBy === 'newest') {
      orderBy.push(['created_at', 'DESC']);
    } else {
      orderBy.push(['unit_price', 'ASC']); // Default: cheapest first
    }

    const { count, rows: listings } = await db.MarketListing.findAndCountAll({
      where,
      limit,
      offset,
      order: orderBy,
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'image_url', 'volume'],
        },
        {
          model: db.Player,
          as: 'seller',
          attributes: ['id', 'username', 'display_name', 'trust_score'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total: count,
          page: req.pagination.page,
          limit: req.pagination.limit,
          pages: Math.ceil(count / req.pagination.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my listings
 * GET /api/v1/market/my-listings
 */
const getMyListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { limit, offset } = req.pagination;

    const where = { seller_id: req.playerId };

    if (status) {
      where.status = status;
    }

    const { count, rows: listings } = await db.MarketListing.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'image_url'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total: count,
          page: req.pagination.page,
          limit: req.pagination.limit,
          pages: Math.ceil(count / req.pagination.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a market listing
 * POST /api/v1/market/listings
 */
const createListing = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { productId, quantity, unitPrice, businessId } = req.body;
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

    // Check inventory
    const inventory = await db.Inventory.findOne({
      where: { business_id: businessId, product_id: productId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new AppError('Insufficient inventory', 400);
    }

    // Get DealBaron average price for validation
    const dealBaronPrice = await db.Transaction.calculateAveragePrice(productId, 100);

    if (!dealBaronPrice) {
      throw new AppError('No market data available for this product', 400);
    }

    // Validate price (80-90% of DealBaron price)
    const minPrice = dealBaronPrice * 0.8;
    const maxPrice = dealBaronPrice * 0.9;

    if (unitPrice < minPrice || unitPrice > maxPrice) {
      throw new AppError(
        `Price must be between ${minPrice.toFixed(2)} and ${maxPrice.toFixed(2)} (80-90% of DealBaron price)`,
        400,
        { dealBaronPrice, minPrice, maxPrice }
      );
    }

    // Remove from inventory
    await inventory.removeQuantity(quantity);

    // Create listing
    const listing = await db.MarketListing.create(
      {
        seller_id: playerId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice,
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch created listing with associations
    const createdListing = await db.MarketListing.findByPk(listing.id, {
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'image_url'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdListing,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Cancel a listing
 * DELETE /api/v1/market/listings/:id
 */
const cancelListing = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const playerId = req.playerId;

    const listing = await db.MarketListing.findOne({
      where: { id, seller_id: playerId },
      include: [{ model: db.Product, as: 'product' }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!listing) {
      throw new AppError('Listing not found or not owned by player', 404);
    }

    if (listing.status !== 'active') {
      throw new AppError('Only active listings can be cancelled', 400);
    }

    // Get player's first business (for returning inventory)
    const business = await db.Business.findOne({
      where: { player_id: playerId },
      transaction,
    });

    if (!business) {
      throw new AppError('Player has no business to return inventory', 400);
    }

    // Return items to inventory
    let inventory = await db.Inventory.findOne({
      where: { business_id: business.id, product_id: listing.product_id },
      transaction,
    });

    if (inventory) {
      await inventory.addQuantity(listing.quantity);
    } else {
      inventory = await db.Inventory.create(
        {
          business_id: business.id,
          product_id: listing.product_id,
          quantity: listing.quantity,
        },
        { transaction }
      );
    }

    // Cancel listing
    await listing.cancel();

    await transaction.commit();

    res.json({
      success: true,
      message: 'Listing cancelled successfully',
      data: { listing },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Buy from market listing
 * POST /api/v1/market/buy/:id
 */
const buyFromMarket = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { quantity, businessId } = req.body;
    const buyerId = req.playerId;

    // Get listing with lock
    const listing = await db.MarketListing.findByPk(id, {
      include: [{ model: db.Product, as: 'product' }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!listing || listing.status !== 'active' || !listing.isActive()) {
      throw new AppError('Listing not found or not available', 404);
    }

    if (listing.seller_id === buyerId) {
      throw new AppError('Cannot buy from your own listing', 400);
    }

    if (quantity > listing.quantity) {
      throw new AppError('Insufficient quantity available', 400);
    }

    // Get buyer and business
    const buyer = await db.Player.findByPk(buyerId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const business = await db.Business.findOne({
      where: { id: businessId, player_id: buyerId },
      transaction,
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Check warehouse capacity
    const productVolume = parseFloat(listing.product.volume);
    const canStore = await business.canStore(productVolume, quantity);

    if (!canStore) {
      throw new AppError('Insufficient warehouse capacity', 400);
    }

    // Calculate costs
    const totalCost = quantity * parseFloat(listing.unit_price);
    const marketFee = totalCost * 0.05;
    const sellerRevenue = totalCost - marketFee;

    // Check buyer balance
    if (parseFloat(buyer.balance) < totalCost) {
      throw new AppError('Insufficient balance', 400);
    }

    // Get seller
    const seller = await db.Player.findByPk(listing.seller_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Process payment
    buyer.balance = parseFloat(buyer.balance) - totalCost;
    seller.balance = parseFloat(seller.balance) + sellerRevenue;

    await buyer.save({ transaction });
    await seller.save({ transaction });

    // Add to buyer inventory
    let inventory = await db.Inventory.findOne({
      where: { business_id: businessId, product_id: listing.product_id },
      transaction,
    });

    if (inventory) {
      await inventory.addQuantity(quantity);
    } else {
      inventory = await db.Inventory.create(
        {
          business_id: businessId,
          product_id: listing.product_id,
          quantity,
        },
        { transaction }
      );
    }

    // Update listing
    if (quantity === listing.quantity) {
      await listing.markAsSold();
    } else {
      listing.quantity -= quantity;
      listing.total_price = listing.quantity * parseFloat(listing.unit_price);
      await listing.save({ transaction });
    }

    // Create transaction record
    const txRecord = await db.Transaction.create(
      {
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        product_id: listing.product_id,
        market_listing_id: listing.id,
        quantity,
        unit_price: listing.unit_price,
        transaction_type: 'market_buy',
      },
      { transaction }
    );

    // Update player stats
    buyer.total_transactions += 1;
    seller.total_transactions += 1;
    seller.total_revenue = parseFloat(seller.total_revenue) + sellerRevenue;

    await buyer.save({ transaction });
    await seller.save({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Purchase successful',
      data: {
        transaction: txRecord,
        totalCost,
        marketFee,
        newBalance: buyer.balance,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getMarketListings,
  getMyListings,
  createListing,
  cancelListing,
  buyFromMarket,
};
