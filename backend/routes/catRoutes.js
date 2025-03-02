const express = require('express');
const router = express.Router();
const catController = require('../controllers/catController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { check } = require('express-validator');

// @route   GET api/cats
// @desc    Obter todos os gatos
// @access  Public
router.get('/', catController.getAllCats);

// @route   GET api/cats/nearby
// @desc    Obter gatos próximos
// @access  Public
router.get('/nearby', catController.getNearbyCats);

// @route   GET api/cats/:id
// @desc    Obter gato por ID
// @access  Public
router.get('/:id', catController.getCatById);

// @route   POST api/cats
// @desc    Criar novo gato
// @access  Private
router.post(
  '/',
  [
    auth,
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'additionalPhotos', maxCount: 5 }
    ]),
    [
      check('name', 'Nome é obrigatório').not().isEmpty(),
      check('description', 'Descrição é obrigatória').not().isEmpty(),
      check('location', 'Localização é obrigatória').not().isEmpty()
    ]
  ],
  catController.createCat
);

// @route   PUT api/cats/:id
// @desc    Atualizar gato
// @access  Private
router.put(
  '/:id',
  [
    auth,
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'additionalPhotos', maxCount: 5 }
    ])
  ],
  catController.updateCat
);

// @route   DELETE api/cats/:id
// @desc    Excluir gato
// @access  Private
router.delete('/:id', auth, catController.deleteCat);

module.exports = router;