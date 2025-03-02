import React, { useState, useEffect, useContext } from 'react';
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

// Configuração de ícone padrão do Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Definir o ícone padrão
L.Marker.prototype.options.icon = DefaultIcon;

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
          {/* Implementar filtros aqui */}
        </div>
      )}
      
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: 'calc(100vh - 60px)', width: '100%' }}
        scrollWheelZoom={false}
      >
        <RecenterMap position={mapCenter} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {cats.map(cat => (
          <Marker 
            key={cat._id} 
            position={[cat.location.coordinates[1], cat.location.coordinates[0]]}
            eventHandlers={{
              click: () => handleMarkerClick(cat)
            }}
          >
            <Popup>
              <CatPopup cat={cat} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {showList && (
        <div className="map-cat-list">
          {cats.map(cat => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MapPage;