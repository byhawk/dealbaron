const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('raw_material', 'intermediate', 'finished_good', 'luxury'),
      allowNull: false,
    },
    base_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
      get() {
        const value = this.getDataValue('base_price');
        return value ? parseFloat(value) : 0;
      },
    },
    demand_coeff_a: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Base demand coefficient (a in Q = a - bP)',
      get() {
        const value = this.getDataValue('demand_coeff_a');
        return value ? parseFloat(value) : 0;
      },
    },
    demand_coeff_b: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Price sensitivity coefficient (b in Q = a - bP)',
      get() {
        const value = this.getDataValue('demand_coeff_b');
        return value ? parseFloat(value) : 0;
      },
    },
    elasticity_factor: {
      type: DataTypes.DECIMAL(5, 3),
      allowNull: false,
      defaultValue: 0.15,
      validate: {
        min: 0,
        max: 1,
      },
      get() {
        const value = this.getDataValue('elasticity_factor');
        return value ? parseFloat(value) : 0;
      },
    },
    volume: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00,
      validate: {
        min: 0.01,
      },
      comment: 'Volume per unit for warehouse capacity calculation',
      get() {
        const value = this.getDataValue('volume');
        return value ? parseFloat(value) : 0;
      },
    },
    production_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Base production time in seconds (NULL for non-producible items)',
    },
    production_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Cost to produce one unit',
      get() {
        const value = this.getDataValue('production_cost');
        return value ? parseFloat(value) : null;
      },
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Product image URL (uploaded via admin panel)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['category'] },
      { fields: ['is_active'] },
    ],
  });

  // Instance methods
  Product.prototype.calculateDemand = function(price) {
    const demand = this.demand_coeff_a - (this.demand_coeff_b * price);
    return Math.max(0, demand);
  };

  Product.prototype.calculateOptimalPrice = function() {
    return this.demand_coeff_a / (2 * this.demand_coeff_b);
  };

  Product.prototype.isProducible = function() {
    return this.production_time !== null && this.production_cost !== null;
  };

  // Associations
  Product.associate = (models) => {
    Product.hasMany(models.Inventory, {
      foreignKey: 'product_id',
      as: 'inventories',
    });

    Product.hasMany(models.MarketListing, {
      foreignKey: 'product_id',
      as: 'listings',
    });

    Product.hasMany(models.Transaction, {
      foreignKey: 'product_id',
      as: 'transactions',
    });

    Product.hasMany(models.ProductionJob, {
      foreignKey: 'product_id',
      as: 'productionJobs',
    });

    Product.hasMany(models.PriceHistory, {
      foreignKey: 'product_id',
      as: 'priceHistory',
    });
  };

  return Product;
};
