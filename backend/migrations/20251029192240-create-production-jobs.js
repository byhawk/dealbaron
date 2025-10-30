'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('production_jobs', {
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
        comment: 'Number of units being produced',
      },
      base_production_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Base production time in seconds',
      },
      actual_production_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Actual time after worker boost (baseTime / boostMultiplier)',
      },
      worker_boost: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 1.00,
        comment: 'Worker efficiency multiplier (1.0 - 2.0)',
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'completed', 'collected', 'cancelled'),
        allowNull: false,
        defaultValue: 'in_progress',
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      completes_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Time when production will be complete',
      },
      collected_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Time when player collected the finished goods',
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

    // Indexes for production queries
    await queryInterface.addIndex('production_jobs', ['business_id'], {
      name: 'idx_production_jobs_business',
    });

    await queryInterface.addIndex('production_jobs', ['status'], {
      name: 'idx_production_jobs_status',
    });

    await queryInterface.addIndex('production_jobs', ['completes_at'], {
      name: 'idx_production_jobs_completes',
    });

    // Composite index for active jobs by business
    await queryInterface.addIndex('production_jobs', ['business_id', 'status', 'completes_at'], {
      name: 'idx_production_jobs_business_status_time',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('production_jobs');
  },
};
