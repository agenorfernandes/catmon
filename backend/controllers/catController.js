const Cat = require('../models/Cat');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');

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
    if (status) filter.status = status;
    if (health) filter.health = health;
    if (gender) filter.gender = gender;
    if (estimatedAge) filter.estimatedAge = estimatedAge;

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
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
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
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Criar novo gato
exports.createCat = async (req, res) => {
  try {
    const {
      name,
      description,
      photoUrl,
      additionalPhotos,
      health,
      color,
      estimatedAge,
      gender,
      isSterilized,
      isVaccinated,
      personalityTraits,
      location,
      needs,
      needsDescription
    } = req.body;

    // Criar novo gato
    const newCat = new Cat({
      name,
      description,
      photoUrl,
      additionalPhotos: additionalPhotos || [],
      health,
      color,
      estimatedAge,
      gender,
      isSterilized,
      isVaccinated,
      personalityTraits: personalityTraits || [],
      location,
      discoveredBy: req.user.id,
      needs: needs || [],
      needsDescription
    });

    const cat = await newCat.save();

    // Incrementar pontos do usuário (50 pontos por registrar um novo gato)
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: 50, totalCatsHelped: 1 }
    });

    res.status(201).json(cat);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Atualizar gato
exports.updateCat = async (req, res) => {
  try {
    const {
      name,
      description,
      photoUrl,
      additionalPhotos,
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

    // Construir objeto de atualização
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (photoUrl) updateFields.photoUrl = photoUrl;
    if (additionalPhotos) updateFields.additionalPhotos = additionalPhotos;
    if (health) updateFields.health = health;
    if (color) updateFields.color = color;
    if (estimatedAge) updateFields.estimatedAge = estimatedAge;
    if (gender) updateFields.gender = gender;
    if (isSterilized !== undefined) updateFields.isSterilized = isSterilized;
    if (isVaccinated !== undefined) updateFields.isVaccinated = isVaccinated;
    if (personalityTraits) updateFields.personalityTraits = personalityTraits;
    if (location) updateFields.location = location;
    if (status) updateFields.status = status;
    if (needs) updateFields.needs = needs;
    if (needsDescription) updateFields.needsDescription = needsDescription;
    
    // Atualizar data de modificação
    updateFields.updatedAt = Date.now();

    // Atualizar gato
    cat = await Cat.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(cat);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
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
    
    // Excluir gato
    await cat.remove();
    
    res.json({ msg: 'Gato removido' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gato não encontrado' });
    }
    
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};

// Obter gatos próximos
exports.getNearbyCats = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // raio em metros
    
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
      status: 'Ativo' // Apenas gatos ativos
    }).populate('discoveredBy', 'name profilePicture');
    
    res.json(cats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
};