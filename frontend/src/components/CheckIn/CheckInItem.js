import React from 'react';
import { Clock, Camera } from 'react-feather';
import { Link } from 'react-router-dom';

const CheckinItem = ({ checkIn }) => {
  return (
    <div className="checkin-item">
      <div className="checkin-header">
        <img 
          src={checkIn.user?.profilePicture || 'default-avatar.png'} 
          alt={checkIn.user?.name || 'Usuário'} 
          className="user-avatar" 
        />
        <div className="checkin-meta">
          <h4>{checkIn.user?.name}</h4>
          <p>
            <Clock size={16} />
            {new Date(checkIn.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="checkin-actions">
        {checkIn.actions?.map((action, index) => (
          <span key={index} className="action-tag">{action}</span>
        ))}
      </div>
      
      {checkIn.photosUrl && checkIn.photosUrl.length > 0 && (
        <div className="checkin-photos">
          {checkIn.photosUrl.map((photo, index) => (
            <img 
              key={index} 
              src={photo} 
              alt={`Check-in foto ${index + 1}`} 
            />
          ))}
        </div>
      )}
      
      {checkIn.actionsDescription && (
        <p className="checkin-description">
          {checkIn.actionsDescription}
        </p>
      )}
      
      {checkIn.cat && (
        <Link to={`/cat/${checkIn.cat._id}`} className="checkin-cat-link">
          <img 
            src={checkIn.cat.photoUrl} 
            alt={checkIn.cat.name} 
            className="cat-thumbnail" 
          />
          <span>{checkIn.cat.name}</span>
        </Link>
      )}
    </div>
  );
};

export default CheckinItem;