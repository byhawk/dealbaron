const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MarketListing = sequelize.define('MarketListing', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Price per unit (must be 80-90% of DealBaron price)',
      get() {
        const value = this.getDataValue('unit_price');
        return value ? parseFloat(value) : 0;
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Total listing price (quantity * unit_price)',
      get() {
        const value = this.getDataValue('total_price');
        return value ? parseFloat(value) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'cancelled', 'expired'),
      allowNull: false,
      defaultValue: 'active',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Listing expiration time (default: 7 days from creation)',
    },
  }, {
    tableName: 'market_listings',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['seller_id'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['expires_at'] },
      { fields: ['product_id', 'status', 'unit_price'] },
    ],
  });

  // Hooks
  MarketListing.beforeCreate((listing) => {
    // Calculate total price
    listing.total_price = listing.quantity * listing.unit_price;

    // Set expiration (7 days from now)
    if (!listing.expires_at) {
      listing.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  });

  MarketListing.beforeUpdate((listing) => {
    // Recalculate total price if quantity or unit_price changed
    if (listing.changed('quantity') || listing.changed('unit_price')) {
      listing.total_price = listing.quantity * listing.unit_price;
    }
  });

  // Instance methods
  MarketListing.prototype.isActive = function() {
    return this.status === 'active' && new Date() < this.expires_at;
  };

  MarketListing.prototype.cancel = async function() {
    if (this.status !== 'active') {
      throw new Error('Only active listings can be cancelled');
    }
    this.status = 'cancelled';
    await this.save();
  };

  MarketListing.prototype.markAsSold = async function() {
    if (this.status !== 'active') {
      throw new Error('Only active listings can be marked as sold');
    }
    this.status = 'sold';
    await this.save();
  };

  MarketListing.prototype.checkExpired = async function() {
    if (this.status === 'active' && new Date() >= this.expires_at) {
      this.status = 'expired';
      await this.save();
      return true;
    }
    return false;
  };

  // Associations
  MarketListing.associate = (models) => {
    MarketListing.belongsTo(models.Player, {
      foreignKey: 'seller_id',
      as: 'seller',
    });

    MarketListing.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });

    MarketListing.hasMany(models.Transaction, {
      foreignKey: 'market_listing_id',
      as: 'transactions',
    });
  };

  return MarketListing;
};
