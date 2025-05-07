const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import services
require('./services/redisService');
require('./services/consumerService');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with optimized settings for serverless
const MONGODB_URI = process.env.MONGODB_URI;

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB on startup - retrying in 5 sec', err);
    setTimeout(connectWithRetry, 5000);
  });
};

// Initialize connection
connectWithRetry();

// Enable Mongoose debugging to see queries
mongoose.set('debug', true);

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Xeno CRM API',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      orders: '/api/orders',
      campaigns: '/api/campaigns',
      ai: '/api/ai'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed. MongoDB connection disconnected.');
    process.exit(0);
  });
});

// For Vercel serverless deployment
module.exports = app;