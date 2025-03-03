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
    console.log('Requisição sem token de autenticação');
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Adicionar usuário decodificado ao request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token inválido:', err.message);
    res.status(401).json({ msg: 'Token inválido' });
  }
};