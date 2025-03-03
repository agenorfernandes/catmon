/**
 * Sistema de cálculo de pontos para ações com gatos
 */

// Pontuação base para cada tipo de ação
const ACTION_POINTS = {
  'Alimentou': 10,
  'Deu água': 8,
  'Forneceu abrigo': 15,
  'Verificou bem-estar': 5,
  'Levou ao veterinário': 25,
  'Vacinou': 20,
  'Castrou': 30,
  'Outros': 5
};

// Pontuação base para registrar um novo gato
const NEW_CAT_POINTS = 50;

/**
 * Calcula pontos com base nas ações realizadas
 * @param {Array} actions - Lista de ações realizadas
 * @returns {Number} - Total de pontos
 */
exports.calculatePoints = (actions) => {
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return 5; // Pontuação mínima para qualquer check-in
  }
  
  let totalPoints = 0;
  
  // Somar pontos de cada ação
  actions.forEach(action => {
    totalPoints += ACTION_POINTS[action] || 5;
  });
  
  // Aplicar bônus para múltiplas ações
  if (actions.length > 1) {
    // Bônus de 20% para quem realiza múltiplas ações
    totalPoints = Math.floor(totalPoints * 1.2);
  }
  
  // Verificar se há ações de alto valor (veterinário, castração, vacinação)
  const hasHighValueAction = actions.some(action => 
    ['Levou ao veterinário', 'Vacinou', 'Castrou'].includes(action)
  );
  
  if (hasHighValueAction) {
    // Bônus adicional de 10 pontos para ações de alto valor
    totalPoints += 10;
  }
  
  // Aplicar bônus para gatos em emergência
  if (actions.includes('Levou ao veterinário') && 
      (actions.includes('Emergência') || actions.includes('Precisa de atenção'))) {
    totalPoints += 15; // Bônus para ajuda em situações críticas
  }
  
  return totalPoints;
};

/**
 * Calcula o nível do usuário com base nos pontos
 * @param {Number} points - Total de pontos do usuário
 * @returns {Number} - Nível calculado
 */
exports.calculateLevel = (points) => {
  // Fórmula: nível = 1 + floor(sqrt(pontos / 100))
  return 1 + Math.floor(Math.sqrt(points / 100));
};

/**
 * Calcula pontos necessários para o próximo nível
 * @param {Number} currentLevel - Nível atual
 * @returns {Number} - Pontos necessários
 */
exports.pointsToNextLevel = (currentLevel) => {
  // Pontos para o nível atual: 100 * (currentLevel - 1)^2
  const currentLevelPoints = 100 * Math.pow(currentLevel - 1, 2);
  
  // Pontos para o próximo nível: 100 * currentLevel^2
  const nextLevelPoints = 100 * Math.pow(currentLevel, 2);
  
  // Diferença
  return nextLevelPoints - currentLevelPoints;
};

/**
 * Calcula a distribuição de experiência para mostrar na barra de progresso
 * @param {Number} points - Pontos atuais do usuário
 * @param {Number} level - Nível atual do usuário
 * @returns {Object} - Informações sobre progresso e próximo nível
 */
exports.getExperienceProgress = (points, level) => {
  // Pontos para o nível atual: 100 * (level - 1)^2
  const currentLevelPoints = 100 * Math.pow(level - 1, 2);
  
  // Pontos para o próximo nível: 100 * level^2
  const nextLevelPoints = 100 * Math.pow(level, 2);
  
  // Pontos ganhos no nível atual
  const pointsInCurrentLevel = points - currentLevelPoints;
  
  // Pontos necessários para subir de nível
  const pointsToNextLevel = nextLevelPoints - currentLevelPoints;
  
  // Porcentagem de progresso
  const progressPercentage = Math.floor((pointsInCurrentLevel / pointsToNextLevel) * 100);
  
  return {
    level,
    nextLevel: level + 1,
    points,
    pointsInCurrentLevel,
    pointsToNextLevel,
    progressPercentage,
    totalPointsNeeded: nextLevelPoints
  };
};

/**
 * Verifica se o usuário ganhou novas conquistas
 * @param {Object} user - Objeto do usuário
 * @param {Number} checkInCount - Total de check-ins
 * @param {Number} uniqueCatsCount - Total de gatos únicos
 * @returns {Array} - Lista de novas conquistas
 */
exports.checkAchievements = (user, checkInCount, uniqueCatsCount) => {
  const newAchievements = [];
  const existingAchievementTitles = user.achievements.map(a => a.title);
  
  // Conquistas por check-ins
  const checkInAchievements = [
    { count: 1, title: 'Primeiro Contato', description: 'Fez seu primeiro check-in com um gato', icon: 'achievements/first-checkin.png' },
    { count: 10, title: 'Amigo dos Gatos', description: 'Realizou 10 check-ins', icon: 'achievements/10-checkins.png' },
    { count: 50, title: 'Protetor Felino', description: 'Realizou 50 check-ins', icon: 'achievements/50-checkins.png' },
    { count: 100, title: 'Guardião Felino', description: 'Realizou 100 check-ins', icon: 'achievements/100-checkins.png' },
    { count: 500, title: 'Lenda Felina', description: 'Realizou 500 check-ins', icon: 'achievements/500-checkins.png' }
  ];
  
  // Conquistas por gatos únicos
  const uniqueCatsAchievements = [
    { count: 5, title: 'Diversidade Felina', description: 'Ajudou 5 gatos diferentes', icon: 'achievements/5-cats.png' },
    { count: 20, title: 'Embaixador Felino', description: 'Ajudou 20 gatos diferentes', icon: 'achievements/20-cats.png' },
    { count: 50, title: 'Rede de Proteção', description: 'Ajudou 50 gatos diferentes', icon: 'achievements/50-cats.png' },
    { count: 100, title: 'Protetor da Cidade', description: 'Ajudou 100 gatos diferentes', icon: 'achievements/100-cats.png' }
  ];
  
  // Verificar conquistas por check-ins
  checkInAchievements.forEach(achievement => {
    if (checkInCount >= achievement.count && !existingAchievementTitles.includes(achievement.title)) {
      newAchievements.push({
        title: achievement.title,
        description: achievement.description,
        dateEarned: Date.now(),
        icon: achievement.icon
      });
    }
  });
  
  // Verificar conquistas por gatos únicos
  uniqueCatsAchievements.forEach(achievement => {
    if (uniqueCatsCount >= achievement.count && !existingAchievementTitles.includes(achievement.title)) {
      newAchievements.push({
        title: achievement.title,
        description: achievement.description,
        dateEarned: Date.now(),
        icon: achievement.icon
      });
    }
  });
  
  // Conquista por nível
  if (user.level >= 10 && !existingAchievementTitles.includes('Mestre CatMon')) {
    newAchievements.push({
      title: 'Mestre CatMon',
      description: 'Atingiu o nível 10',
      dateEarned: Date.now(),
      icon: 'achievements/level-10.png'
    });
  }
  
  return newAchievements;
};

/**
 * Calcula streaks (sequências) de check-ins
 * @param {Array} checkInDates - Array de datas de check-ins 
 * @returns {Object} - Informações sobre as sequências de check-ins
 */
exports.calculateStreaks = (checkInDates) => {
  if (!checkInDates || checkInDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0
    };
  }
  
  // Ordenar datas do mais recente para o mais antigo
  const sortedDates = [...checkInDates].sort((a, b) => new Date(b) - new Date(a));
  
  // Converter para objetos Date
  const dates = sortedDates.map(date => new Date(date));
  
  // Verificar se o check-in mais recente foi hoje ou ontem
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mostRecentDate = new Date(dates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // Se o check-in mais recente não foi hoje nem ontem, streak atual é 0
  if (mostRecentDate.getTime() !== today.getTime() && 
      mostRecentDate.getTime() !== yesterday.getTime()) {
    return {
      currentStreak: 0,
      longestStreak: calculateLongestStreak(dates)
    };
  }
  
  // Calcular streak atual
  let currentStreak = 1;
  let previousDate = mostRecentDate;
  
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    currentDate.setHours(0, 0, 0, 0);
    
    const expectedPreviousDay = new Date(previousDate);
    expectedPreviousDay.setDate(expectedPreviousDay.getDate() - 1);
    
    if (currentDate.getTime() === expectedPreviousDay.getTime()) {
      currentStreak++;
      previousDate = currentDate;
    } else {
      break;
    }
  }
  
  return {
    currentStreak,
    longestStreak: calculateLongestStreak(dates)
  };
};

// Função auxiliar para calcular o streak mais longo
function calculateLongestStreak(dates) {
  if (dates.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  let previousDate = new Date(dates[0]);
  previousDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    currentDate.setHours(0, 0, 0, 0);
    
    const expectedPreviousDay = new Date(previousDate);
    expectedPreviousDay.setDate(expectedPreviousDay.getDate() - 1);
    
    if (currentDate.getTime() === expectedPreviousDay.getTime()) {
      currentStreak++;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentStreak = 1;
    }
    
    previousDate = currentDate;
  }
  
  return Math.max(longestStreak, currentStreak);
}