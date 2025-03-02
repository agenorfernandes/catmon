import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, List, Layers, Plus, Menu } from 'react-feather';
import axios from 'axios';

// Contextos
import { AuthContext } from '../contexts/AuthContext';
import { LocationContext } from '../contexts/LocationContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import CatPopup from '../components/Map/CatPopup';

// Corrigir o problema de ícones do Leaflet
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

const CatIcon = L.Icon.extend({
  options: {
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }
});

const healthIcons = {
  'Excelente': new CatIcon({ iconUrl: '/assets/icons/cat-excellent.png' }),
  'Bom': new CatIcon({ iconUrl: '/assets/icons/cat-good.png' }),
  'Regular': new CatIcon({ iconUrl: '/assets/icons/cat-regular.png' }),
  'Precisa de atenção': new CatIcon({ iconUrl: '/assets/icons/cat-attention.png' }),
  'Emergência': new CatIcon({ iconUrl: '/assets/icons/cat-emergency.png' })
};

const MapPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { userLocation, loading: locationLoading } = useContext(LocationContext);
  
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

  const mapRef = useRef(null);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        
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
        
        const response = await axios.get('/api/cats', { params });
        setCats(response.data.cats);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar gatos:', error);
        setLoading(false);
      }
    };
    
    fetchCats();
    
    // Configurar intervalo para atualizar a cada 5 minutos
    const interval = setInterval(fetchCats, 5 * 60 * 1000);
    
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
    setSelectedCat(cat);
  };
  
  if (locationLoading || (loading && !cats.length)) {
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
          className="map-control-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Layers />
        </button>
        <button 
          className="map-control-btn"
          onClick={() => setShowList(!showList)}
        >
          <List />
        </button>
        {isAuthenticated && (
          <Link to="/add-cat" className="map-control-btn add-cat-btn">
            <Plus />
          </Link>
        )}
      </div>
      
      {showFilters && (
        <div className="map-filters">
          <h3>Filtros</h3>
          
          <div className="filter-section">
            <h4>Estado de Saúde</h4>
            <div className="filter-options">
              {['Excelente', 'Bom', 'Regular', 'Precisa de atenção', 'Emergência'].map(health => (
                <label key={health} className="filter-option">
                  <input 
                    type="checkbox"
                    checked={filters.health.includes(health)}
                    onChange={() => toggleFilter('health', health)}
                  />
                  {health}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Status</h4>
            <div className="filter-options">
              {['Ativo', 'Adotado', 'Em tratamento', 'Desaparecido'].map(status => (
                <label key={status} className="filter-option">
                  <input 
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleFilter('status', status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Gênero</h4>
            <div className="filter-options">
              {['Macho', 'Fêmea', 'Desconhecido'].map(gender => (
                <label key={gender} className="filter-option">
                  <input 
                    type="checkbox"
                    checked={filters.gender.includes(gender)}
                    onChange={() => toggleFilter('gender', gender)}
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Idade</h4>
            <div className="filter-options">
              {['Filhote', 'Jovem', 'Adulto', 'Idoso', 'Desconhecido'].map(age => (
                <label key={age} className="filter-option">
                  <input 
                    type="checkbox"
                    checked={filters.estimatedAge.includes(age)}
                    onChange={() => toggleFilter('estimatedAge', age)}
                  />
                  {age}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {showList && (
        <div className="cats-list">
          <div className="list-header">
            <h3>Gatos Próximos</h3>
            <button onClick={() => setShowList(false)}>
              <Menu />
            </button>
          </div>
          
          {cats.length > 0 ? (
            <div className="list-items">
              {cats.map(cat => (
                <Link 
                  key={cat._id} 
                  to={`/cat/${cat._id}`}
                  className="cat-list-item"
                >
                  <img src={cat.photoUrl} alt={cat.name} />
                  <div className="cat-list-info">
                    <h4>{cat.name}</h4>
                    <p className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
                      {cat.health}
                    </p>
                    <p className="cat-location">{cat.location.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-list">
              <p>Nenhum gato encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      )}
      
      <MapContainer 
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcador da localização do usuário */}
        <Marker 
          position={mapCenter}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        >
          <Popup>Você está aqui</Popup>
        </Marker>
        
        {/* Marcadores dos gatos */}
        {cats.map(cat => {
          const coordinates = cat.location.coordinates;
          return (
            <Marker
              key={cat._id}
              position={[coordinates[1], coordinates[0]]}
              icon={healthIcons[cat.health] || healthIcons['Regular']}
              eventHandlers={{
                click: () => handleMarkerClick(cat)
              }}
            >
              <Popup>
                <CatPopup cat={cat} />
              </Popup>
            </Marker>
          );
        })}
        
        <RecenterMap position={mapCenter} />
      </MapContainer>
    </div>
  );