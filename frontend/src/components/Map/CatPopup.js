import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'react-feather';

const CatPopup = ({ cat }) => {
  return (
    <div className="cat-popup">
      <img 
        src={cat.photoUrl} 
        alt={cat.name} 
        className="popup-cat-image" 
      />
      
      <div className="popup-cat-info">
        <h3>{cat.name}</h3>
        
        <div className="popup-cat-details">
          <p>
            <MapPin size={16} />
            {cat.location?.address || 'Localização não especificada'}
          </p>
          
          <div className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
            {cat.health}
          </div>
        </div>
        
        <div className="popup-actions">
          <Link 
            to={`/cat/${cat._id}`} 
            className="btn btn-primary btn-small"
          >
            Ver Detalhes
          </Link>
          
          <button className="btn btn-secondary btn-small">
            <Heart />
            Favoritar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatPopup;
