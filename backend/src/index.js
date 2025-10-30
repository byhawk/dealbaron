require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
const authRoutes = require('./routes/authRoutes');

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'DealBaron API v1.0',
    status: 'running',
  });
});

app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server with database connection
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 DealBaron API running on http://${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    console.error('⚠️  Starting server without database connection');

    // Start server anyway for development
    app.listen(PORT, HOST, () => {
      console.log(`🚀 DealBaron API running on http://${HOST}:${PORT} (No DB)`);
    });
  }
};

startServer();

module.exports = app;
