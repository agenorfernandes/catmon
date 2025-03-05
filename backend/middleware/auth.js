const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies if the JWT token is valid
 */
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || 
               (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  
  // Check if no token
  if (!token) {
    console.log('Request without authentication token');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    console.log('Verifying token with secret...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add decoded user to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};