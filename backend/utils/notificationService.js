/**
 * Serviço para gerenciar notificações push para usuários do KatMon
 */
const User = require('../models/User');
const Cat = require('../models/Cat');
const { Expo } = require('expo-server-sdk');

// Criar uma instância do SDK do Expo
const expo = new Expo();

const notificationService = {
  /**
   * Envia notificação para um usuário específico
   * @param {string} userId - ID do usuário 
   * @param {Object} notification - Objeto com título, corpo e dados da notificação
   * @returns {Promise<Object>} - Resultado do envio
   */
  sendToUser: async (userId, notification) => {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.pushToken || !user.isActive) {
        return { success: false, message: 'Usuário não disponível para notificação' };
      }
      
      const pushToken = user.pushToken;
      
      // Verificar se o token é válido
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Token de push inválido para usuário ${userId}`);
        return { success: false, message: 'Token de push inválido' };
      }
      
      // Criar mensagem
      const message = {
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: 1
      };
      
      // Enviar notificação
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
          return { success: false, error };
        }
      }
      
      return { success: true, tickets };
    } catch (error) {
      console.error('Erro ao enviar notificação para usuário:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Notifica usuários sobre um gato próximo em emergência
   * @param {string} catId - ID do gato
   * @returns {Promise<Object>} - Resultado do envio
   */
  notifyEmergency: async (catId) => {
    try {
      const cat = await Cat.findById(catId).populate('discoveredBy', 'name');
      
      if (!cat || cat.health !== 'Emergência') {
        return { success: false, message: 'Gato não está em emergência' };
      }
      
      // Encontrar usuários próximos com notificações ativadas
      const usersToNotify = await User.find({
        'notificationSettings.nearbyAlerts': true,
        'isActive': true,
        'pushToken': { $exists: true, $ne: null },
        'location': {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: cat.location.coordinates
            },
            $maxDistance: function() {
              return this.notificationSettings.radius || 5000;
            }
          }
        }
      });
      
      // Não notificar o próprio descobridor
      const filteredUsers = usersToNotify.filter(
        user => user._id.toString() !== cat.discoveredBy._id.toString()
      );
      
      // Enviar notificações
      const results = [];
      
      for (const user of filteredUsers) {
        const notification = {
          title: '🚨 Emergência: Gato precisando de ajuda!',
          body: `${cat.name} está em emergência perto de você. Registrado por ${cat.discoveredBy.name}`,
          data: {
            type: 'emergency',
            catId: cat._id.toString(),
            screen: 'CatDetails'
          }
        };
        
        const result = await notificationService.sendToUser(user._id, notification);
        results.push(result);
      }
      
      return { 
        success: true, 
        notifiedUsers: filteredUsers.length,
        results 
      };
    } catch (error) {
      console.error('Erro ao enviar notificações de emergência:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Notifica usuários sobre novos check-ins em seus gatos favoritos
   * @param {string} checkInId - ID do check-in
   * @returns {Promise<Object>} - Resultado do envio
   */
  notifyFavoriteUpdate: async (checkInId) => {
    try {
      const checkIn = await CheckIn.findById(checkInId)
        .populate('cat', 'name')
        .populate('user', 'name');
      
      if (!checkIn) {
        return { success: false, message: 'Check-in não encontrado' };
      }
      
      // Encontrar usuários que têm este gato como favorito
      const usersToNotify = await User.find({
        'favorites': checkIn.cat._id,
        'notificationSettings.favoriteUpdates': true,
        'isActive': true,
        'pushToken': { $exists: true, $ne: null }
      });
      
      // Não notificar o próprio autor do check-in
      const filteredUsers = usersToNotify.filter(
        user => user._id.toString() !== checkIn.user._id.toString()
      );
      
      // Enviar notificações
      const results = [];
      
      for (const user of filteredUsers) {
        const notification = {
          title: `Atualização: ${checkIn.cat.name}`,
          body: `${checkIn.user.name} fez um check-in com ${checkIn.cat.name}`,
          data: {
            type: 'favorite_update',
            catId: checkIn.cat._id.toString(),
            checkInId: checkIn._id.toString(),
            screen: 'CatDetails'
          }
        };
        
        const result = await notificationService.sendToUser(user._id, notification);
        results.push(result);
      }
      
      return { 
        success: true, 
        notifiedUsers: filteredUsers.length,
        results 
      };
    } catch (error) {
      console.error('Erro ao enviar notificações de favoritos:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Notifica um usuário sobre uma nova conquista
   * @param {string} userId - ID do usuário
   * @param {Object} achievement - Objeto com dados da conquista
   * @returns {Promise<Object>} - Resultado do envio
   */
  notifyAchievement: async (userId, achievement) => {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.notificationSettings.achievementAlerts || !user.isActive) {
        return { success: false, message: 'Usuário não disponível ou notificações desativadas' };
      }
      
      const notification = {
        title: '🏆 Nova Conquista Desbloqueada!',
        body: `Parabéns! Você desbloqueou a conquista "${achievement.title}"`,
        data: {
          type: 'achievement',
          achievementTitle: achievement.title,
          screen: 'Achievements'
        }
      };
      
      return await notificationService.sendToUser(userId, notification);
    } catch (error) {
      console.error('Erro ao enviar notificação de conquista:', error);
      return { success: false, error };
    }
  }
};

module.exports = notificationService;
