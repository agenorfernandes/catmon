const CheckIn = require('../models/CheckIn');
const Cat = require('../models/Cat');
const User = require('../models/User');
const pointsCalculator = require('../utils/pointsCalculator');

// Obter check-ins por gato
exports.getCheckInsByCat = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const catId = req.params.catId;
    
    // Validar se o gato existe
    const cat = await Cat.findById(catId);
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Buscar check-ins paginados
    const checkIns = await CheckIn.find({ cat: catId })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name profilePicture');
    
    // Contar total para paginação
    const total = await CheckIn.countDocuments({ cat: catId });
    
    res.json({
      checkIns,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCheckIns: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter check-ins por usuário
exports.getCheckInsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId || req.user.id;
    
    // Buscar check-ins paginados
    const checkIns = await CheckIn.find({ user: userId })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('cat', 'name photoUrl location')
      .populate('user', 'name profilePicture');
    
    // Contar total para paginação
    const total = await CheckIn.countDocuments({ user: userId });
    
    res.json({
      checkIns,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCheckIns: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Criar novo check-in
exports.createCheckIn = async (req, res) => {
  try {
    const {
      catId,
      location,
      actions,
      actionsDescription,
      healthStatus,
      photosUrl,
      needs,
      needsDescription
    } = req.body;
    
    // Verificar se o gato existe
    const cat = await Cat.findById(catId);
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Calcular pontos com base nas ações
    const pointsEarned = pointsCalculator.calculatePoints(actions);
    
    // Criar novo check-in
    const newCheckIn = new CheckIn({
      cat: catId,
      user: req.user.id,
      location,
      actions,
      actionsDescription,
      healthStatus,
      photosUrl: photosUrl || [],
      needs: needs || [],
      needsDescription,
      pointsEarned
    });
    
    const checkIn = await newCheckIn.save();
    
    // Atualizar estatísticas do usuário
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalCatsHelped: 1 }
    });
    
    // Verificar se o usuário merece conquistas
    await checkAchievements(req.user.id);
    
    res.status(201).json(checkIn);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter check-in por ID
exports.getCheckInById = async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id)
      .populate('cat', 'name photoUrl location')
      .populate('user', 'name profilePicture');
    
    if (!checkIn) {
      return res.status(404).json({ msg: 'Check-in não encontrado' });
    }
    
    res.json(checkIn);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Check-in não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Excluir check-in
exports.deleteCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    
    if (!checkIn) {
      return res.status(404).json({ msg: 'Check-in não encontrado' });
    }
    
    // Verificar se o usuário é o autor do check-in ou admin
    const isAdmin = req.user.role === 'admin';
    if (checkIn.user.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ msg: 'Acesso negado. Você não pode excluir este check-in' });
    }
    
    // Reverter os pontos ganhos
    await User.findByIdAndUpdate(checkIn.user, {
      $inc: { points: -checkIn.pointsEarned }
    });
    
    // Excluir check-in
    await checkIn.remove();
    
    res.json({ msg: 'Check-in removido' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Check-in não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Função auxiliar para verificar conquistas
const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    const totalCheckIns = await CheckIn.countDocuments({ user: userId });
    const distinctCats = await CheckIn.distinct('cat', { user: userId });
    const totalCats = distinctCats.length;
    
    const newAchievements = [];
    
    // Conquista: Primeiro Check-in
    if (totalCheckIns === 1) {
      newAchievements.push({
        title: 'Primeiro Contato',
        description: 'Fez seu primeiro check-in com um gato',
        dateEarned: Date.now(),
        icon: 'achievements/first-checkin.png'
      });
    }
    
    // Conquista: 10 Check-ins
    if (totalCheckIns === 10) {
      newAchievements.push({
        title: 'Amigo dos Gatos',
        description: 'Realizou 10 check-ins',
        dateEarned: Date.now(),
        icon: 'achievements/10-checkins.png'
      });
    }
    
    // Conquista: 50 Check-ins
    if (totalCheckIns === 50) {
      newAchievements.push({
        title: 'Protetor Felino',
        description: 'Realizou 50 check-ins',
        dateEarned: Date.now(),
        icon: 'achievements/50-checkins.png'
      });
    }
    
    // Conquista: 5 Gatos diferentes
    if (totalCats === 5) {
      newAchievements.push({
        title: 'Diversidade Felina',
        description: 'Ajudou 5 gatos diferentes',
        dateEarned: Date.now(),
        icon: 'achievements/5-cats.png'
      });
    }
    
    // Conquista: 20 Gatos diferentes
    if (totalCats === 20) {
      newAchievements.push({
        title: 'Embaixador Felino',
        description: 'Ajudou 20 gatos diferentes',
        dateEarned: Date.now(),
        icon: 'achievements/20-cats.png'
      });
    }
    
    // Adicionar novas conquistas ao usuário
    if (newAchievements.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: { $each: newAchievements } }
      });
    }
  } catch (err) {
    console.error('Erro ao verificar conquistas:', err);
  }
};
