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
    { count: 1, title: 'Primeiro Contato', description: 'Fez seu primeiro check-in com um gato' },
    { count: 10, title: 'Amigo dos Gatos', description: 'Realizou 10 check-ins' },
    { count: 50, title: 'Protetor Felino', description: 'Realizou 50 check-ins' },
    { count: 100, title: 'Guardião Felino', description: 'Realizou 100 check-ins' },
    { count: 500, title: 'Lenda Felina', description: 'Realizou 500 check-ins' }
  ];
  
  // Conquistas por gatos únicos
  const uniqueCatsAchievements = [
    { count: 5, title: 'Diversidade Felina', description: 'Ajudou 5 gatos diferentes' },
    { count: 20, title: 'Embaixador Felino', description: 'Ajudou 20 gatos diferentes' },
    { count: 50, title: 'Rede de Proteção', description: 'Ajudou 50 gatos diferentes' },
    { count: 100, title: 'Protetor da Cidade', description: 'Ajudou 100 gatos diferentes' }
  ];
  
  // Verificar conquistas por check-ins
  checkInAchievements.forEach(achievement => {
    if (checkInCount === achievement.count && !existingAchievementTitles.includes(achievement.title)) {
      newAchievements.push({
        title: achievement.title,
        description: achievement.description,
        dateEarned: Date.now(),
        icon: `achievements/${achievement.count}-checkins.png`
      });
    }
  });
  
  // Verificar conquistas por gatos únicos
  uniqueCatsAchievements.forEach(achievement => {
    if (uniqueCatsCount === achievement.count && !existingAchievementTitles.includes(achievement.title)) {
      newAchievements.push({
        title: achievement.title,
        description: achievement.description,
        dateEarned: Date.now(),
        icon: `achievements/${achievement.count}-cats.png`
      });
    }
  });
  
  // Conquista por nível
  if (user.level === 10 && !existingAchievementTitles.includes('Mestre CatMon')) {
    newAchievements.push({
      title: 'Mestre CatMon',
      description: 'Atingiu o nível 10',
      dateEarned: Date.now(),
      icon: 'achievements/level-10.png'
    });
  }
  
  return newAchievements;
};
