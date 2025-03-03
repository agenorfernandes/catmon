const Cat = require('../models/Cat');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const geocoder = require('../utils/geocoder');

// Obter todos os gatos (com filtros e paginação)
exports.getAllCats = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      status,
      health,
      gender,
      estimatedAge,
      lat,
      lng,
      radius = 5000 // em metros (padrão: 5km)
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Construir o filtro
    const filter = {};
    if (status) filter.status = status.split(',');
    if (health) filter.health = health.split(',');
    if (gender) filter.gender = gender.split(',');
    if (estimatedAge) filter.estimatedAge = estimatedAge.split(',');

    // Filtro de localização, se fornecido
    if (lat && lng) {
      filter.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Executar consulta
    const cats = await Cat.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('discoveredBy', 'name profilePicture');

    // Contar total para paginação
    const total = await Cat.countDocuments(filter);

    res.json({
      cats,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCats: total
    });
  } catch (err) {
    console.error('Erro em getAllCats:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Obter gato por ID
exports.getCatById = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id)
      .populate('discoveredBy', 'name profilePicture');
    
    if (!cat) {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    // Obter últimos 5 check-ins para este gato
    const recentCheckIns = await CheckIn.find({ cat: cat._id })
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name profilePicture');
    
    res.json({
      cat,
      recentCheckIns
    });
  } catch (err) {
    console.error('Erro em getCatById:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Criar novo gato
exports.createCat = async (req, res) => {
  try {
    console.log('Iniciando criação de novo gato');
    console.log('Body recebido:', req.body);
    console.log('Arquivos recebidos:', req.files);

    const {
      name,
      description,
      health,
      color,
      estimatedAge,
      gender,
      isSterilized,
      isVaccinated,
      personalityTraits,
      needsDescription
    } = req.body;

    // Verificar campos obrigatórios
    if (!name || !description) {
      return res.status(400).json({ 
        msg: 'Campos obrigatórios não informados',
        details: {
          name: name ? 'OK' : 'Não informado',
          description: description ? 'OK' : 'Não informado',
          location: req.body.location ? 'OK' : 'Não informado',
          files: req.files ? Object.keys(req.files) : 'Nenhum arquivo'
        }
      });
    }

    // Processar location
    let locationData;
    try {
      if (typeof req.body.location === 'string') {
        locationData = JSON.parse(req.body.location);
      } else {
        locationData = req.body.location;
      }

      // Validar se a localização é válida
      if (!locationData || !locationData.coordinates || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
        return res.status(400).json({ msg: 'Formato de localização inválido ou não fornecido' });
      }
    } catch (err) {
      console.error('Erro ao processar localização:', err);
      return res.status(400).json({ msg: 'Formato de localização inválido' });
    }

    // Processar arquivos de imagem
    let photoUrl = '';
    let additionalPhotos = [];

    // Verificar se há arquivos enviados
    if (req.files) {
      if (req.files.photo) {
        photoUrl = `/uploads/cats/${req.files.photo[0].filename}`;
      } else {
        return res.status(400).json({ msg: 'Foto principal é obrigatória' });
      }
      
      if (req.files.additionalPhotos) {
        additionalPhotos = req.files.additionalPhotos.map(file => 
          `/uploads/cats/${file.filename}`
        );
      }
    } else {
      return res.status(400).json({ msg: 'Nenhum arquivo foi enviado' });
    }

    // Processar arrays de personalidade e necessidades
    let processedPersonalityTraits = [];
    if (personalityTraits) {
      // Verificar se é um array ou uma string
      if (Array.isArray(personalityTraits)) {
        processedPersonalityTraits = personalityTraits;
      } else if (typeof personalityTraits === 'string') {
        processedPersonalityTraits = [personalityTraits];
      }
    }

    let processedNeeds = [];
    if (req.body.needs) {
      // Verificar se é um array ou uma string
      if (Array.isArray(req.body.needs)) {
        processedNeeds = req.body.needs;
      } else if (typeof req.body.needs === 'string') {
        processedNeeds = [req.body.needs];
      }
    }

    // Converter valores de string para booleanos
    const convertedIsSterilized = isSterilized === 'true' || isSterilized === true;
    const convertedIsVaccinated = isVaccinated === 'true' || isVaccinated === true;

    // Criar novo gato
    const newCat = new Cat({
      name,
      description,
      photoUrl,
      additionalPhotos: additionalPhotos || [],
      health: health || 'Regular',
      color,
      estimatedAge: estimatedAge || 'Desconhecido',
      gender: gender || 'Desconhecido',
      isSterilized: convertedIsSterilized,
      isVaccinated: convertedIsVaccinated,
      personalityTraits: processedPersonalityTraits || [],
      location: locationData,
      discoveredBy: req.user.id,
      needs: processedNeeds ||const Cat = require('../models/Cat');
      const CheckIn = require('../models/CheckIn');
      const User = require('../models/User');
      const geocoder = require('../utils/geocoder');
      
      // Obter todos os gatos (com filtros e paginação)
      exports.getAllCats = async (req, res) => {
        try {
          const { 
            page = 1, 
            limit = 10, 
            sort = '-createdAt',
            status,
            health,
            gender,
            estimatedAge,
            lat,
            lng,
            radius = 5000 // em metros (padrão: 5km)
          } = req.query;
      
          const skip = (page - 1) * limit;
          
          // Construir o filtro
          const filter = {};
          if (status) filter.status = status.split(',');
          if (health) filter.health = health.split(',');
          if (gender) filter.gender = gender.split(',');
          if (estimatedAge) filter.estimatedAge = estimatedAge.split(',');
      
          // Filtro de localização, se fornecido
          if (lat && lng) {
            filter.location = {
              $nearSphere: {
                $geometry: {
                  type: 'Point',
                  coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: parseInt(radius)
              }
            };
          }
      
          // Executar consulta
          const cats = await Cat.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('discoveredBy', 'name profilePicture');
      
          // Contar total para paginação
          const total = await Cat.countDocuments(filter);
      
          res.json({
            cats,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCats: total
          });
        } catch (err) {
          console.error('Erro em getAllCats:', err.message);
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Obter gato por ID
      exports.getCatById = async (req, res) => {
        try {
          const cat = await Cat.findById(req.params.id)
            .populate('discoveredBy', 'name profilePicture');
          
          if (!cat) {
            return res.status(404).json({ msg: 'Gato não encontrado' });
          }
          
          // Obter últimos 5 check-ins para este gato
          const recentCheckIns = await CheckIn.find({ cat: cat._id })
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name profilePicture');
          
          res.json({
            cat,
            recentCheckIns
          });
        } catch (err) {
          console.error('Erro em getCatById:', err.message);
          
          if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Gato não encontrado' });
          }
          
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Criar novo gato
      exports.createCat = async (req, res) => {
        try {
          console.log('Iniciando criação de novo gato');
          console.log('Body recebido:', req.body);
          console.log('Arquivos recebidos:', req.files);
      
          const {
            name,
            description,
            health,
            color,
            estimatedAge,
            gender,
            isSterilized,
            isVaccinated,
            personalityTraits,
            needsDescription
          } = req.body;
      
          // Verificar campos obrigatórios
          if (!name || !description) {
            return res.status(400).json({ 
              msg: 'Campos obrigatórios não informados',
              details: {
                name: name ? 'OK' : 'Não informado',
                description: description ? 'OK' : 'Não informado',
                location: req.body.location ? 'OK' : 'Não informado',
                files: req.files ? Object.keys(req.files) : 'Nenhum arquivo'
              }
            });
          }
      
          // Processar location
          let locationData;
          try {
            if (typeof req.body.location === 'string') {
              locationData = JSON.parse(req.body.location);
            } else {
              locationData = req.body.location;
            }
      
            // Validar se a localização é válida
            if (!locationData || !locationData.coordinates || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
              return res.status(400).json({ msg: 'Formato de localização inválido ou não fornecido' });
            }
          } catch (err) {
            console.error('Erro ao processar localização:', err);
            return res.status(400).json({ msg: 'Formato de localização inválido' });
          }
      
          // Processar arquivos de imagem
          let photoUrl = '';
          let additionalPhotos = [];
      
          // Verificar se há arquivos enviados
          if (req.files) {
            if (req.files.photo) {
              photoUrl = `/uploads/cats/${req.files.photo[0].filename}`;
            } else {
              return res.status(400).json({ msg: 'Foto principal é obrigatória' });
            }
            
            if (req.files.additionalPhotos) {
              additionalPhotos = req.files.additionalPhotos.map(file => 
                `/uploads/cats/${file.filename}`
              );
            }
          } else {
            return res.status(400).json({ msg: 'Nenhum arquivo foi enviado' });
          }
      
          // Processar arrays de personalidade e necessidades
          let processedPersonalityTraits = [];
          if (personalityTraits) {
            // Verificar se é um array ou uma string
            if (Array.isArray(personalityTraits)) {
              processedPersonalityTraits = personalityTraits;
            } else if (typeof personalityTraits === 'string') {
              processedPersonalityTraits = [personalityTraits];
            }
          }
      
          let processedNeeds = [];
          if (req.body.needs) {
            // Verificar se é um array ou uma string
            if (Array.isArray(req.body.needs)) {
              processedNeeds = req.body.needs;
            } else if (typeof req.body.needs === 'string') {
              processedNeeds = [req.body.needs];
            }
          }
      
          // Converter valores de string para booleanos
          const convertedIsSterilized = isSterilized === 'true' || isSterilized === true;
          const convertedIsVaccinated = isVaccinated === 'true' || isVaccinated === true;
      
          // Criar novo gato
          const newCat = new Cat({
            name,
            description,
            photoUrl,
            additionalPhotos: additionalPhotos || [],
            health: health || 'Regular',
            color,
            estimatedAge: estimatedAge || 'Desconhecido',
            gender: gender || 'Desconhecido',
            isSterilized: convertedIsSterilized,
            isVaccinated: convertedIsVaccinated,
            personalityTraits: processedPersonalityTraits || [],
            location: locationData,
            discoveredBy: req.user.id,
            needs: processedNeeds || [],
            needsDescription
          });
      
          const cat = await newCat.save();
      
          // Incrementar pontos do usuário (50 pontos por registrar um novo gato)
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { points: 50, totalCatsHelped: 1 }
          });
          
          console.log('Gato criado com sucesso:', cat._id);
      
          res.status(201).json(cat);
        } catch (err) {
          console.error('Erro em createCat:', err.message);
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Atualizar gato
      exports.updateCat = async (req, res) => {
        try {
          console.log('Atualizando gato:', req.params.id);
          console.log('Body recebido:', req.body);
          console.log('Arquivos recebidos:', req.files);
      
          const {
            name,
            description,
            health,
            color,
            estimatedAge,
            gender,
            isSterilized,
            isVaccinated,
            personalityTraits,
            location,
            status,
            needs,
            needsDescription
          } = req.body;
      
          // Encontrar o gato a ser atualizado
          let cat = await Cat.findById(req.params.id);
      
          if (!cat) {
            return res.status(404).json({ msg: 'Gato não encontrado' });
          }
      
          // Verificar se o usuário é o descobridor (ou admin)
          const isAdmin = req.user.role === 'admin';
          if (cat.discoveredBy.toString() !== req.user.id && !isAdmin) {
            return res.status(403).json({ msg: 'Acesso negado. Você não pode editar este gato' });
          }
      
          // Processar arquivos de imagem
          let photoUrl = cat.photoUrl;
          let additionalPhotos = cat.additionalPhotos;
      
          // Verificar se há arquivos enviados
          if (req.files) {
            if (req.files.photo) {
              photoUrl = `/uploads/cats/${req.files.photo[0].filename}`;
            }
            
            if (req.files.additionalPhotos) {
              // Permitir adicionar mais fotos ou substituir todas
              if (req.body.replacePhotos === 'true') {
                additionalPhotos = req.files.additionalPhotos.map(file => 
                  `/uploads/cats/${file.filename}`
                );
              } else {
                const newPhotos = req.files.additionalPhotos.map(file => 
                  `/uploads/cats/${file.filename}`
                );
                additionalPhotos = [...additionalPhotos, ...newPhotos];
              }
            }
          }
      
          // Processar localização
          let locationData = cat.location;
          if (location) {
            try {
              if (typeof location === 'string') {
                locationData = JSON.parse(location);
              } else {
                locationData = location;
              }
            } catch (err) {
              console.error('Erro ao processar localização:', err);
              return res.status(400).json({ msg: 'Formato de localização inválido' });
            }
          }
      
          // Processar arrays
          let processedPersonalityTraits = cat.personalityTraits;
          if (personalityTraits) {
            if (Array.isArray(personalityTraits)) {
              processedPersonalityTraits = personalityTraits;
            } else if (typeof personalityTraits === 'string') {
              processedPersonalityTraits = [personalityTraits];
            }
          }
      
          let processedNeeds = cat.needs;
          if (needs) {
            if (Array.isArray(needs)) {
              processedNeeds = needs;
            } else if (typeof needs === 'string') {
              processedNeeds = [needs];
            }
          }
      
          // Converter valores de string para booleanos
          const convertedIsSterilized = isSterilized === undefined 
            ? cat.isSterilized 
            : (isSterilized === 'true' || isSterilized === true);
            
          const convertedIsVaccinated = isVaccinated === undefined 
            ? cat.isVaccinated 
            : (isVaccinated === 'true' || isVaccinated === true);
      
          // Construir objeto de atualização
          const updateFields = {
            name: name || cat.name,
            description: description || cat.description,
            photoUrl,
            additionalPhotos,
            health: health || cat.health,
            color: color || cat.color,
            estimatedAge: estimatedAge || cat.estimatedAge,
            gender: gender || cat.gender,
            isSterilized: convertedIsSterilized,
            isVaccinated: convertedIsVaccinated,
            personalityTraits: processedPersonalityTraits,
            location: locationData,
            status: status || cat.status,
            needs: processedNeeds,
            needsDescription: needsDescription !== undefined ? needsDescription : cat.needsDescription,
            updatedAt: Date.now()
          };
      
          // Atualizar gato
          cat = await Cat.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
          );
      
          res.json(cat);
        } catch (err) {
          console.error('Erro em updateCat:', err.message);
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Excluir gato
      exports.deleteCat = async (req, res) => {
        try {
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
          
          // Excluir gato (usando deleteOne em vez de remove)
          await Cat.deleteOne({ _id: cat._id });
          
          res.json({ msg: 'Gato removido com sucesso' });
        } catch (err) {
          console.error('Erro em deleteCat:', err.message);
          
          if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Gato não encontrado' });
          }
          
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Obter gatos próximos
      exports.getNearbyCats = async (req, res) => {
        try {
          const { lat, lng, radius = 5000, limit = 20 } = req.query; // raio em metros
          
          if (!lat || !lng) {
            return res.status(400).json({ msg: 'Latitude e longitude são necessárias' });
          }
          
          const cats = await Cat.find({
            location: {
              $nearSphere: {
                $geometry: {
                  type: 'Point',
                  coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: parseInt(radius)
              }
            },
            status: { $in: ['Ativo', 'Em tratamento'] } // Incluir gatos em tratamento também
          })
          .limit(parseInt(limit))
          .populate('discoveredBy', 'name profilePicture');
          
          res.json(cats);
        } catch (err) {
          console.error('Erro em getNearbyCats:', err.message);
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };
      
      // Remover foto adicional
      exports.removePhoto = async (req, res) => {
        try {
          const { photoIndex } = req.params;
          
          // Encontrar o gato
          const cat = await Cat.findById(req.params.id);
          
          if (!cat) {
            return res.status(404).json({ msg: 'Gato não encontrado' });
          }
          
          // Verificar se o usuário é o descobridor ou admin
          const isAdmin = req.user.role === 'admin';
          if (cat.discoveredBy.toString() !== req.user.id && !isAdmin) {
            return res.status(403).json({ msg: 'Acesso negado' });
          }
          
          // Verificar se o índice da foto é válido
          if (photoIndex < 0 || photoIndex >= cat.additionalPhotos.length) {
            return res.status(400).json({ msg: 'Índice de foto inválido' });
          }
          
          // Remover a foto do array
          cat.additionalPhotos.splice(photoIndex, 1);
          await cat.save();
          
          res.json(cat);
        } catch (err) {
          console.error('Erro em removePhoto:', err.message);
          res.status(500).json({ msg: 'Erro no servidor', error: err.message });
        }
      };