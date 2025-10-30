const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    avg_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Average transaction price for this period',
      get() {
        const value = this.getDataValue('avg_price');
        return value ? parseFloat(value) : 0;
      },
    },
    min_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Minimum transaction price for this period',
      get() {
        const value = this.getDataValue('min_price');
        return value ? parseFloat(value) : 0;
      },
    },
    max_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Maximum transaction price for this period',
      get() {
        const value = this.getDataValue('max_price');
        return value ? parseFloat(value) : 0;
      },
    },
    dealbaron_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'DealBaron price at this time',
      get() {
        const value = this.getDataValue('dealbaron_price');
        return value ? parseFloat(value) : 0;
      },
    },
    transaction_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of transactions in this period',
    },
    total_volume: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total units traded in this period',
    },
    market_pressure: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Market pressure value at this time',
      get() {
        const value = this.getDataValue('market_pressure');
        return value ? parseFloat(value) : 0;
      },
    },
    recorded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Time when this data point was recorded (every 5 minutes)',
    },
  }, {
    tableName: 'price_history',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['recorded_at'] },
      { fields: ['product_id', 'recorded_at'] },
      {
        unique: true,
        fields: ['product_id', 'recorded_at'],
        name: 'unique_product_time',
      },
    ],
  });

  // Static methods
  PriceHistory.getChartData = async function(productId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.findAll({
      where: {
        product_id: productId,
        recorded_at: {
          [sequelize.Sequelize.Op.gte]: startDate,
        },
      },
      order: [['recorded_at', 'ASC']],
    });
  };

  PriceHistory.getLatestPrice = async function(productId) {
    return await this.findOne({
      where: { product_id: productId },
      order: [['recorded_at', 'DESC']],
    });
  };

  PriceHistory.recordSnapshot = async function(productId, priceData) {
    const now = new Date();
    // Round to nearest 5 minutes
    now.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);

    return await this.create({
      product_id: productId,
      avg_price: priceData.avgPrice,
      min_price: priceData.minPrice,
      max_price: priceData.maxPrice,
      dealbaron_price: priceData.dealBaronPrice,
      transaction_count: priceData.transactionCount || 0,
      total_volume: priceData.totalVolume || 0,
      market_pressure: priceData.marketPressure || 0,
      recorded_at: now,
    });
  };

  // Associations
  PriceHistory.associate = (models) => {
    PriceHistory.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
  };

  return PriceHistory;
};
