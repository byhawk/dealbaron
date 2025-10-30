'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'NULL for DealBaron transactions',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      market_listing_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'market_listings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'NULL for DealBaron or production transactions',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Number of units traded',
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Price per unit at time of transaction',
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total transaction amount before fees',
      },
      market_fee: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '5% market fee (0 for DealBaron transactions)',
      },
      net_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Amount after fees',
      },
      transaction_type: {
        type: Sequelize.ENUM('market_buy', 'market_sell', 'dealbaron_buy', 'dealbaron_sell', 'production'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes for analytics and queries
    await queryInterface.addIndex('transactions', ['buyer_id'], {
      name: 'idx_transactions_buyer',
    });

    await queryInterface.addIndex('transactions', ['seller_id'], {
      name: 'idx_transactions_seller',
    });

    await queryInterface.addIndex('transactions', ['product_id'], {
      name: 'idx_transactions_product',
    });

    await queryInterface.addIndex('transactions', ['transaction_type'], {
      name: 'idx_transactions_type',
    });

    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'idx_transactions_created_at',
    });

    // Composite index for DealBaron price calculation (last 100 transactions by product)
    await queryInterface.addIndex('transactions', ['product_id', 'created_at'], {
      name: 'idx_transactions_product_time',
    });

    // Composite index for player transaction history
    await queryInterface.addIndex('transactions', ['buyer_id', 'created_at'], {
      name: 'idx_transactions_buyer_time',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  },
};
