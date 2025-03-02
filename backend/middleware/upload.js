const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Certificar-se de que o diretório de upload existe
const ensureUploadDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuração de armazenamento (armazenamento local)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath;
    
    // Definir pasta de destino com base no tipo de upload
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(__dirname, '../uploads/profiles');
    } else if (file.fieldname === 'photo' || file.fieldname === 'additionalPhotos') {
      uploadPath = path.join(__dirname, '../uploads/cats');
    } else if (file.fieldname === 'photos') {
      uploadPath = path.join(__dirname, '../uploads/checkins');
    } else {
      uploadPath = path.join(__dirname, '../uploads/others');
    }
    
    // Criar diretório se não existir
    ensureUploadDirectory(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = crypto.randomBytes(10).toString('hex');
    cb(null, uniqueSuffix + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Filtro de arquivo (apenas imagens)
const fileFilter = (req, file, cb) => {
  // Permitir apenas imagens
  const allowedMimes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas JPEG, PNG e GIF são permitidos.'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;