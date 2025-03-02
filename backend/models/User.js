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
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
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
    dateEarned: Date,
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
    }
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
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
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

// Atualizar nível quando os pontos forem modificados
UserSchema.pre('save', function(next) {
  if (this.isModified('points')) {
    this.level = this.calculateLevel();
  }
  next();
});

// Adicionar índice geoespacial para consultas de proximidade
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
