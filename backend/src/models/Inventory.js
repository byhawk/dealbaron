const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
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
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  }, {
    tableName: 'inventory',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['product_id'] },
      {
        unique: true,
        fields: ['business_id', 'product_id'],
        name: 'unique_business_product',
      },
    ],
  });

  // Instance methods
  Inventory.prototype.addQuantity = async function(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this.quantity += amount;
    await this.save();
    return this.quantity;
  };

  Inventory.prototype.removeQuantity = async function(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (this.quantity < amount) {
      throw new Error('Insufficient quantity in inventory');
    }
    this.quantity -= amount;
    await this.save();
    return this.quantity;
  };

  Inventory.prototype.getTotalVolume = async function() {
    const product = await this.getProduct();
    return parseFloat(product.volume) * this.quantity;
  };

  // Associations
  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });

    Inventory.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
  };

  return Inventory;
};
