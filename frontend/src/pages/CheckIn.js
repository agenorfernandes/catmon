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
      {/* Resto do componente permanece o mesmo */}
    </div>
  );
};

export default CheckIn;