import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Camera, AlertTriangle, Check, ArrowLeft } from 'react-feather';
import axios from 'axios';
import { toast } from 'react-toastify';

// Contextos
import { AuthContext } from '../contexts/AuthContext';
import { LocationContext } from '../contexts/LocationContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const CheckIn = () => {
  const { catId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { userLocation } = useContext(LocationContext);
  
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    actions: [],
    actionsDescription: '',
    healthStatus: '',
    photos: [],
    needs: [],
    needsDescription: ''
  });
  
  const actionOptions = [
    'Alimentou',
    'Deu água',
    'Forneceu abrigo',
    'Verificou bem-estar',
    'Levou ao veterinário',
    'Vacinou',
    'Castrou',
    'Outros'
  ];
  
  const healthOptions = [
    'Excelente',
    'Bom',
    'Regular',
    'Precisa de atenção',
    'Emergência'
  ];
  
  const needOptions = [
    'Água',
    'Comida',
    'Abrigo',
    'Tratamento médico',
    'Outros'
  ];
  
  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para fazer check-in');
      navigate('/login', { state: { from: `/checkin/${catId}` } });
      return;
    }
    
    const fetchCat = async () => {
      if (!catId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/api/cats/${catId}`);
        setCat(response.data.cat);
        
        // Pré-preencher status de saúde com o status atual
        setFormData(prevState => ({
          ...prevState,
          healthStatus: response.data.cat.health,
          needs: response.data.cat.needs || []
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do gato:', error);
        toast.error('Erro ao carregar dados do gato');
        navigate('/');
        setLoading(false);
      }
    };
    
    fetchCat();
  }, [catId, isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleActionToggle = (action) => {
    setFormData(prevState => {
      const currentActions = [...prevState.actions];
      
      if (currentActions.includes(action)) {
        // Remover ação
        return {
          ...prevState,
          actions: currentActions.filter(a => a !== action)
        };
      } else {
        // Adicionar ação
        return {
          ...prevState,
          actions: [...currentActions, action]
        };
      }
    });
  };
  
  const handleNeedToggle = (need) => {
    setFormData(prevState => {
      const currentNeeds = [...prevState.needs];
      
      if (currentNeeds.includes(need)) {
        // Remover necessidade
        return {
          ...prevState,
          needs: currentNeeds.filter(n => n !== need)
        };
      } else {
        // Adicionar necessidade
        return {
          ...prevState,
          needs: [...currentNeeds, need]
        };
      }
    });
  };
  
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar arquivos (apenas imagens, max 5)
    if (files.length > 5) {
      toast.warning('Máximo de 5 fotos permitidas');
      return;
    }
    
    setFormData({ ...formData, photos: files });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userLocation) {
      toast.error('Localização não disponível. Permita o acesso à sua localização.');
      return;
    }
    
    if (formData.actions.length === 0) {
      toast.error('Selecione pelo menos uma ação realizada');
      return;
    }
    
    if (!formData.healthStatus) {
      toast.error('Selecione o estado de saúde do gato');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Criar objeto FormData para envio de arquivos
      const checkInData = new FormData();
      checkInData.append('catId', catId);
      
      // Adicionar localização
      const location = {
        type: 'Point',
        coordinates: [userLocation.longitude, userLocation.latitude],
        address: 'Localização atual' // Idealmente, fazer geocodificação reversa aqui
      };
      checkInData.append('location', JSON.stringify(location));
      
      // Adicionar ações
      formData.actions.forEach(action => {
        checkInData.append('actions', action);
      });
      
      // Adicionar outros campos
      if (formData.actionsDescription) {
        checkInData.append('actionsDescription', formData.actionsDescription);
      }
      
      checkInData.append('healthStatus', formData.healthStatus);
      
      // Adicionar fotos
      if (formData.photos.length > 0) {
        formData.photos.forEach(photo => {
          checkInData.append('photos', photo);
        });
      }
      
      // Adicionar necessidades
      if (formData.needs.length > 0) {
        formData.needs.forEach(need => {
          checkInData.append('needs', need);
        });
      }
      
      if (formData.needsDescription) {
        checkInData.append('needsDescription', formData.needsDescription);
      }
      
      // Enviar check-in
      await axios.post('/api/checkins', checkInData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      toast.success('Check-in realizado com sucesso!');
      navigate(`/cat/${catId}`);
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      toast.error('Erro ao realizar check-in. Tente novamente.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="checkin-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </button>
        <h1>Check-in: {cat?.name}</h1>
      </div>
      
      <div className="cat-summary">
        <img src={cat?.photoUrl} alt={cat?.name} />
        <div className="cat-summary-info">
          <h2>{cat?.name}</h2>
          <p className={`health-status ${cat?.health.toLowerCase().replace(/\s+/g, '-')}`}>
            {cat?.health}
          </p>
          <p className="location">
            <MapPin className="icon" /> {cat?.location.address}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="checkin-form">
        <div className="form-section">
          <h3>O que você fez por {cat?.name}?</h3>
          <div className="action-options">
            {actionOptions.map(action => (
              <label key={action} className="action-option">
                <input
                  type="checkbox"
                  checked={formData.actions.includes(action)}
                  onChange={() => handleActionToggle(action)}
                />
                <span className="checkbox-custom"></span>
                {action}
              </label>
            ))}
          </div>
          
          <div className="form-field">
            <label htmlFor="actionsDescription">Detalhes adicionais:</label>
            <textarea
              id="actionsDescription"
              name="actionsDescription"
              value={formData.actionsDescription}
              onChange={handleChange}
              placeholder="Ex: Deixei ração e água fresca..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Como está a saúde de {cat?.name}?</h3>
          <div className="health-options">
            {healthOptions.map(health => (
              <label key={health} className={`health-option ${health.toLowerCase().replace(/\s+/g, '-')}`}>
                <input
                  type="radio"
                  name="healthStatus"
                  value={health}
                  checked={formData.healthStatus === health}
                  onChange={handleChange}
                />
                <span className="radio-custom"></span>
                {health}
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Do que {cat?.name} precisa?</h3>
          <div className="need-options">
            {needOptions.map(need => (
              <label key={need} className="need-option">
                <input
                  type="checkbox"
                  checked={formData.needs.includes(need)}
                  onChange={() => handleNeedToggle(need)}
                />
                <span className="checkbox-custom"></span>
                <AlertTriangle className="need-icon" />
                {need}
              </label>
            ))}
          </div>
          
          <div className="form-field">
            <label htmlFor="needsDescription">Detalhes das necessidades:</label>
            <textarea
              id="needsDescription"
              name="needsDescription"
              value={formData.needsDescription}
              onChange={handleChange}
              placeholder="Ex: Precisa urgente de tratamento para ferimento na pata..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Adicionar fotos (opcional)</h3>
          <div className="photo-upload">
            <label htmlFor="photos" className="upload-btn">
              <Camera className="icon" />
              <span>Selecionar fotos</span>
              <input
                type="file"
                id="photos"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
            
            <div className="selected-photos">
              {formData.photos.length > 0 ? (
                <p>{formData.photos.length} foto(s) selecionada(s)</p>
              ) : (
                <p>Nenhuma foto selecionada</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-section location-section">
          <h3>Localização</h3>
          {userLocation ? (
            <div className="location-info">
              <MapPin className="icon" />
              <p>Sua localização atual será registrada</p>
            </div>
          ) : (
            <div className="location-warning">
              <AlertTriangle className="icon" />
              <p>Localização não disponível. Permita o acesso à sua localização.</p>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={submitting || !userLocation}
        >
          <Check className="icon" />
          {submitting ? 'Enviando...' : 'Confirmar Check-in'}
        </button>
      </form>
    </div>