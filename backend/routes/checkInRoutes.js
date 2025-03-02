const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { check } = require('express-validator');

// @route   GET api/checkins/cat/:catId
// @desc    Obter check-ins por gato
// @access  Public
router.get('/cat/:catId', checkInController.getCheckInsByCat);

// @route   GET api/checkins/user/:userId?
// @desc    Obter check-ins por usuário (opcional: ID do usuário ou usuário atual)
// @access  Private
router.get('/user/:userId?', auth, checkInController.getCheckInsByUser);

// @route   GET api/checkins/:id
// @desc    Obter check-in por ID
// @access  Public
router.get('/:id', checkInController.getCheckInById);

// @route   POST api/checkins
// @desc    Criar novo check-in
// @access  Private
router.post(
  '/',
  [
    auth,
    upload.array('photos', 5),
    [
      check('catId', 'ID do gato é obrigatório').not().isEmpty(),
      check('location', 'Localização é obrigatória').not().isEmpty(),
      check('actions', 'Pelo menos uma ação é obrigatória').isArray({ min: 1 }),
      check('healthStatus', 'Status de saúde é obrigatório').not().isEmpty()
    ]
  ],
  checkInController.createCheckIn
);

// @route   DELETE api/checkins/:id
// @desc    Excluir check-in
// @access  Private
router.delete('/:id', auth, checkInController.deleteCheckIn);

module.exports = router;