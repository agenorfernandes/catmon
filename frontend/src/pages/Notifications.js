import React, { useState, useEffect, useContext } from 'react';
import { Bell } from 'react-feather';
import { AuthContext } from '../contexts/AuthContext';
import EmptyState from '../components/Shared/EmptyState';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você iria buscar as notificações do usuário
    // Simulando um carregamento
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="notifications-page">
      <h1>Notificações</h1>
      
      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              {/* Conteúdo da notificação */}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<Bell size={48} />}
          title="Nenhuma notificação"
          message="Você não tem notificações no momento."
        />
      )}
    </div>
  );
};

export default Notifications;