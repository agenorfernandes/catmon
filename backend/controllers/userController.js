const User = require('../models/User');
const Cat = require('../models/Cat');
const CheckIn = require('../models/CheckIn');

// Obter perfil do usuário
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId).select('-password -googleId -appleId');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Obter estatísticas do usuário
    const stats = await getUserStats(userId);
    
    res.json({
      user,
      stats
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Atualizar perfil do usuário
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      profilePicture,
      location,
      pushToken,
      notificationSettings
    } = req.body;
    
    // Construir objeto de atualização
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (location) updateFields.location = location;
    if (pushToken) updateFields.pushToken = pushToken;
    if (notificationSettings) updateFields.notificationSettings = notificationSettings;
    
    // Atualizar usuário
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password -googleId -appleId');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter gatos favoritos do usuário
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'discoveredBy',
          select: 'name profilePicture'
        }
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Adicionar gato aos favoritos
exports.addToFavorites = async (req, res) => {
  try {
    const { catId } = req.body;
    
    // Verificar se o gato existe
    const cat = await Cat.findById(catId);
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Verificar se já está nos favoritos
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(catId)) {
      return res.status(400).json({ msg: 'Gato já está nos favoritos' });
    }
    
    // Adicionar aos favoritos
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { favorites: catId } }
    );
    
    res.json({ msg: 'Gato adicionado aos favoritos' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Remover gato dos favoritos
exports.removeFromFavorites = async (req, res) => {
  try {
    const { catId } = req.params;
    
    // Remover dos favoritos
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: catId } }
    );
    
    res.json({ msg: 'Gato removido dos favoritos' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter ranking de usuários
exports.getRanking = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topUsers = await User.find()
      .sort('-points')
      .limit(parseInt(limit))
      .select('name profilePicture level points totalCatsHelped');
    
    // Obter posição do usuário atual no ranking
    const currentUser = await User.findById(req.user.id).select('points');
    const userRank = await User.countDocuments({ points: { $gt: currentUser.points } }) + 1;
    
    res.json({
      ranking: topUsers,
      userRank
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter estatísticas do usuário
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const stats = await getUserStats(userId);
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Função auxiliar para obter estatísticas do usuário
const getUserStats = async (userId) => {
  // Total de check-ins
  const totalCheckIns = await CheckIn.countDocuments({ user: userId });
  
  // Gatos únicos ajudados
  const distinctCats = await CheckIn.distinct('cat', { user: userId });
  const totalUniqueCats = distinctCats.length;
  
  // Gatos descobertos
  const totalDiscovered = await Cat.countDocuments({ discoveredBy: userId });
  
  // Ações mais frequentes
  const actionStats = await CheckIn.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $unwind: '$actions' },
    { $group: { _id: '$actions', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Check-ins por dia da semana
  const checkInsByDay = await CheckIn.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { 
      $group: { 
        _id: { $dayOfWeek: '$createdAt' }, 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Formatar dias da semana
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const formattedCheckInsByDay = checkInsByDay.map(item => ({
    day: days[item._id - 1],
    count: item.count
  }));
  
  return {
    totalCheckIns,
    totalUniqueCats,
    totalDiscovered,
    actionStats,
    checkInsByDay: formattedCheckInsByDay
  };
};
