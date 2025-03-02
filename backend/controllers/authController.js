const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(config.googleClientId);
const appleSignin = require('apple-signin-auth');

// Registrar novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe' });
    }

    // Criar novo usuário
    user = new User({
      name,
      email,
      password,
      authMethod: 'local'
    });

    await user.save();

    // Gerar token
    const token = user.generateAuthToken();

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
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    // Verificar se a senha está correta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    // Atualizar último login
    user.lastLogin = Date.now();
    await user.save();

    // Gerar token
    const token = user.generateAuthToken();

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
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Login com Google
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verificar token do Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.googleClientId
    });
    
    const { email_verified, name, email, picture } = ticket.getPayload();
    
    if (!email_verified) {
      return res.status(400).json({ msg: 'Email não verificado pelo Google' });
    }
    
    // Verificar se o usuário já existe
    let user = await User.findOne({ email });
    
    if (!user) {
      // Criar novo usuário
      user = new User({
        name,
        email,
        authMethod: 'google',
        googleId: ticket.getUserId(),
        profilePicture: picture || 'default-avatar.png'
      });
      
      await user.save();
    } else {
      // Atualizar usuário existente com informações do Google
      user.googleId = ticket.getUserId();
      if (picture) user.profilePicture = picture;
      user.lastLogin = Date.now();
      await user.save();
    }
    
    // Gerar token
    const token = user.generateAuthToken();
    
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
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Login com Apple
exports.appleLogin = async (req, res) => {
  try {
    const { idToken, firstName, lastName } = req.body;
    
    // Verificar token da Apple
    const appleResponse = await appleSignin.verifyIdToken(
      idToken, 
      {
        audience: config.appleClientId,
        ignoreExpiration: true
      }
    );
    
    const { sub: appleId, email } = appleResponse;
    
    // Verificar se o usuário já existe
    let user = await User.findOne({ email });
    
    if (!user) {
      // Criar novo usuário
      user = new User({
        name: firstName && lastName ? `${firstName} ${lastName}` : 'Usuário Apple',
        email,
        authMethod: 'apple',
        appleId
      });
      
      await user.save();
    } else {
      // Atualizar usuário existente com informações da Apple
      user.appleId = appleId;
      user.lastLogin = Date.now();
      await user.save();
    }
    
    // Gerar token
    const token = user.generateAuthToken();
    
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
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter dados do usuário atual
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Verificar token
exports.verifyToken = (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ msg: 'Sem token, autorização negada' });
    }
    
    jwt.verify(token, config.jwtSecret);
    
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
};
