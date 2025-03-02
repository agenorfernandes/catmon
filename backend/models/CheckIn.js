const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CheckInSchema = new Schema({
  cat: {
    type: Schema.Types.ObjectId,
    ref: 'Cat',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    address: String
  },
  actions: [{
    type: String,
    enum: ['Alimentou', 'Deu água', 'Forneceu abrigo', 'Verificou bem-estar', 'Levou ao veterinário', 'Vacinou', 'Castrou', 'Outros'],
    required: true
  }],
  actionsDescription: String,
  healthStatus: {
    type: String,
    enum: ['Excelente', 'Bom', 'Regular', 'Precisa de atenção', 'Emergência'],
    required: true
  },
  photosUrl: [String],
  needs: [{
    type: String,
    enum: ['Água', 'Comida', 'Abrigo', 'Tratamento médico', 'Outros']
  }],
  needsDescription: String,
  pointsEarned: {
    type: Number,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Gatilho que atualiza o Cat e o User após um check-in
CheckInSchema.post('save', async function(doc) {
  try {
    // Atualiza o gato com a última data de check-in e incrementa o contador
    const Cat = mongoose.model('Cat');
    await Cat.findByIdAndUpdate(doc.cat, {
      lastCheckIn: doc.createdAt,
      $inc: { totalCheckIns: 1 },
      health: doc.healthStatus,
      needs: doc.needs,
      needsDescription: doc.needsDescription,
      $set: { 'location.coordinates': doc.location.coordinates }
    });

    // Atualiza o usuário incrementando seus pontos
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.user, {
      $inc: { points: doc.pointsEarned }
    });
  } catch (err) {
    console.error('Erro ao atualizar após check-in:', err);
  }
});

// Adicionar índice geoespacial para consultas de proximidade
CheckInSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CheckIn', CheckInSchema);
