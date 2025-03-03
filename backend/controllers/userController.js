const User = require('../models/User');
const Cat = require('../models/Cat');
const CheckIn = require('../models/CheckIn');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Obter perfil do usuário
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId)
      .select('-password -googleId -appleId')
      .populate('favorites', 'name photoUrl status health');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Obter estatísticas do usuário
    const stats = await getUserStats(userId);
    
    // Obter check-ins recentes
    const recentCheckIns = await CheckIn.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .populate('cat', 'name photoUrl status');
    
    res.json({
      user,
      stats,
      recentCheckIns
    });
  } catch (err) {
    console.error('Erro em getUserProfile:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Atualizar perfil do usuário
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      pushToken,
      notificationSettings
    } = req.body;
    
    // Procurar usuário existente para obter informações atuais
    const existingUser = await User.findById(req.user.id);
    
    if (!existingUser) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Processar foto de perfil se enviada
    let profilePicture = existingUser.profilePicture;
    
    if (req.file) {
      // Salvar nova imagem
      profilePicture = `/uploads/profiles/${req.file.filename}`;
      
      // Excluir foto antiga se não for a padrão
      if (existingUser.profilePicture && 
          existingUser.profilePicture !== 'default-avatar.png' &&
          existingUser.profilePicture.startsWith('/uploads/')) {
        try {
          const oldPhotoPath = path.join(__dirname, '../..', existingUser.profilePicture);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (err) {
          console.error('Erro ao excluir foto antiga:', err);
        }
      }
    }
    
    // Construir objeto de atualização
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (location) updateFields.location = location;
    if (pushToken) updateFields.pushToken = pushToken;
    
    // Atualizar configurações de notificação
    if (notificationSettings) {
      // Usar spread para manter configurações existentes que não foram alteradas
      updateFields.notificationSettings = {
        ...existingUser.notificationSettings,
        ...notificationSettings
      };
    }
    
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
    console.error('Erro em updateUserProfile:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Obter gatos favoritos do usuário
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const { limit = 10, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Obter o usuário com os favoritos populados
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'discoveredBy',
          select: 'name profilePicture'
        },
        options: {
          limit: parseInt(limit),
          skip: skip
        }
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Contar total para paginação
    const favoritesCount = user.favorites.length;
    
    res.json({
      favorites: user.favorites,
      totalFavorites: favoritesCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(favoritesCount / limit)
    });
  } catch (err) {
    console.error('Erro em getUserFavorites:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
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
    
    res.json({ 
      msg: 'Gato adicionado aos favoritos',
      success: true
    });
  } catch (err) {
    console.error('Erro em addToFavorites:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Remover gato dos favoritos
exports.removeFromFavorites = async (req, res) => {
  try {
    const { catId } = req.params;
    
    // Verificar se o gato existe
    const cat = await Cat.findById(catId);
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Verificar se está nos favoritos
    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(catId)) {
      return res.status(400).json({ msg: 'Gato não está nos favoritos' });
    }
    
    // Remover dos favoritos
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: catId } }
    );
    
    res.json({ 
      msg: 'Gato removido dos favoritos',
      success: true
    });
  } catch (err) {
    console.error('Erro em removeFromFavorites:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Obter ranking de usuários
exports.getRanking = async (req, res) => {
  try {
    const { limit = 10, page = 1, period = 'all' } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Filtrar por período se necessário
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { createdAt: { $gte: lastMonth } };
    }
    
    // Para filtros de período, precisamos recalcular os pontos obtidos nesse período
    if (period !== 'all') {
      // Obter pontos através de check-ins no período
      const userPoints = await CheckIn.aggregate([
        { $match: dateFilter },
        { $group: {
            _id: '$user',
            points: { $sum: '$pointsEarned' },
            checkInsCount: { $sum: 1 }
          }
        },
        { $sort: { points: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);
      
      // Buscar informações detalhadas dos usuários
      const userIds = userPoints.map(up => up._id);
      const usersDetails = await User.find(
        { _id: { $in: userIds } },
        'name profilePicture level totalCatsHelped'
      );
      
      // Mesclar dados
      const rankingWithPeriod = userPoints.map(up => {
        const userDetail = usersDetails.find(u => u._id.toString() === up._id.toString());
        return {
          _id: up._id,
          name: userDetail?.name || 'Usuário',
          profilePicture: userDetail?.profilePicture || 'default-avatar.png',
          level: userDetail?.level || 1,
          points: up.points,
          checkInsCount: up.checkInsCount,
          totalCatsHelped: userDetail?.totalCatsHelped || 0
        };
      });
      
      // Obter posição do usuário atual no ranking
      let userRank = null;
      if (req.user) {
        const userPointsInPeriod = await CheckIn.aggregate([
          { $match: { ...dateFilter, user: mongoose.Types.ObjectId(req.user.id) } },
          { $group: {
              _id: '$user',
              points: { $sum: '$pointsEarned' }
            }
          }
        ]);
        
        if (userPointsInPeriod.length > 0) {
          const userPoints = userPointsInPeriod[0].points;
          
          // Contar quantos usuários têm mais pontos
          const higherUsers = await CheckIn.aggregate([
            { $match: dateFilter },
            { $group: {
                _id: '$user',
                points: { $sum: '$pointsEarned' }
              }
            },
            { $match: { points: { $gt: userPoints } } },
            { $count: 'count' }
          ]);
          
          userRank = higherUsers.length > 0 ? higherUsers[0].count + 1 : 1;
        } else {
          userRank = 'N/A'; // Usuário não tem pontos no período
        }
      }
      
      // Contar total para paginação
      const totalUsers = await CheckIn.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$user' } },
        { $count: 'count' }
      ]);
      
      return res.json({
        ranking: rankingWithPeriod,
        userRank,
        totalUsers: totalUsers.length > 0 ? totalUsers[0].count : 0,
        currentPage: parseInt(page),
        totalPages: Math.ceil((totalUsers.length > 0 ? totalUsers[0].count : 0) / limit)
      });
    }
    
    // Ranking geral (all-time)
    const topUsers = await User.find()
      .sort('-points')
      .skip(skip)
      .limit(parseInt(limit))
      .select('name profilePicture level points totalCatsHelped');
    
    // Obter posição do usuário atual no ranking
    let userRank = null;
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('points');
      if (currentUser) {
        userRank = await User.countDocuments({ points: { $gt: currentUser.points } }) + 1;
      }
    }
    
    // Contar total para paginação
    const totalUsers = await User.countDocuments();
    
    res.json({
      ranking: topUsers,
      userRank,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (err) {
    console.error('Erro em getRanking:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Obter estatísticas do usuário
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const stats = await getUserStats(userId);
    
    res.json(stats);
  } catch (err) {
    console.error('Erro em getUserStats:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Obter conquistas do usuário
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId).select('achievements');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Obter todas as conquistas possíveis do sistema
    const allAchievements = [
      {
        title: 'Primeiro Contato',
        description: 'Fez seu primeiro check-in com um gato',
        icon: 'achievements/first-checkin.png'
      },
      {
        title: 'Amigo dos Gatos',
        description: 'Realizou 10 check-ins',
        icon: 'achievements/10-checkins.png'
      },
      {
        title: 'Protetor Felino',
        description: 'Realizou 50 check-ins',
        icon: 'achievements/50-checkins.png'
      },
      {
        title: 'Guardião Felino',
        description: 'Realizou 100 check-ins',
        icon: 'achievements/100-checkins.png'
      },
      {
        title: 'Lenda Felina',
        description: 'Realizou 500 check-ins',
        icon: 'achievements/500-checkins.png'
      },
      {
        title: 'Diversidade Felina',
        description: 'Ajudou 5 gatos diferentes',
        icon: 'achievements/5-cats.png'
      },
      {
        title: 'Embaixador Felino',
        description: 'Ajudou 20 gatos diferentes',
        icon: 'achievements/20-cats.png'
      },
      {
        title: 'Rede de Proteção',
        description: 'Ajudou 50 gatos diferentes',
        icon: 'achievements/50-cats.png'
      },
      {
        title: 'Protetor da Cidade',
        description: 'Ajudou 100 gatos diferentes',
        icon: 'achievements/100-cats.png'
      },
      {
        title: 'Mestre CatMon',
        description: 'Atingiu o nível 10',
        icon: 'achievements/level-10.png'
      }
    ];
    
    // Marcar conquistas que o usuário já tem
    const userAchievementTitles = user.achievements.map(a => a.title);
    
    const achievementStatus = allAchievements.map(achievement => ({
      ...achievement,
      earned: userAchievementTitles.includes(achievement.title),
      dateEarned: user.achievements.find(a => a.title === achievement.title)?.dateEarned
    }));
    
    res.json(achievementStatus);
  } catch (err) {
    console.error('Erro em getUserAchievements:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Desativar conta de usuário
exports.deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    // Verificar senha se for auth local
    if (user.authMethod === 'local') {
      if (!password) {
        return res.status(400).json({ msg: 'Senha é obrigatória para desativar conta' });
      }
      
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Senha incorreta' });
      }
    }
    
    // Desativar a conta (não excluir)
    user.isActive = false;
    user.deactivatedAt = new Date();
    
    await user.save();
    
    res.json({ msg: 'Conta desativada com sucesso' });
  } catch (err) {
    console.error('Erro em deactivateAccount:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Função auxiliar para obter estatísticas do usuário
const getUserStats = async (userId) => {
  try {
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
      { $sort: { count: -1 } },
      { $limit: 5 }
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
    const formattedCheckInsByDay = [];
    
    for (let i = 0; i < 7; i++) {
      const dayData = checkInsByDay.find(item => item._id === i + 1);
      formattedCheckInsByDay.push({
        day: days[i],
        count: dayData ? dayData.count : 0
      });
    }
    
    // Check-ins por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const checkInsByMonth = await CheckIn.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      { 
        $group: { 
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Formatar meses
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const formattedCheckInsByMonth = [];
    
    // Preencher todos os meses dos últimos 6 meses
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript meses são 0-indexados
      
      const monthData = checkInsByMonth.find(item => 
        item._id.year === year && item._id.month === month
      );
      
      formattedCheckInsByMonth.unshift({
        month: months[month - 1],
        year: year,
        count: monthData ? monthData.count : 0
      });
    }
    
    // Gatos favoritos
    const user = await User.findById(userId).populate('favorites', 'name photoUrl status');
    const favorites = user.favorites || [];
    
    return {
      totalCheckIns,
      totalUniqueCats,
      totalDiscovered,
      actionStats,
      checkInsByDay: formattedCheckInsByDay,
      checkInsByMonth: formattedCheckInsByMonth,
      favorites: favorites.slice(0, 5) // Apenas os 5 primeiros
    };
  } catch (err) {
    console.error('Erro ao obter estatísticas do usuário:', err);
    throw err;
  }
};