const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  googleId: String,
  appleId: String,
  avatarId: {
    type: Number,
    default: function() {
      // Gerar um ID aleatório entre 1-10 ao criar um novo usuário
      return Math.floor(Math.random() * 10) + 1;
    }
  },
  profilePicture: {
    type: String,
    default: function() {
      return `/assets/avatars/cat-avatar-${this.avatarId || 1}.png`;
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  bio: String,
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: String,
    description: String,
    dateEarned: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  totalCatsHelped: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Cat'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  pushToken: String,
  notificationSettings: {
    nearbyAlerts: {
      type: Boolean,
      default: true
    },
    favoriteUpdates: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    radius: {
      type: Number,
      default: 5000 // metros
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Atualizar nível quando os pontos forem modificados
UserSchema.pre('save', function(next) {
  if (this.isModified('points')) {
    this.level = this.calculateLevel();
  }
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Método para gerar JWT
UserSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

// Método para calcular nível baseado em pontos
UserSchema.methods.calculateLevel = function() {
  // Fórmula: nível = 1 + floor(sqrt(pontos / 100))
  const level = 1 + Math.floor(Math.sqrt(this.points / 100));
  return level;
};

// Método para ajustar o nível após alterações de pontos
UserSchema.methods.adjustLevel = async function() {
  const newLevel = this.calculateLevel();
  if (this.level !== newLevel) {
    this.level = newLevel;
    await this.save();
  }
  return this;
};

// Método para calcular pontos para próximo nível
UserSchema.methods.pointsToNextLevel = function() {
  const currentLevel = this.level;
  const nextLevel = currentLevel + 1;
  
  // Pontos necessários para o próximo nível: 100 * (nextLevel - 1)^2
  const pointsNeeded = 100 * Math.pow(nextLevel - 1, 2);
  
  // Diferença
  return pointsNeeded - this.points;
};

// Método para adicionar uma conquista
UserSchema.methods.addAchievement = async function(achievement) {
  // Verificar se já possui esta conquista
  const hasAchievement = this.achievements.some(a => a.title === achievement.title);
  
  if (!hasAchievement) {
    this.achievements.push({
      title: achievement.title,
      description: achievement.description,
      dateEarned: new Date(),
      icon: achievement.icon
    });
    
    await this.save();
    return true; // Nova conquista
  }
  
  return false; // Já possui esta conquista
};

// Método para verificar se tem uma conquista específica
UserSchema.methods.hasAchievement = function(title) {
  return this.achievements.some(a => a.title === title);
};

// Método para formatar o perfil do usuário para API
UserSchema.methods.formatProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profilePicture: this.profilePicture,
    avatarId: this.avatarId,
    bio: this.bio || '',
    level: this.level,
    points: this.points,
    totalCatsHelped: this.totalCatsHelped,
    achievementsCount: this.achievements.length,
    favoritesCount: this.favorites.length,
    role: this.role,
    createdAt: this.createdAt
  };
};

// Adicionar índice geoespacial para consultas de proximidade
UserSchema.index({ location: '2dsphere' });

// Criar índices para consultas comuns
UserSchema.index({ email: 1 });
UserSchema.index({ points: -1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ appleId: 1 });

module.exports = mongoose.model('User', UserSchema);