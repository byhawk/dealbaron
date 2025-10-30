const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100,
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1000.00,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('balance');
        return value ? parseFloat(value) : 0;
      },
    },
    trust_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: 0,
        max: 100,
      },
    },
    total_transactions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    total_revenue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
      get() {
        const value = this.getDataValue('total_revenue');
        return value ? parseFloat(value) : 0;
      },
    },
    days_active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    market_unlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'players',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { fields: ['level'] },
      { fields: ['market_unlocked'] },
    ],
  });

  // Instance methods
  Player.prototype.canAccessMarket = function() {
    return this.level >= 5
      && this.total_transactions >= 10
      && parseFloat(this.total_revenue) >= 10000
      && this.days_active >= 3;
  };

  Player.prototype.shouldUnlockMarket = function() {
    if (!this.market_unlocked && this.canAccessMarket()) {
      return true;
    }
    return false;
  };

  Player.prototype.addExperience = async function(exp) {
    this.experience += exp;
    // Level up logic: every 1000 XP = 1 level
    const newLevel = Math.floor(this.experience / 1000) + 1;
    if (newLevel > this.level && newLevel <= 100) {
      this.level = newLevel;
    }
    await this.save();
    return this.level;
  };

  // Associations
  Player.associate = (models) => {
    Player.hasMany(models.Business, {
      foreignKey: 'player_id',
      as: 'businesses',
    });

    Player.hasMany(models.MarketListing, {
      foreignKey: 'seller_id',
      as: 'listings',
    });

    Player.hasMany(models.Transaction, {
      foreignKey: 'buyer_id',
      as: 'purchases',
    });

    Player.hasMany(models.Transaction, {
      foreignKey: 'seller_id',
      as: 'sales',
    });
  };

  return Player;
};
