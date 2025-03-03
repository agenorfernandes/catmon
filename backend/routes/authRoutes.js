const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Nome é obrigatório').not().isEmpty(),
    check('email', 'Inclua um email válido').isEmail(),
    check('password', 'A senha deve ter 6 ou mais caracteres').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Inclua um email válido').isEmail(),
    check('password', 'A senha é obrigatória').exists()
  ],
  authController.login
);

// @route   POST api/auth/google
// @desc    Login com Google
// @access  Public
router.post('/google', authController.googleLogin);

// @route   POST api/auth/apple
// @desc    Login com Apple
// @access  Public
router.post('/apple', authController.appleLogin);

// @route   GET api/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   GET api/auth/verify
// @desc    Verificar token
// @access  Public
router.get('/verify', authController.verifyToken);

// @route   PUT api/auth/avatar
// @desc    Atualizar avatar do usuário
// @access  Private
router.put('/avatar', auth, authController.updateAvatar);

module.exports = router;