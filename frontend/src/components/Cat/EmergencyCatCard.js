import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin } from 'react-feather';

const EmergencyCatCard = ({ cat }) => {
  return (
    <Link to={`/cat/${cat._id}`} className="cat-card emergency">
      <div className="cat-card-image">
        <img src={cat.photoUrl} alt={cat.name} />
        <div className="emergency-badge">
          <AlertTriangle />
          Emergência
        </div>
      </div>
      
      <div className="cat-card-content">
        <h3 className="cat-name">{cat.name}</h3>
        
        <div className="cat-info">
          <div className="cat-location">
            <MapPin size={16} />
            <span>{cat.location?.address || 'Localização não especificada'}</span>
          </div>
          
          <div className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
            {cat.health}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EmergencyCatCard;