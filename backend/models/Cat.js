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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Adicionar índice geoespacial para consultas de proximidade
CatSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cat', CatSchema);
