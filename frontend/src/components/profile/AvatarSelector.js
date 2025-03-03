import React from 'react';
import './AvatarSelector.css';
import avatarService from '../../services/avatarService';

const AvatarSelector = ({ onSelectAvatar, onClose }) => {
  const avatars = avatarService.getAllAvatars();

  return (
    <div className="avatar-selector-modal">
      <div className="avatar-selector-content">
        <h2>Escolha seu avatar</h2>
        <div className="avatar-grid">
          {avatars.map(avatar => (
            <div 
              key={avatar.id} 
              className="avatar-option"
              onClick={() => onSelectAvatar(avatar)}
              title={avatar.name}
            >
              <img src={avatar.url} alt={avatar.name} />
            </div>
          ))}
        </div> 
        <button 
          className="close-modal-btn"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AvatarSelector;