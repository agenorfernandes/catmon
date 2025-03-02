const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
module.exports = function(req, res, next) {
  // Obter token do header
  const token = req.header('x-auth-token');
  
  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Adicionar usuário decodificado ao request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};