require('dotenv').config();
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
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

// SSL Configuration
const sslOptions = {
  cert: fs.readFileSync('/etc/nginx/ssl/certificate.crt'),
  key: fs.readFileSync('/etc/nginx/ssl/private.key')
};

// Print environment for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HTTPS_PORT: process.env.HTTPS_PORT,
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
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compression middleware
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, try again in 15 minutes'
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, try again later'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    console.log(`CORS request from origin: ${origin || 'no origin'}`);
    
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://catmon.com.br',
      'https://www.catmon.com.br'
    ];
    
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:3000');
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`Origin allowed by CORS: ${origin}`);
      return callback(null, true);
    }
    
    console.log(`Origin blocked by CORS: ${origin}`);
    return callback(new Error(`CORS policy does not allow access from ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
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

// Helper function for uptime formatting
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.round(uptime % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// Production static files
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up static file serving for production...');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    msg: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
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

// Server configuration
const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const HOST = '0.0.0.0';

// Create HTTP server
const httpServer = http.createServer(app);

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start both servers
httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`HTTP server running on http://${HOST}:${HTTP_PORT}`);
});

httpsServer.listen(HTTPS_PORT, HOST, () => {
  console.log(`HTTPS server running on https://${HOST}:${HTTPS_PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing servers...');
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    httpsServer.close(() => {
      console.log('HTTPS server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

// Shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    console.log('Server will continue running after uncaught exception');
  } else {
    console.log('Server will exit due to uncaught exception');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

module.exports = { app, httpServer, httpsServer };