import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Camera, 
  MapPin, 
  AlertCircle, 
  Check, 
  ArrowLeft 
} from 'react-feather';

// Contextos
import { LocationContext } from '../contexts/LocationContext';
import { AuthContext } from '../contexts/AuthContext';

const AddCat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userLocation } = useContext(LocationContext);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photoUrl: null,
    additionalPhotos: [],
    health: 'Regular',
    color: '',
    estimatedAge: 'Desconhecido',
    gender: 'Desconhecido',
    isSterilized: false,
    isVaccinated: false,
    personalityTraits: [],
    needs: [],
    needsDescription: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const personalityTraits = [
    'Carinhoso', 'Tímido', 'Brincalhão', 'Independente', 
    'Curioso', 'Calmo', 'Agitado', 'Sociável'
  ];

  const needOptions = [
    'Água', 'Comida', 'Abrigo', 'Tratamento médico', 'Outros'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' 
        ? checked 
        : value
    }));

    // Limpar erros
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'photoUrl') {
      setFormData(prevState => ({ 
        ...prevState, 
        photoUrl: files[0] 
      }));
    } else if (name === 'additionalPhotos') {
      // Limitar para 5 fotos adicionais
      const selectedPhotos = Array.from(files).slice(0, 5);
      setFormData(prevState => ({ 
        ...prevState, 
        additionalPhotos: selectedPhotos 
      }));
    }
  };

  const togglePersonalityTrait = (trait) => {
    setFormData(prevState => {
      const traits = prevState.personalityTraits.includes(trait)
        ? prevState.personalityTraits.filter(t => t !== trait)
        : [...prevState.personalityTraits, trait];
      
      return { ...prevState, personalityTraits: traits };
    });
  };

  const toggleNeed = (need) => {
    setFormData(prevState => {
      const needs = prevState.needs.includes(need)
        ? prevState.needs.filter(n => n !== need)
        : [...prevState.needs, need];
      
      return { ...prevState, needs };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.color) {
      newErrors.color = 'Cor é obrigatória';
    }

    if (!formData.photoUrl) {
      newErrors.photoUrl = 'Foto principal é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!userLocation) {
      toast.error('Localização não disponível');
      return;
    }

    setLoading(true);

    const catData = new FormData();

    // Adicionar campos ao FormData
    Object.keys(formData).forEach(key => {
      if (key === 'photoUrl' && formData.photoUrl) {
        catData.append('photo', formData.photoUrl);
      } else if (key === 'additionalPhotos' && formData.additionalPhotos.length > 0) {
        formData.additionalPhotos.forEach(photo => {
          catData.append('additionalPhotos', photo);
        });
      } else if (Array.isArray(formData[key])) {
        formData[key].forEach(item => {
          catData.append(key, item);
        });
      } else if (formData[key] !== null && formData[key] !== undefined) {
        catData.append(key, formData[key]);
      }
    });

    // Adicionar localização
    const location = {
      type: 'Point',
      coordinates: [userLocation.longitude, userLocation.latitude],
      address: 'Localização atual'
    };
    catData.append('location', JSON.stringify(location));

    try {
      const response = await axios.post('/api/cats', catData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Gato adicionado com sucesso!');
      navigate(`/cat/${response.data._id}`);
    } catch (error) {
      console.error('Erro ao adicionar gato:', error);
      toast.error(error.response?.data?.msg || 'Erro ao adicionar gato');
      setLoading(false);
    }
  };

  return (
    <div className="add-cat-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </button>
        <h1>Adicionar Novo Gato</h1>
      </div>

      <form onSubmit={handleSubmit} className="add-cat-form">
        {/* Seção de Fotos */}
        <section className="form-section photo-section">
          <h2>Fotos do Gato</h2>
          
          <div className="photo-upload">
            <div className="main-photo">
              <label htmlFor="photoUrl" className="photo-upload-label">
                <Camera />
                <span>Foto Principal</span>
                <input
                  type="file"
                  id="photoUrl"
                  name="photoUrl"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {formData.photoUrl && (
                  <img 
                    src={URL.createObjectURL(formData.photoUrl)} 
                    alt="Preview" 
                    className="photo-preview"
                  />
                )}
              </label>
              {errors.photoUrl && (
                <div className="error-message">
                  <AlertCircle />
                  {errors.photoUrl}
                </div>
              )}
            </div>

            <div className="additional-photos">
              <label htmlFor="additionalPhotos" className="photo-upload-label">
                <Camera />
                <span>Fotos Adicionais (máx. 5)</span>
                <input
                  type="file"
                  id="additionalPhotos"
                  name="additionalPhotos"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />
                {formData.additionalPhotos.length > 0 && (
                  <div className="additional-photos-preview">
                    {formData.additionalPhotos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={URL.createObjectURL(photo)} 
                        alt={`Foto adicional ${index + 1}`} 
                      />
                    ))}
                  </div>
                )}
              </label>
            </div>
          </div>
        </section>

        {/* Seção de Informações Básicas */}
        <section className="form-section basic-info">
          <h2>Informações Básicas</h2>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do gato"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <div className="error-message">
                  <AlertCircle />
                  {errors.name}
                </div>
              )}
            </div>
            
            <div className="form-field">
              <label htmlFor="color">Cor</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Cor do gato"
                className={errors.color ? 'error' : ''}
              />
              {errors.color && (
                <div className="error-message">
                  <AlertCircle />
                  {errors.color}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="estimatedAge">Idade Estimada</label>
              <select
                id="estimatedAge"
                name="estimatedAge"
                value={formData.estimatedAge}
                onChange={handleChange}
              >
                <option value="Desconhecido">Desconhecido</option>
                <option value="Filhote">Filhote</option>
                <option value="Jovem">Jovem</option>
                <option value="Adulto">Adulto</option>
                <option value="Idoso">Idoso</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gênero</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Desconhecido">Desconhecido</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição do gato"
              className={errors.description ? 'error' : ''}
              rows="4"
            ></textarea>
            {errors.description && (
              <div className="error-message">
                <AlertCircle />
                {errors.description}
              </div>
            )}
          </div>
        </section>

        {/* Seção de Saúde */}
        <section className="form-section health-section">
          <h2>Saúde e Status</h2>
          
          <div className="form-field">
            <label htmlFor="health">Estado de Saúde</label>
            <select
              id="health"
              name="health"
              value={formData.health}
              onChange={handleChange}
            >
              <option value="Regular">Regular</option>
              <option value="Excelente">Excelente</option>
              <option value="Bom">Bom</option>
              <option value="Precisa de atenção">Precisa de atenção</option>
              <option value="Emergência">Emergência</option>
            </select>
          </div>

          <div className="toggle-group">
            <label>
              <input
                type="checkbox"
                name="isSterilized"
                checked={formData.isSterilized}
                onChange={handleChange}
              />
              Castrado
            </label>

            <label>
              <input
                type="checkbox"
                name="isVaccinated"
                checked={formData.isVaccinated}
                onChange={handleChange}
              />
              Vacinado
            </label>
          </div>
        </section>

        {/* Seção de Personalidade */}
        <section className="form-section personality-section">
          <h2>Personalidade</h2>
          <div className="trait-options">
            {personalityTraits.map(trait => (
              <label key={trait} className="trait-option">
                <input
                  type="checkbox"
                  checked={formData.personalityTraits.includes(trait)}
                  onChange={() => togglePersonalityTrait(trait)}
                />
                {trait}
              </label>
            ))}
          </div>
        </section>

        {/* Seção de Necessidades */}
        <section className="form-section needs-section">
          <h2>Necessidades</h2>
          <div className="need-options">
            {needOptions.map(need => (
              <label key={need} className="need-option">
                <input
                  type="checkbox"
                  checked={formData.needs.includes(need)}
                  onChange={() => toggleNeed(need)}
                />
                {need}
              </label>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="needsDescription">Descrição das Necessidades</label>
            <textarea
              id="needsDescription"
              name="needsDescription"
              value={formData.needsDescription}
              onChange={handleChange}
              placeholder="Detalhes adicionais sobre as necessidades do gato"
              rows="3"
            ></textarea>
          </div>
        </section>

        {/* Seção de Localização */}
        <section className="form-section location-section">
          <h2>Localização</h2>
          {userLocation ? (
            <div className="location-info">
              <MapPin />
              <p>Localização atual será registrada</p>
              <p>
                Lat: {userLocation.latitude}, 
                Lng: {userLocation.longitude}
              </p>
            </div>
          ) : (
            <div className="location-warning">
              <AlertCircle />
              <p>Localização não disponível. Verifique suas configurações.</p>
            </div>
          )}
        </section>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !userLocation}
        >
          <Check />
          {loading ? 'Adicionando...' : 'Adicionar Gato'}
        </button>
      </form>
    </div>
  );
};

export default AddCat;