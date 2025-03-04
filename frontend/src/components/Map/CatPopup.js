import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'react-feather';

const CatPopup = ({ cat }) => {
  if (!cat) return null;
  
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
        </div>
      </div>
      
      <style jsx>{`
        .cat-popup {
          display: flex;
          flex-direction: column;
          width: 200px;
        }
        
        .popup-cat-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .popup-cat-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        
        .popup-cat-details {
          margin-bottom: 8px;
        }
        
        .popup-cat-details p {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0 0 4px 0;
          font-size: 12px;
        }
        
        .health-status {
          display: inline-block;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 12px;
          margin-bottom: 8px;
        }
        
        .excelente {
          background-color: #e6f7ee;
          color: #00a86b;
        }
        
        .bom {
          background-color: #e3f5ff;
          color: #0085ff;
        }
        
        .regular {
          background-color:rgba(51, 51, 49, 0.59);
          color: #ffc107;
        }
        
        .precisa-de-atenção {
          background-color:rgba(51, 51, 49, 0.59);
          color: #ff7043;
        }
        
        .emergência {
          background-color:rgba(51, 51, 49, 0.59);
          color: #ff4343;
        }
        
        .popup-actions {
          display: flex;
          justify-content: center;
        }
        
        .btn-small {
          font-size: 12px;
          padding: 4px 8px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
        }
        
        .btn-primary {
          background-color:rgba(255, 255, 255, 0.59);
          color: white;
          padding: 7px 12px;
          border-radius: 20px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          text-align: center;
          width: 100%;
        }

        .btn-primary:hover {
          background-color:rgb(155, 155, 155);
        }
      `}</style>
    </div>
  );
};

export default CatPopup;