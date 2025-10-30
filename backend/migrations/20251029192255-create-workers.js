'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Worker name (e.g., "Experienced Worker")',
      },
      efficiency_multiplier: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 1.20,
        comment: 'Production speed boost (1.2x - 2.0x)',
      },
      salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Hourly salary cost',
      },
      hired_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      status: {
        type: Sequelize.ENUM('active', 'fired'),
        allowNull: false,
        defaultValue: 'active',
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
    await queryInterface.addIndex('workers', ['business_id'], {
      name: 'idx_workers_business',
    });

    await queryInterface.addIndex('workers', ['status'], {
      name: 'idx_workers_status',
    });

    // Composite index for active workers by business
    await queryInterface.addIndex('workers', ['business_id', 'status'], {
      name: 'idx_workers_business_status',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workers');
  },
};
