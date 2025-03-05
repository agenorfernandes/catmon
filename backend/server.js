require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const authRoutes = require('./routes/authRoutes');
const catRoutes = require('./routes/catRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const userRoutes = require('./routes/userRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Print environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '[SET]' : '[NOT SET]',
  MONGODB_URI: process.env.MONGODB_URI ? '[CONTAINS CONNECTION STRING]' : '[NOT SET]',
  FRONTEND_URL: process.env.FRONTEND_URL,
  PUBLIC_URL: process.env.PUBLIC_URL
});

// Initialize app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, enable in production with proper rules
  crossOriginEmbedderPolicy: false // Allows loading resources from different domains
}));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compression middleware
app.use(compression());

// Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit of 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again in 15 minutes'
});
app.use('/api/', apiLimiter);

// Specific limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, try again later'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Improved CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    console.log(`CORS request from origin: ${origin || 'no origin'}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, be specific about allowed origins
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'https://catmon.com.br',
        process.env.PUBLIC_URL || 'https://catmon.com.br'
      ];
      
      if (allowedOrigins.includes(origin)) {
        console.log(`Origin allowed by CORS: ${origin}`);
        return callback(null, true);
      }
    } else {
      // In development, allow localhost requests
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL,
        process.env.PUBLIC_URL
      ];
      
      if (allowedOrigins.includes(origin)) {
        console.log(`Origin allowed by CORS: ${origin}`);
        return callback(null, true);
      }
    }
    
    // If origin not allowed
    console.log(`Origin blocked by CORS: ${origin}`);
    return callback(new Error('CORS policy does not allow access from this domain.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB Atlas
console.log(`Connecting to MongoDB Atlas (${process.env.NODE_ENV || 'development'})...`);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB Atlas Connected Successfully'))
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  
  const memoryUsage = process.memoryUsage();
  const memoryStats = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`
  };
  
  res.json({ 
    status: 'ok', 
    message: 'KatMon API working',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeFormatted,
    memory: memoryStats,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Format uptime in a readable format
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.round(uptime % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// 404 middleware
app.use((req, res, next) => {
  res.status(404).json({
    msg: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    msg: errorMessage,
    error: process.env.NODE_ENV === 'production' ? 'Contact support' : err.stack
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for production...');
  // Serve from the frontend build directory
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  // For any route not handled by the API, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Port and host
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Allow connections from any IP

const server = app.listen(PORT, HOST, () => {
  console.log(`KatMon server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Uncaught exception handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to notify an administrator
  if (process.env.NODE_ENV === 'production') {
    // Implement notification logic here
  }
  
  // In production environment, restart the server
  // In development, exit to avoid unexpected behavior
  if (process.env.NODE_ENV === 'production') {
    console.log('Server will continue running after uncaught exception');
  } else {
    console.log('Server will exit due to uncaught exception');
    process.exit(1);
  }
});

// Unhandled promise rejection handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // In a production environment, might log to a service
});

module.exports = app;