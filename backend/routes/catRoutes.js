const express = require('express');
const router = express.Router();
const catController = require('../controllers/catController');
const auth = require('../middleware/auth');
const { upload, handleMulterErrors } = require('../middleware/upload');
const { check, validationResult } = require('express-validator');

// Middleware para verificar resultados da validação
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: 'Erros de validação',
      errors: errors.array() 
    });
  }
  next();
};

// Middleware de debug para verificar o corpo da requisição
const logRequestBody = (req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('Body recebido:', req.body);
  console.log('Arquivos recebidos:', req.files);
  next();
};

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
    handleMulterErrors,
    logRequestBody,
    [
      check('name', 'Nome é obrigatório').notEmpty(),
      check('description', 'Descrição é obrigatória').notEmpty(),
      check('location', 'Localização é obrigatória').notEmpty()
    ],
    validateFields
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
    ]),
    handleMulterErrors,
    logRequestBody
  ],
  catController.updateCat
);

// @route   DELETE api/cats/:id
// @desc    Excluir gato
// @access  Private
router.delete('/:id', auth, catController.deleteCat);

// @route   DELETE api/cats/:id/photo/:photoIndex
// @desc    Remover foto adicional de um gato
// @access  Private
router.delete('/:id/photo/:photoIndex', auth, catController.removePhoto);

module.exports = router;