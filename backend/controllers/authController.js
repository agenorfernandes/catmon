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

    // Selecionar um avatar aleatório
    const avatarId = Math.floor(Math.random() * 10) + 1; // Assumindo 10 avatares
    const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;

    // Criar novo usuário
    user = new User({
      name,
      email,
      password,
      authMethod: 'local',
      avatarId,
      profilePicture
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
      // Selecionar um avatar aleatório
      const avatarId = Math.floor(Math.random() * 10) + 1;
      const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
      
      // Criar novo usuário
      user = new User({
        name,
        email,
        authMethod: 'google',
        googleId: ticket.getUserId(),
        avatarId,
        profilePicture: picture || profilePicture
      });
      
      await user.save();
    } else {
      // Atualizar usuário existente com informações do Google
      user.googleId = ticket.getUserId();
      
      // Atualizar avatar somente se usuário não tiver escolhido um personalizado
      if (!user.avatarId) {
        const avatarId = Math.floor(Math.random() * 10) + 1;
        user.avatarId = avatarId;
        user.profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
      }
      
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
      // Selecionar um avatar aleatório
      const avatarId = Math.floor(Math.random() * 10) + 1;
      const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
      
      // Criar novo usuário
      user = new User({
        name: firstName && lastName ? `${firstName} ${lastName}` : 'Usuário Apple',
        email,
        authMethod: 'apple',
        appleId,
        avatarId,
        profilePicture
      });
      
      await user.save();
    } else {
      // Atualizar usuário existente com informações da Apple
      user.appleId = appleId;
      
      // Atualizar avatar somente se usuário não tiver escolhido um personalizado
      if (!user.avatarId) {
        const avatarId = Math.floor(Math.random() * 10) + 1;
        user.avatarId = avatarId;
        user.profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
      }
      
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

// Atualizar avatar do usuário
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarId } = req.body;
    
    if (!avatarId || avatarId < 1 || avatarId > 10) {
      return res.status(400).json({ msg: 'ID de avatar inválido' });
    }
    
    const profilePicture = `/assets/avatars/cat-avatar-${avatarId}.png`;
    
    // Atualizar avatar do usuário
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
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};