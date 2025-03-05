require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const appleSignin = require('apple-signin-auth');
const axios = require('axios');

// Debug logging for environment
console.log('Auth Controller Environment:', {
  JWT_SECRET: process.env.JWT_SECRET ? '[SET]' : '[NOT SET]',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '[SET]' : '[NOT SET]'
});

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Select a random avatar
    const avatarId = Math.floor(Math.random() * 10) + 1; // Assuming 10 avatars
    const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;

    // Create new user
    user = new User({
      name,
      email,
      password,
      authMethod: 'local',
      avatarId,
      profilePicture
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        level: user.level,
        points: user.points
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        level: user.level,
        points: user.points
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    console.log('Google login request received:', req.body);
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: 'Token is required' });
    }

    // Verify the token with Google
    try {
      console.log('Verifying token with Google...');
      
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Google verification successful');
      
      const { email, name, picture, sub: googleId } = response.data;

      if (!email) {
        return res.status(400).json({ msg: 'Email not provided by Google' });
      }

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        console.log('Creating new user from Google login');
        // Create new user
        const avatarId = Math.floor(Math.random() * 10) + 1;
        user = new User({
          name,
          email,
          googleId,
          profilePicture: picture || `/assets/avatars/cat-avatar-${avatarId}.png`,
          authMethod: 'google',
          avatarId
        });

        await user.save();
      } else {
        console.log('Updating existing user from Google login');
        // Update existing user info
        user.googleId = googleId;
        user.name = name;
        if (picture) {
          user.profilePicture = picture;
        }
        user.authMethod = 'google';
        user.lastLogin = Date.now();
        await user.save();
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Authentication successful, sending response');
      
      res.json({
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role,
          level: user.level,
          points: user.points
        }
      });
    } catch (verificationError) {
      console.error('Google token verification error:', verificationError);
      return res.status(401).json({ 
        msg: 'Invalid Google token',
        error: verificationError.message
      });
    }
  } catch (error) {
    console.error('Detailed error in Google login:', error);
    res.status(500).json({ 
      msg: 'Server error during Google authentication',
      error: error.message,
      stack: error.stack 
    });
  }
};

// Apple login
exports.appleLogin = async (req, res) => {
  try {
    const { idToken, firstName, lastName } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ msg: 'ID Token is required' });
    }
    
    // Verify Apple token
    try {
      console.log('Verifying token with Apple...');
      
      const appleResponse = await appleSignin.verifyIdToken(
        idToken, 
        {
          audience: process.env.APPLE_CLIENT_ID,
          ignoreExpiration: true
        }
      );
      
      console.log('Apple verification successful');
      
      const { sub: appleId, email } = appleResponse;
      
      if (!email) {
        return res.status(400).json({ msg: 'Email not provided by Apple' });
      }
      
      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (!user) {
        console.log('Creating new user from Apple login');
        // Select a random avatar
        const avatarId = Math.floor(Math.random() * 10) + 1;
        const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
        
        // Create new user
        user = new User({
          name: firstName && lastName ? `${firstName} ${lastName}` : 'Apple User',
          email,
          authMethod: 'apple',
          appleId,
          avatarId,
          profilePicture
        });
        
        await user.save();
      } else {
        console.log('Updating existing user from Apple login');
        // Update existing user with Apple info
        user.appleId = appleId;
        
        // Update avatar only if user doesn't have a custom one
        if (!user.avatarId) {
          const avatarId = Math.floor(Math.random() * 10) + 1;
          user.avatarId = avatarId;
          user.profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
        }
        
        user.lastLogin = Date.now();
        await user.save();
      }
      
      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('Authentication successful, sending response');
      
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          level: user.level,
          points: user.points
        }
      });
    } catch (verificationError) {
      console.error('Apple token verification error:', verificationError);
      return res.status(401).json({ 
        msg: 'Invalid Apple token',
        error: verificationError.message
      });
    }
  } catch (err) {
    console.error('Apple login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get current user data
exports.getMe = async (req, res) => {
  try {
    console.log('Getting user data for user ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied', valid: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({ valid: true, user: decoded });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid', valid: false });
  }
};

// Update user avatar
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarId } = req.body;
    
    if (!avatarId || avatarId < 1 || avatarId > 10) {
      return res.status(400).json({ msg: 'Invalid avatar ID' });
    }
    
    const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
    
    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { 
        $set: { 
          profilePicture,
          avatarId
        } 
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Update avatar error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};