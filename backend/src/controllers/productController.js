const { AppError } = require('../middleware/errorHandler');
const db = require('../models');

/**
 * Get all products
 * GET /api/v1/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const { limit, offset } = req.pagination;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    const { count, rows: products } = await db.Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
      attributes: { exclude: ['created_at', 'updated_at'] },
    });

    res.json({
      success: true,
      data: {
        products,
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
 * Get product by ID
 * GET /api/v1/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id, {
      attributes: { exclude: ['created_at', 'updated_at'] },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Get latest price history
    const latestPrice = await db.PriceHistory.getLatestPrice(id);

    // Calculate current demand at base price
    const currentDemand = product.calculateDemand(product.base_price);
    const optimalPrice = product.calculateOptimalPrice();

    res.json({
      success: true,
      data: {
        product,
        currentPrice: latestPrice?.dealbaron_price || product.base_price,
        currentDemand: Math.round(currentDemand),
        optimalPrice: Math.round(optimalPrice * 100) / 100,
        marketPressure: latestPrice?.market_pressure || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product price history (chart data)
 * GET /api/v1/products/:id/price-history
 */
const getPriceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 7;

    if (days < 1 || days > 30) {
      throw new AppError('Days must be between 1 and 30', 400);
    }

    const product = await db.Product.findByPk(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const history = await db.PriceHistory.getChartData(id, days);

    const chartData = history.map((point) => ({
      timestamp: point.recorded_at,
      avgPrice: point.avg_price,
      minPrice: point.min_price,
      maxPrice: point.max_price,
      dealBaronPrice: point.dealbaron_price,
      volume: point.total_volume,
      transactions: point.transaction_count,
      marketPressure: point.market_pressure,
    }));

    res.json({
      success: true,
      data: {
        productId: id,
        productName: product.name,
        period: `${days} days`,
        dataPoints: chartData.length,
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product market statistics
 * GET /api/v1/products/:id/stats
 */
const getProductStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await db.Product.findByPk(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Get last 24 hours transactions
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentTransactions = await db.Transaction.findAll({
      where: {
        product_id: id,
        created_at: {
          [db.Sequelize.Op.gte]: oneDayAgo,
        },
      },
    });

    const totalVolume = recentTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalValue = recentTransactions.reduce((sum, tx) => sum + parseFloat(tx.total_amount), 0);

    // Get active listings count
    const activeListings = await db.MarketListing.count({
      where: {
        product_id: id,
        status: 'active',
      },
    });

    // Get average DealBaron price
    const avgPrice = await db.Transaction.calculateAveragePrice(id, 100);

    res.json({
      success: true,
      data: {
        productId: id,
        productName: product.name,
        last24Hours: {
          transactions: recentTransactions.length,
          volume: totalVolume,
          totalValue: Math.round(totalValue * 100) / 100,
          avgPrice: avgPrice ? Math.round(avgPrice * 100) / 100 : null,
        },
        market: {
          activeListings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate product price with market pressure
 * GET /api/v1/products/:id/calculate-price
 */
const calculatePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { markup, supply, avgDemand } = req.query;

    const product = await db.Product.findByPk(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const markupValue = parseFloat(markup) || 0;
    const supplyValue = parseInt(supply) || 0;
    const avgDemandValue = parseInt(avgDemand) || 0;

    // Calculate market pressure
    const marketPressure = avgDemandValue > 0
      ? (supplyValue - avgDemandValue) / avgDemandValue
      : 0;

    // Calculate final price
    const priceWithMarkup = product.base_price * (1 + markupValue);
    const pressureFactor = 1 + (product.elasticity_factor * marketPressure);
    const finalPrice = Math.max(0.01, priceWithMarkup * pressureFactor);

    // Calculate demand at this price
    const demand = product.calculateDemand(finalPrice);

    res.json({
      success: true,
      data: {
        basePrice: product.base_price,
        markup: markupValue,
        marketPressure: Math.round(marketPressure * 100) / 100,
        calculatedPrice: Math.round(finalPrice * 100) / 100,
        estimatedDemand: Math.round(demand),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getPriceHistory,
  getProductStats,
  calculatePrice,
};
