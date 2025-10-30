const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id',
      },
      comment: 'NULL for DealBaron transactions',
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    market_listing_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'market_listings',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Number of units traded',
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Price per unit at time of transaction',
      get() {
        const value = this.getDataValue('unit_price');
        return value ? parseFloat(value) : 0;
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Total transaction amount before fees',
      get() {
        const value = this.getDataValue('total_amount');
        return value ? parseFloat(value) : 0;
      },
    },
    market_fee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: '5% market fee (0 for DealBaron transactions)',
      get() {
        const value = this.getDataValue('market_fee');
        return value ? parseFloat(value) : 0;
      },
    },
    net_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Amount after fees',
      get() {
        const value = this.getDataValue('net_amount');
        return value ? parseFloat(value) : 0;
      },
    },
    transaction_type: {
      type: DataTypes.ENUM('market_buy', 'market_sell', 'dealbaron_buy', 'dealbaron_sell', 'production'),
      allowNull: false,
    },
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['buyer_id'] },
      { fields: ['seller_id'] },
      { fields: ['product_id'] },
      { fields: ['transaction_type'] },
      { fields: ['created_at'] },
      { fields: ['product_id', 'created_at'] },
      { fields: ['buyer_id', 'created_at'] },
    ],
  });

  // Hooks
  Transaction.beforeCreate((transaction) => {
    // Calculate total amount
    transaction.total_amount = transaction.quantity * transaction.unit_price;

    // Calculate market fee (5% for market transactions, 0 for DealBaron)
    if (transaction.transaction_type === 'market_sell') {
      transaction.market_fee = transaction.total_amount * 0.05;
    } else {
      transaction.market_fee = 0;
    }

    // Calculate net amount
    transaction.net_amount = transaction.total_amount - transaction.market_fee;
  });

  // Static methods
  Transaction.getLastNForProduct = async function(productId, limit = 100) {
    return await this.findAll({
      where: {
        product_id: productId,
        transaction_type: ['market_buy', 'market_sell'],
      },
      order: [['created_at', 'DESC']],
      limit,
    });
  };

  Transaction.calculateAveragePrice = async function(productId, limit = 100) {
    const transactions = await this.getLastNForProduct(productId, limit);

    if (transactions.length === 0) {
      return null;
    }

    // Weighted average by quantity
    let totalValue = 0;
    let totalQuantity = 0;

    for (const tx of transactions) {
      totalValue += parseFloat(tx.unit_price) * tx.quantity;
      totalQuantity += tx.quantity;
    }

    return totalQuantity > 0 ? totalValue / totalQuantity : null;
  };

  // Associations
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Player, {
      foreignKey: 'buyer_id',
      as: 'buyer',
    });

    Transaction.belongsTo(models.Player, {
      foreignKey: 'seller_id',
      as: 'seller',
    });

    Transaction.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });

    Transaction.belongsTo(models.MarketListing, {
      foreignKey: 'market_listing_id',
      as: 'listing',
    });
  };

  return Transaction;
};
