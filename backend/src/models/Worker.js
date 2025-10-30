const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Worker = sequelize.define('Worker', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Worker name (e.g., "Experienced Worker")',
    },
    efficiency_multiplier: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.20,
      comment: 'Production speed boost (1.2x - 2.0x)',
      get() {
        const value = this.getDataValue('efficiency_multiplier');
        return value ? parseFloat(value) : 1.2;
      },
    },
    salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Hourly salary cost',
      get() {
        const value = this.getDataValue('salary');
        return value ? parseFloat(value) : 0;
      },
    },
    hired_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'fired'),
      allowNull: false,
      defaultValue: 'active',
    },
  }, {
    tableName: 'workers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['status'] },
      { fields: ['business_id', 'status'] },
    ],
  });

  // Instance methods
  Worker.prototype.fire = async function() {
    if (this.status !== 'active') {
      throw new Error('Worker is already fired');
    }
    this.status = 'fired';
    await this.save();
  };

  Worker.prototype.calculateTotalSalary = function() {
    const now = new Date();
    const hoursWorked = (now.getTime() - this.hired_at.getTime()) / (1000 * 60 * 60);
    return parseFloat(this.salary) * hoursWorked;
  };

  // Static methods
  Worker.findActiveByBusiness = async function(businessId) {
    return await this.findAll({
      where: {
        business_id: businessId,
        status: 'active',
      },
    });
  };

  Worker.calculateAverageBoost = async function(businessId) {
    const workers = await this.findActiveByBusiness(businessId);

    if (workers.length === 0) return 1.0;

    const totalBoost = workers.reduce((sum, worker) => {
      return sum + worker.efficiency_multiplier;
    }, 0);

    return totalBoost / workers.length;
  };

  // Associations
  Worker.associate = (models) => {
    Worker.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return Worker;
};
