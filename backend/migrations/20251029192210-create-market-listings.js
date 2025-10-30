'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('market_listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
        comment: 'Number of units being sold',
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Price per unit (must be 80-90% of DealBaron price)',
      },
      total_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Total listing price (quantity * unit_price)',
      },
      status: {
        type: Sequelize.ENUM('active', 'sold', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'active',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Listing expiration time (default: 7 days from creation)',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Indexes for performance
    await queryInterface.addIndex('market_listings', ['seller_id'], {
      name: 'idx_market_listings_seller',
    });

    await queryInterface.addIndex('market_listings', ['product_id'], {
      name: 'idx_market_listings_product',
    });

    await queryInterface.addIndex('market_listings', ['status'], {
      name: 'idx_market_listings_status',
    });

    await queryInterface.addIndex('market_listings', ['expires_at'], {
      name: 'idx_market_listings_expires',
    });

    // Composite index for product search with status filter
    await queryInterface.addIndex('market_listings', ['product_id', 'status', 'unit_price'], {
      name: 'idx_market_listings_product_status_price',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('market_listings');
  },
};
