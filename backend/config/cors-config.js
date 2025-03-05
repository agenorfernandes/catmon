require('dotenv').config();

const getCorsAllowedOrigins = () => {
  const originsString = process.env.CORS_ALLOWED_ORIGINS || '';
  return originsString.split(',').map(origin => origin.trim()).filter(Boolean);
};

const corsConfig = {
  origin: function(origin, callback) {
    const allowedOrigins = getCorsAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS policy does not allow access from ${origin}`), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token', 
    'Origin', 
    'X-Requested-With', 
    'Accept'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 3600
};

module.exports = corsConfig;
