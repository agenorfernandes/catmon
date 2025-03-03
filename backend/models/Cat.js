const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CatSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  additionalPhotos: [String],
  health: {
    type: String,
    enum: ['Excelente', 'Bom', 'Regular', 'Precisa de atenção', 'Emergência'],
    default: 'Regular'
  },
  color: {
    type: String,
    required: true
  },
  estimatedAge: {
    type: String,
    enum: ['Filhote', 'Jovem', 'Adulto', 'Idoso', 'Desconhecido'],
    default: 'Desconhecido'
  },
  gender: {
    type: String,
    enum: ['Macho', 'Fêmea', 'Desconhecido'],
    default: 'Desconhecido'
  },
  isSterilized: {
    type: Boolean,
    default: false
  },
  isVaccinated: {
    type: Boolean,
    default: false
  },
  personalityTraits: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  discoveredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastCheckIn: {
    type: Date,
    default: Date.now
  },
  totalCheckIns: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Ativo', 'Adotado', 'Em tratamento', 'Desaparecido', 'Falecido'],
    default: 'Ativo'
  },
  needs: [{
    type: String,
    enum: ['Água', 'Comida', 'Abrigo', 'Tratamento médico', 'Outros']
  }],
  needsDescription: String,
  adopter: {
    name: String,
    contact: String,
    adoptionDate: Date,
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  editHistory: [{
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changes: Object
  }]
}, { timestamps: true });

// Adicionar índice geoespacial para consultas de proximidade
CatSchema.index({ location: '2dsphere' });

// Criar índice em campo de saúde para busca rápida de emergências
CatSchema.index({ health: 1 });

// Criar índice no campo de status
CatSchema.index({ status: 1 });

// Método para marcar um gato como adotado
CatSchema.methods.markAsAdopted = function(adopterInfo) {
  this.status = 'Adotado';
  this.adopter = {
    name: adopterInfo.name,
    contact: adopterInfo.contact,
    adoptionDate: adopterInfo.adoptionDate || new Date(),
    notes: adopterInfo.notes
  };
  return this.save();
};

// Método para atualizar o estado de saúde
CatSchema.methods.updateHealth = function(health) {
  this.health = health;
  this.updatedAt = new Date();
  return this.save();
};

// Método para formatar dados para a API
CatSchema.methods.toAPI = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    photoUrl: this.photoUrl,
    additionalPhotos: this.additionalPhotos,
    health: this.health,
    color: this.color,
    estimatedAge: this.estimatedAge,
    gender: this.gender,
    isSterilized: this.isSterilized,
    isVaccinated: this.isVaccinated,
    personalityTraits: this.personalityTraits,
    location: {
      coordinates: this.location.coordinates,
      address: this.location.address
    },
    status: this.status,
    needs: this.needs,
    needsDescription: this.needsDescription,
    lastCheckIn: this.lastCheckIn,
    totalCheckIns: this.totalCheckIns,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Cat', CatSchema);