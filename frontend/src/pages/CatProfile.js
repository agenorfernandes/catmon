import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Calendar, Info, User, Clock, AlertTriangle, Edit, Trash, Check } from 'react-feather';
import axios from 'axios';
import { toast } from 'react-toastify';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import CheckInItem from '../components/CheckIn/CheckInItem';
import CatMap from '../components/Map/CatMap';

const CatProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [cat, setCat] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchCat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/cats/${id}`);
        setCat(response.data.cat);
        setRecentCheckIns(response.data.recentCheckIns);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do gato:', error);
        setLoading(false);
        navigate('/404');
      }
    };
    
    fetchCat();
  }, [id, navigate]);
  
  useEffect(() => {
    // Verificar se o gato está nos favoritos do usuário
    const checkFavorite = async () => {
      if (isAuthenticated && cat) {
        try {
          const response = await axios.get('/api/users/favorites', {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          
          const isFav = response.data.some(favCat => favCat._id === cat._id);
          setIsFavorite(isFav);
        } catch (error) {
          console.error('Erro ao verificar favoritos:', error);
        }
      }
    };
    
    checkFavorite();
  }, [isAuthenticated, cat]);
  
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar aos favoritos');
      return;
    }
    
    try {
      if (isFavorite) {
        // Remover dos favoritos
        await axios.delete(`/api/users/favorites/${cat._id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        // Adicionar aos favoritos
        await axios.post('/api/users/favorites', 
          { catId: cat._id },
          {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          }
        );
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast.error('Erro ao gerenciar favorito');
    }
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cats/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      toast.success('Gato removido com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir gato:', error);
      toast.error('Erro ao excluir gato');
      setShowDeleteModal(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!cat) {
    return null;
  }
  
  // Verificar se o usuário logado é o descobridor deste gato
  const isDiscoverer = isAuthenticated && user?._id === cat.discoveredBy._id;
  
  return (
    <div className="cat-profile-page">
      <div className="cat-header">
        <div className="cat-images">
          <img src={cat.photoUrl} alt={cat.name} className="main-image" />
          
          {cat.additionalPhotos?.length > 0 && (
            <div className="additional-images">
              {cat.additionalPhotos.map((photo, index) => (
                <img key={index} src={photo} alt={`${cat.name} - foto ${index + 2}`} />
              ))}
            </div>
          )}
        </div>
        
        <div className="cat-actions">
          <button 
            className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <Heart fill={isFavorite ? '#ff6b6b' : 'none'} stroke={isFavorite ? '#ff6b6b' : 'currentColor'} />
            {isFavorite ? 'Favoritado' : 'Favoritar'}
          </button>
          
          <Link to={`/checkin/${cat._id}`} className="action-btn checkin-btn">
            <Check />
            Check-in
          </Link>
          
          {isDiscoverer && (
            <>
              <Link to={`/edit-cat/${cat._id}`} className="action-btn edit-btn">
                <Edit />
                Editar
              </Link>
              
              <button 
                className="action-btn delete-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="cat-info-section">
        <div className="cat-main-info">
          <h1>{cat.name}</h1>
          
          <div className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
            {cat.health}
          </div>
          
          <div className="cat-location">
            <MapPin className="icon" />
            <span>{cat.location.address}</span>
          </div>
          
          <div className="cat-discovered">
            <User className="icon" />
            <span>Registrado por {cat.discoveredBy.name}</span>
          </div>
          
          <div className="cat-date">
            <Calendar className="icon" />
            <span>Registrado em {new Date(cat.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="cat-checkins">
            <Clock className="icon" />
            <span>Último check-in: {new Date(cat.lastCheckIn).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="cat-description">
          <h2>Sobre {cat.name}</h2>
          <p>{cat.description}</p>
        </div>
        
        <div className="cat-details">
          <div className="detail-item">
            <h3>Cor</h3>
            <p>{cat.color}</p>
          </div>
          
          <div className="detail-item">
            <h3>Idade Estimada</h3>
            <p>{cat.estimatedAge}</p>
          </div>
          
          <div className="detail-item">
            <h3>Gênero</h3>
            <p>{cat.gender}</p>
          </div>
          
          <div className="detail-item">
            <h3>Castrado</h3>
            <p>{cat.isSterilized ? 'Sim' : 'Não/Desconhecido'}</p>
          </div>
          
          <div className="detail-item">
            <h3>Vacinado</h3>
            <p>{cat.isVaccinated ? 'Sim' : 'Não/Desconhecido'}</p>
          </div>
        </div>
        
        {cat.personalityTraits?.length > 0 && (
          <div className="cat-personality">
            <h3>Personalidade</h3>
            <div className="trait-tags">
              {cat.personalityTraits.map((trait, index) => (
                <span key={index} className="trait-tag">{trait}</span>
              ))}
            </div>
          </div>
        )}
        
        {cat.needs?.length > 0 && (
          <div className="cat-needs">
            <h3>Necessidades</h3>
            <div className="needs-container">
              <div className="need-tags">
                {cat.needs.map((need, index) => (
                  <span key={index} className="need-tag">
                    <AlertTriangle className="need-icon" />
                    {need}
                  </span>
                ))}
              </div>
              
              {cat.needsDescription && (
                <p className="needs-description">{cat.needsDescription}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="cat-map-section">
        <h2>Localização</h2>
        <CatMap cat={cat} />
      </div>
      
      <div className="cat-checkins-section">
        <div className="section-header">
          <h2>Check-ins Recentes</h2>
          <Link to={`/cat/${cat._id}/checkins`} className="view-all-link">
            Ver todos
          </Link>
        </div>
        
        {recentCheckIns.length > 0 ? (
          <div className="checkins-list">
            {recentCheckIns.map(checkIn => (
              <CheckInItem key={checkIn._id} checkIn={checkIn} />
            ))}
          </div>
        ) : (
          <div className="empty-checkins">
            <Info className="icon" />
            <p>Nenhum check-in recente.</p>
            <Link to={`/checkin/${cat._id}`} className="btn btn-primary">
              Fazer Check-in
            </Link>
          </div>
        )}
      </div>
      
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar exclusão</h2>
            <p>Tem certeza que deseja excluir {cat.name}? Esta ação não pode ser desfeita.</p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatProfile;