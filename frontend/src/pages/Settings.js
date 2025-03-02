import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  User, 
  LogOut, 
  Trash2 
} from 'react-feather';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings = () => {
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  
  const [notificationSettings, setNotificationSettings] = useState({
    nearbyAlerts: user?.notificationSettings?.nearbyAlerts ?? true,
    favoriteUpdates: user?.notificationSettings?.favoriteUpdates ?? true,
    achievementAlerts: user?.notificationSettings?.achievementAlerts ?? true,
    notificationRadius: user?.notificationSettings?.radius ?? 5000
  });
  
  const handleToggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleRadiusChange = (e) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationRadius: parseInt(e.target.value)
    }));
  };
  
  const saveNotificationSettings = async () => {
    try {
      // Implementar chamada à API para salvar configurações
      const response = await axios.put('/api/users/profile', {
        notificationSettings: {
          nearbyAlerts: notificationSettings.nearbyAlerts,
          favoriteUpdates: notificationSettings.favoriteUpdates,
          achievementAlerts: notificationSettings.achievementAlerts,
          radius: notificationSettings.notificationRadius
        }
      });
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };
  
  const handleDeleteAccount = () => {
    // Implementar lógica de exclusão de conta
    const confirmDelete = window.confirm(
      'Tem certeza? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.'
    );
    
    if (confirmDelete) {
      // Chamada à API para excluir conta
      // Implementação futura
      toast.error('Funcionalidade não implementada');
    }
  };
  
  return (
    <div className="settings-page">
      <div className="settings-header">
        <SettingsIcon size={48} />
        <h1>Configurações</h1>
      </div>
      
      <section className="settings-section account-section">
        <h2>
          <User /> Conta
        </h2>
        <div className="account-info">
          <img 
            src={user?.profilePicture} 
            alt={user?.name} 
            className="user-avatar" 
          />
          <div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
      </section>
      
      <section className="settings-section notifications-section">
        <h2>
          <Bell /> Notificações
        </h2>
        
        <div className="notification-settings">
          <div className="setting-toggle">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.nearbyAlerts}
                onChange={() => handleToggleNotification('nearbyAlerts')}
              />
              Alertas de gatos próximos
            </label>
          </div>
          
          <div className="setting-toggle">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.favoriteUpdates}
                onChange={() => handleToggleNotification('favoriteUpdates')}
              />
              Atualizações de gatos favoritos
            </label>
          </div>
          
          <div className="setting-toggle">
            <label>
              <input
                type="checkbox"
                checked={notificationSettings.achievementAlerts}
                onChange={() => handleToggleNotification('achievementAlerts')}
              />
              Alertas de conquistas
            </label>
          </div>
          
          <div className="setting-slider">
            <label>
              Raio de notificação: {notificationSettings.notificationRadius / 1000} km
              <input
                type="range"
                min="1000"
                max="10000"
                step="1000"
                value={notificationSettings.notificationRadius}
                onChange={handleRadiusChange}
              />
            </label>
            </div>
          
          <button 
            className="save-notifications-btn"
            onClick={saveNotificationSettings}
          >
            Salvar Configurações de Notificação
          </button>
        </div>
      </section>
      
      <section className="settings-section language-section">
        <h2>
          <Globe /> Idioma
        </h2>
        <LanguageSwitcher />
      </section>
      
      <section className="settings-section dangerous-section">
        <h2>Zona de Perigo</h2>
        
        <div className="dangerous-actions">
          <button 
            className="logout-btn"
            onClick={logout}
          >
            <LogOut /> Sair da Conta
          </button>
          
          <button 
            className="delete-account-btn"
            onClick={handleDeleteAccount}
          >
            <Trash2 /> Excluir Conta
          </button>
        </div>
        
        <p className="danger-warning">
          Atenção: A exclusão de conta é permanente e não pode ser desfeita.
        </p>
      </section>
      
      <section className="settings-section about-section">
        <h2>Sobre o Aplicativo</h2>
        <div className="app-info">
          <p>KatMon - Versão 1.0.0</p>
          <p>
            Desenvolvido com ❤️ para ajudar gatos de rua 
            e conectar pessoas que querem fazer a diferença.
          </p>
          <div className="app-links">
            <a href="/privacy-policy">Política de Privacidade</a>
            <a href="/terms-of-service">Termos de Serviço</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;            