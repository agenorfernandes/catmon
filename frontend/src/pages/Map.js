import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, List, Layers, Plus, Menu } from 'react-feather';
import axios from 'axios';
import '../styles/Map.css';

// Contextos
import { AuthContext } from '../contexts/AuthContext';
import { LocationContext } from '../contexts/LocationContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import CatPopup from '../components/Map/CatPopup';

// Corrige o problema dos ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componente para recentralizar o mapa
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const MapPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { userLocation, loading: locationLoading, error: locationError } = useContext(LocationContext);
  
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    health: [],
    status: ['Ativo'],
    gender: [],
    estimatedAge: []
  });
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir parâmetros de consulta com base nos filtros
        const params = {};
        
        // Adicionar filtros selecionados
        Object.keys(filters).forEach(key => {
          if (filters[key].length > 0) {
            params[key] = filters[key].join(',');
          }
        });
        
        // Adicionar localização do usuário, se disponível
        if (userLocation) {
          params.lat = userLocation.latitude;
          params.lng = userLocation.longitude;
          params.radius = 10000; // 10km
        }
        
        console.log('Buscando gatos com parâmetros:', params);
        const response = await axios.get('/api/cats', { params });
        
        // Verificar a estrutura da resposta
        console.log('Resposta da API:', response.data);
        
        // Verificar se temos cats na resposta
        if (response.data.cats && Array.isArray(response.data.cats)) {
          setCats(response.data.cats);
        } else if (Array.isArray(response.data)) {
          setCats(response.data);
        } else {
          console.error('Formato inesperado de resposta:', response.data);
          setError('Formato de resposta inesperado');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar gatos:', error);
        setError(error.message || 'Erro ao carregar gatos');
        setLoading(false);
      }
    };
    
    if (userLocation) {
      fetchCats();
    }
    
    // Configurar intervalo para atualizar a cada 5 minutos
    const interval = setInterval(() => {
      if (userLocation) {
        fetchCats();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [filters, userLocation]);
  
  const toggleFilter = (type, value) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      if (updatedFilters[type].includes(value)) {
        // Remover filtro
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      } else {
        // Adicionar filtro
        updatedFilters[type] = [...updatedFilters[type], value];
      }
      
      return updatedFilters;
    });
  };
  
  const handleMarkerClick = (cat) => {
    console.log('Gato clicado:', cat);
    setSelectedCat(cat);
  };
  
  if (locationLoading) {
    return <LoadingSpinner />;
  }
  
  if (!mapCenter) {
    return (
      <div className="location-error">
        <h2>Localização não disponível</h2>
        <p>Precisamos da sua localização para mostrar os gatos próximos a você.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="map-page">
      <div className="map-controls">
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Layers /> Filtros
        </button>
        
        <button 
          className="list-toggle"
          onClick={() => setShowList(!showList)}
        >
          <List /> Lista
        </button>
      </div>
      
      {showFilters && (
        <div className="map-filters">
          <div className="filter-section">
            <h3>Estado de Saúde</h3>
            <div className="filter-options">
              {['Excelente', 'Bom', 'Regular', 'Precisa de atenção', 'Emergência'].map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.health.includes(option)}
                    onChange={() => toggleFilter('health', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Status</h3>
            <div className="filter-options">
              {['Ativo', 'Adotado', 'Em tratamento', 'Desaparecido'].map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option)}
                    onChange={() => toggleFilter('status', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Gênero</h3>
            <div className="filter-options">
              {['Macho', 'Fêmea', 'Desconhecido'].map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.gender.includes(option)}
                    onChange={() => toggleFilter('gender', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Idade</h3>
            <div className="filter-options">
              {['Filhote', 'Jovem', 'Adulto', 'Idoso', 'Desconhecido'].map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.estimatedAge.includes(option)}
                    onChange={() => toggleFilter('estimatedAge', option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <RecenterMap position={mapCenter} />
          
          {/* Marcador da localização do usuário */}
          <Marker position={mapCenter}>
            <Popup>Você está aqui</Popup>
          </Marker>
          
          {/* Marcadores dos gatos */}
          {cats.length > 0 && cats.map(cat => {
            if (cat.location && cat.location.coordinates && cat.location.coordinates.length === 2) {
              // MongoDB armazena como [longitude, latitude], Leaflet espera [latitude, longitude]
              const position = [cat.location.coordinates[1], cat.location.coordinates[0]];
              
              return (
                <Marker 
                  key={cat._id} 
                  position={position}
                  eventHandlers={{
                    click: () => handleMarkerClick(cat)
                  }}
                >
                  <Popup>
                    <CatPopup cat={cat} />
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {loading && !locationLoading && (
          <div className="loading-overlay">
            <LoadingSpinner />
          </div>
        )}
      </div>
      
      {showList && (
        <div className="map-cat-list">
          {cats.length > 0 ? (
            cats.map(cat => (
              <Link 
                key={cat._id} 
                to={`/cat/${cat._id}`} 
                className="cat-list-item"
              >
                <img src={cat.photoUrl} alt={cat.name} />
                <div className="cat-list-details">
                  <h3>{cat.name}</h3>
                  <p>{cat.location.address}</p>
                  <span className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
                    {cat.health}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-cats-message">Nenhum gato encontrado</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapPage;