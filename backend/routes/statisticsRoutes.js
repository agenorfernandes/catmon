const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/statistics
// @desc    Obter estatísticas gerais do sistema
// @access  Public
router.get('/', (req, res) => {
  res.json({ msg: 'API de estatísticas funcionando' });
});

// @route   GET api/statistics/users
// @desc    Obter estatísticas de usuários
// @access  Private/Admin
router.get('/users', auth, (req, res) => {
  // Verificar se é admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acesso negado' });
  }
  
  res.json({ msg: 'Estatísticas de usuários aqui' });
});

module.exports = router;