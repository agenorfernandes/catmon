import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrigir o problema de ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const CatMap = ({ cat }) => {
  // Verificar se o gato tem coordenadas válidas
  if (!cat || !cat.location || !cat.location.coordinates || cat.location.coordinates.length !== 2) {
    return (
      <div className="cat-map-error">
        <p>Não foi possível exibir o mapa. Localização inválida.</p>
      </div>
    );
  }

  // Coordenadas do gato (no MongoDB são armazenadas como [longitude, latitude])
  const [longitude, latitude] = cat.location.coordinates;

  return (
    <MapContainer 
      center={[latitude, longitude]} 
      zoom={15} 
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div>
            <h3>{cat.name}</h3>
            <p>{cat.location.address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default CatMap;