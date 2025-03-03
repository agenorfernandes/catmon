import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Calendar, Info, User, Clock, Check } from 'react-feather';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import CatMap from '../components/Map/CatMap';
import '../styles/catProfile.css';

const CatProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [cat, setCat] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
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
    if (isAuthenticated && cat) {
      const checkFavorite = async () => {
        try {
          const response = await axios.get('/api/users/favorites');
          const isFav = response.data.some(favCat => favCat._id === cat._id);
          setIsFavorite(isFav);
        } catch (error) {
          console.error('Erro ao verificar favoritos:', error);
        }
      };
      
      checkFavorite();
    }
  }, [isAuthenticated, cat]);
  
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar aos favoritos');
      return;
    }
    
    try {
      if (isFavorite) {
        await axios.delete(`/api/users/favorites/${cat._id}`);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await axios.post('/api/users/favorites', { catId: cat._id });
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast.error('Erro ao gerenciar favorito');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!cat) {
    return null;
  }
  
  return (
    <div className="cat-profile-page">
      <div className="cat-header">
        <h1 className="cat-name">{cat.name}</h1>
        
        <div className="health-status-badge">
          <span className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
            {cat.health}
          </span>
        </div>
        
        <div className="cat-info">
          <div className="info-item">
            <MapPin className="icon" />
            <span>{cat.location.address}</span>
          </div>
          
          <div className="info-item">
            <User className="icon" />
            <span>Registrado por {cat.discoveredBy.name}</span>
          </div>
          
          <div className="info-item">
            <Calendar className="icon" />
            <span>Registrado em {new Date(cat.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="info-item">
            <Clock className="icon" />
            <span>Último check-in: {new Date(cat.lastCheckIn).toLocaleDateString()}</span>
          </div>
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
            Fazer Check-in
          </Link>
        </div>
      </div>
      
      <section>
        <h2 className="section-title">Sobre {cat.name}</h2>
        <p className="cat-description">{cat.description}</p>
      </section>
      
      <section>
        <h2 className="section-title">Detalhes</h2>
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
      </section>
      
      <section className="cat-map-section">
        <h2 className="section-title">Localização</h2>
        <CatMap cat={cat} />
      </section>
      
      <section className="checkins-section">
        <div className="section-header">
          <h2 className="section-title">Check-ins Recentes</h2>
          <Link to={`/cat/${cat._id}/checkins`} className="view-all-link">
            Ver todos
          </Link>
        </div>
        
        {recentCheckIns.length > 0 ? (
          <div className="checkins-list">
            {recentCheckIns.map(checkIn => (
              <div key={checkIn._id} className="checkin-item">
                {/* Conteúdo do check-in */}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-checkins">
            <Info className="icon" />
            <p>Nenhum check-in recente.</p>
            <Link to={`/checkin/${cat._id}`} className="action-btn checkin-btn">
              Fazer Check-in
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default CatProfile;