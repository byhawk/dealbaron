const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Load database configuration
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.json')[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging === false ? false : console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

// Container for all models
const db = {};

// Load all model files
const modelFiles = [
  'Player.js',
  'Product.js',
  'Business.js',
  'Inventory.js',
  'MarketListing.js',
  'Transaction.js',
  'ProductionJob.js',
  'Worker.js',
  'PriceHistory.js',
];

modelFiles.forEach((file) => {
  const modelPath = path.join(__dirname, file);

  if (fs.existsSync(modelPath)) {
    const model = require(modelPath)(sequelize);
    db[model.name] = model;
  }
});

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize instance and Sequelize class to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
