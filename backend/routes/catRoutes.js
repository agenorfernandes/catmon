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
router.delete('/:id', auth, async (req, res) => {
  try {
    const Cat = require('../models/Cat');
    const CheckIn = require('../models/CheckIn');
    
    const cat = await Cat.findById(req.params.id);
    
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Verificar se o usuário é o descobridor ou admin
    const isAdmin = req.user.role === 'admin';
    if (cat.discoveredBy.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ msg: 'Acesso negado. Você não pode excluir este gato' });
    }
    
    // Excluir check-ins relacionados
    await CheckIn.deleteMany({ cat: cat._id });
    
    // Excluir gato
    await Cat.deleteOne({ _id: cat._id });
    
    res.json({ msg: 'Gato removido' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// @route   DELETE api/cats/:id/photo/:photoIndex
// @desc    Remover foto adicional de um gato
// @access  Private
router.delete('/:id/photo/:photoIndex', auth, async (req, res) => {
  try {
    const Cat = require('../models/Cat');
    
    const { id, photoIndex } = req.params;
    const index = parseInt(photoIndex);
    
    if (isNaN(index)) {
      return res.status(400).json({ msg: 'Índice de foto inválido' });
    }
    
    const cat = await Cat.findById(id);
    
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Verificar se o usuário é o descobridor ou admin
    const isAdmin = req.user.role === 'admin';
    if (cat.discoveredBy.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ msg: 'Acesso negado. Você não pode editar este gato' });
    }
    
    // Verificar se o índice é válido
    if (index < 0 || index >= cat.additionalPhotos.length) {
      return res.status(400).json({ msg: 'Índice de foto inválido' });
    }
    
    // Remover a foto do array
    cat.additionalPhotos.splice(index, 1);
    
    await cat.save();
    
    res.json({ msg: 'Foto removida com sucesso', cat });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

module.exports = router;