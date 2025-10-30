const dealBaronService = require('../services/dealBaronService');

/**
 * Get DealBaron price for a product
 * GET /api/v1/dealbaron/price/:productId
 */
const getPrice = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const priceData = await dealBaronService.getDealBaronPrice(productId);

    res.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buy from DealBaron
 * POST /api/v1/dealbaron/buy
 */
const buy = async (req, res, next) => {
  try {
    const { productId, quantity, businessId } = req.body;
    const playerId = req.playerId;

    const result = await dealBaronService.buyFromDealBaron(
      playerId,
      productId,
      quantity,
      businessId
    );

    res.json({
      success: true,
      message: 'Purchase from DealBaron successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sell to DealBaron
 * POST /api/v1/dealbaron/sell
 */
const sell = async (req, res, next) => {
  try {
    const { productId, quantity, businessId } = req.body;
    const playerId = req.playerId;

    const result = await dealBaronService.sellToDealBaron(
      playerId,
      productId,
      quantity,
      businessId
    );

    res.json({
      success: true,
      message: 'Sale to DealBaron successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrice,
  buy,
  sell,
};
