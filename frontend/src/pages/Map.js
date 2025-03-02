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
      {/* Resto do código anterior permanece o mesmo */}
    </div>
  );
};

export default MapPage;