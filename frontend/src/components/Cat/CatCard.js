import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, Clock } from 'react-feather';

const CatCard = ({ cat }) => {
  // Função para calcular tempo desde o último check-in
  const getLastCheckInTime = () => {
    const lastCheckIn = new Date(cat.lastCheckIn);
    const now = new Date();
    
    const diffTime = Math.abs(now - lastCheckIn);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'há menos de 1 hora';
    } else if (diffHours < 24) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) {
        return 'há 1 dia';
      } else if (diffDays < 30) {
        return `há ${diffDays} dias`;
      } else {
        const diffMonths = Math.floor(diffDays / 30);
        return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
      }
    }
  };
  
  return (
    <Link to={`/cat/${cat._id}`} className="cat-card">
      <div className="cat-card-image">
        <img src={cat.photoUrl} alt={cat.name} />
        
        <div className={`health-badge ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
          {cat.health}
        </div>
      </div>
      
      <div className="cat-card-content">
        <h3 className="cat-name">{cat.name}</h3>
        
        <div className="cat-info">
          <div className="cat-location">
            <MapPin size={16} className="icon" />
            <span>{cat.location.address}</span>
          </div>
          
          <div className="cat-checkin">
            <Clock size={16} className="icon" />
            <span>Check-in {getLastCheckInTime()}</span>
          </div>
          
          {cat.needs && cat.needs.length > 0 && (
            <div className="cat-needs">
              <AlertTriangle size={16} className="icon" />
              <span>Precisa de ajuda</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CatCard;