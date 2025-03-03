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
  editHistory: [{
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    pointsDiff: Number,
    changes: Object
  }],
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
    
    // Verificar se é o primeiro check-in do usuário para este gato
    const isFirstCheckIn = await mongoose.model('CheckIn').countDocuments({
      user: doc.user,
      cat: doc.cat,
      _id: { $ne: doc._id }
    }) === 0;
    
    if (isFirstCheckIn) {
      await User.findByIdAndUpdate(doc.user, {
        $inc: { totalCatsHelped: 1 }
      });
    }
    
    // Verificar se o gato está em emergência para enviar notificações
    if (doc.healthStatus === 'Emergência') {
      // Implementação real usaria o serviço de notificações
      console.log(`Gato ${doc.cat} em emergência! Enviar notificações a usuários próximos.`);
      
      // Exemplo: Poderíamos chamar o serviço de notificações aqui
      // const notificationService = require('../utils/notificationService');
      // await notificationService.notifyEmergency(doc.cat);
    }
    
    // Notificar usuários que têm este gato como favorito
    // await notificationService.notifyFavoriteUpdate(doc._id);
    
  } catch (err) {
    console.error('Erro ao atualizar após check-in:', err);
  }
});

// Gatilho antes de remover um check-in
CheckInSchema.pre('deleteOne', { document: true }, async function() {
  try {
    const User = mongoose.model('User');
    
    // Reverter os pontos ganhos
    await User.findByIdAndUpdate(this.user, {
      $inc: { points: -this.pointsEarned }
    });
    
    // Ajustar o nível do usuário
    const user = await User.findById(this.user);
    await user.adjustLevel();
    
  } catch (err) {
    console.error('Erro ao processar remoção de check-in:', err);
  }
});

// Adicionar índice geoespacial para consultas de proximidade
CheckInSchema.index({ location: '2dsphere' });

// Criar índices para consultas comuns
CheckInSchema.index({ cat: 1, createdAt: -1 });
CheckInSchema.index({ user: 1, createdAt: -1 });
CheckInSchema.index({ 'actions': 1 });
CheckInSchema.index({ healthStatus: 1 });

module.exports = mongoose.model('CheckIn', CheckInSchema);