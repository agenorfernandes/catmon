const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { upload, handleMulterErrors } = require('../middleware/upload');

// @route   GET api/users/profile/:id?
// @desc    Obter perfil do usuário (opcional: ID do usuário ou usuário atual)
// @access  Private
router.get('/profile/:id?', auth, userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put(
  '/profile',
  [
    auth, 
    upload.single('profilePicture'),
    handleMulterErrors
  ],
  userController.updateUserProfile
);

// @route   GET api/users/favorites
// @desc    Obter gatos favoritos do usuário
// @access  Private
router.get('/favorites', auth, userController.getUserFavorites);

// @route   POST api/users/favorites
// @desc    Adicionar gato aos favoritos
// @access  Private
router.post('/favorites', auth, userController.addToFavorites);

// @route   DELETE api/users/favorites/:catId
// @desc    Remover gato dos favoritos
// @access  Private
router.delete('/favorites/:catId', auth, userController.removeFromFavorites);

// @route   GET api/users/ranking
// @desc    Obter ranking de usuários
// @access  Public (modificado para permitir acesso sem autenticação)
router.get('/ranking', userController.getRanking);

// @route   GET api/users/stats/:id?
// @desc    Obter estatísticas do usuário (opcional: ID do usuário ou usuário atual)
// @access  Private
router.get('/stats/:id?', auth, userController.getUserStats);

// @route   GET api/users/achievements/:id?
// @desc    Obter conquistas do usuário
// @access  Private
router.get('/achievements/:id?', auth, userController.getUserAchievements);

// @route   PUT api/users/profile/avatar
// @desc    Atualizar avatar do usuário
// @access  Private
router.put('/profile/avatar', auth, userController.updateUserAvatar);

// @route   POST api/users/deactivate
// @desc    Desativar conta de usuário
// @access  Private
router.post('/deactivate', auth, userController.deactivateAccount);

module.exports = router;