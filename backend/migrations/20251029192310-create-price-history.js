'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('price_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      avg_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Average transaction price for this period',
      },
      min_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Minimum transaction price for this period',
      },
      max_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Maximum transaction price for this period',
      },
      dealbaron_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'DealBaron price at this time',
      },
      transaction_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of transactions in this period',
      },
      total_volume: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total units traded in this period',
      },
      market_pressure: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Market pressure value at this time',
      },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Time when this data point was recorded (every 5 minutes)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes for time-series queries
    await queryInterface.addIndex('price_history', ['product_id'], {
      name: 'idx_price_history_product',
    });

    await queryInterface.addIndex('price_history', ['recorded_at'], {
      name: 'idx_price_history_recorded',
    });

    // Composite index for product price charts (last 7 days)
    await queryInterface.addIndex('price_history', ['product_id', 'recorded_at'], {
      name: 'idx_price_history_product_time',
    });

    // Unique constraint: one record per product per time period
    await queryInterface.addIndex('price_history', ['product_id', 'recorded_at'], {
      unique: true,
      name: 'unique_product_time',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('price_history');
  },
};
