'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      base_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Unit volume for warehouse calculations',
      },
      category: {
        type: Sequelize.ENUM('agriculture', 'industry', 'luxury'),
        allowNull: false,
      },
      rarity: {
        type: Sequelize.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
        allowNull: false,
        defaultValue: 'common',
      },
      elasticity_factor: {
        type: Sequelize.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0.150,
        comment: 'Price elasticity factor (0.01-2.0)',
      },
      demand_coeff_a: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Base demand coefficient (a in Q = a - bP)',
      },
      demand_coeff_b: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        comment: 'Price sensitivity coefficient (b in Q = a - bP)',
      },
      production_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Base production time in seconds',
      },
      production_type: {
        type: Sequelize.ENUM('farm', 'industry'),
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Product image URL (uploaded via admin panel)',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Indexes
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['rarity']);
    await queryInterface.addIndex('products', ['production_type']);
    await queryInterface.addIndex('products', ['is_active']);
    await queryInterface.addIndex('products', ['name']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  },
};
