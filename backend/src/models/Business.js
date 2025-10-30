const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    player_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    business_type: {
      type: DataTypes.ENUM('farm', 'factory', 'warehouse'),
      allowNull: false,
    },
    warehouse_capacity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1000.00,
      validate: {
        min: 100,
      },
      get() {
        const value = this.getDataValue('warehouse_capacity');
        return value ? parseFloat(value) : 0;
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 50,
      },
    },
  }, {
    tableName: 'businesses',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['player_id'] },
      { fields: ['business_type'] },
    ],
  });

  // Instance methods
  Business.prototype.calculateUsedCapacity = async function() {
    const inventories = await this.getInventories({
      include: [{
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['volume'],
      }],
    });

    let totalVolume = 0;
    for (const inventory of inventories) {
      const productVolume = inventory.product ? parseFloat(inventory.product.volume) : 0;
      totalVolume += productVolume * inventory.quantity;
    }

    return totalVolume;
  };

  Business.prototype.getFreeCapacity = async function() {
    const usedCapacity = await this.calculateUsedCapacity();
    return parseFloat(this.warehouse_capacity) - usedCapacity;
  };

  Business.prototype.canStore = async function(productVolume, quantity) {
    const freeCapacity = await this.getFreeCapacity();
    const requiredSpace = productVolume * quantity;
    return freeCapacity >= requiredSpace;
  };

  Business.prototype.getWorkerBoost = async function() {
    const workers = await this.getWorkers({
      where: { status: 'active' },
    });

    if (workers.length === 0) return 1.0;

    // Calculate average efficiency multiplier
    const totalBoost = workers.reduce((sum, worker) => {
      return sum + parseFloat(worker.efficiency_multiplier || 1.0);
    }, 0);

    return totalBoost / workers.length;
  };

  // Associations
  Business.associate = (models) => {
    Business.belongsTo(models.Player, {
      foreignKey: 'player_id',
      as: 'player',
    });

    Business.hasMany(models.Inventory, {
      foreignKey: 'business_id',
      as: 'inventories',
    });

    Business.hasMany(models.ProductionJob, {
      foreignKey: 'business_id',
      as: 'productionJobs',
    });

    Business.hasMany(models.Worker, {
      foreignKey: 'business_id',
      as: 'workers',
    });
  };

  return Business;
};
