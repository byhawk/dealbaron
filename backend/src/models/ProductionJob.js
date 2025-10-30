const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionJob = sequelize.define('ProductionJob', {
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
      comment: 'Number of units being produced',
    },
    base_production_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Base production time in seconds',
    },
    actual_production_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Actual time after worker boost (baseTime / boostMultiplier)',
    },
    worker_boost: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.00,
      comment: 'Worker efficiency multiplier (1.0 - 2.0)',
      get() {
        const value = this.getDataValue('worker_boost');
        return value ? parseFloat(value) : 1.0;
      },
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'collected', 'cancelled'),
      allowNull: false,
      defaultValue: 'in_progress',
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completes_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Time when production will be complete',
    },
    collected_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Time when player collected the finished goods',
    },
  }, {
    tableName: 'production_jobs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['status'] },
      { fields: ['completes_at'] },
      { fields: ['business_id', 'status', 'completes_at'] },
    ],
  });

  // Hooks
  ProductionJob.beforeCreate((job) => {
    // Set started_at if not provided
    if (!job.started_at) {
      job.started_at = new Date();
    }

    // Calculate completes_at
    const productionTimeMs = job.actual_production_time * 1000;
    job.completes_at = new Date(job.started_at.getTime() + productionTimeMs);
  });

  // Instance methods
  ProductionJob.prototype.isCompleted = function() {
    return this.status === 'completed' || new Date() >= this.completes_at;
  };

  ProductionJob.prototype.getRemainingTime = function() {
    if (this.status !== 'in_progress') {
      return 0;
    }

    const now = new Date();
    const remaining = this.completes_at.getTime() - now.getTime();
    return Math.max(0, Math.floor(remaining / 1000)); // seconds
  };

  ProductionJob.prototype.getProgress = function() {
    if (this.status === 'completed' || this.status === 'collected') {
      return 100;
    }

    if (this.status === 'cancelled') {
      return 0;
    }

    const now = new Date();
    const elapsed = now.getTime() - this.started_at.getTime();
    const total = this.completes_at.getTime() - this.started_at.getTime();

    return Math.min(100, Math.floor((elapsed / total) * 100));
  };

  ProductionJob.prototype.complete = async function() {
    if (this.status !== 'in_progress') {
      throw new Error('Only in_progress jobs can be completed');
    }

    if (!this.isCompleted()) {
      throw new Error('Production is not yet complete');
    }

    this.status = 'completed';
    await this.save();
  };

  ProductionJob.prototype.collect = async function() {
    if (this.status !== 'completed') {
      throw new Error('Only completed jobs can be collected');
    }

    this.status = 'collected';
    this.collected_at = new Date();
    await this.save();
  };

  ProductionJob.prototype.cancel = async function() {
    if (this.status !== 'in_progress') {
      throw new Error('Only in_progress jobs can be cancelled');
    }

    this.status = 'cancelled';
    await this.save();
  };

  // Static methods
  ProductionJob.findActiveByBusiness = async function(businessId) {
    return await this.findAll({
      where: {
        business_id: businessId,
        status: 'in_progress',
      },
      order: [['completes_at', 'ASC']],
    });
  };

  ProductionJob.findCompletedByBusiness = async function(businessId) {
    return await this.findAll({
      where: {
        business_id: businessId,
        status: 'completed',
      },
      order: [['completes_at', 'DESC']],
    });
  };

  // Associations
  ProductionJob.associate = (models) => {
    ProductionJob.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });

    ProductionJob.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
  };

  return ProductionJob;
};
