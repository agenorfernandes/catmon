import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Award, 
  Star, 
  CheckCircle, 
  Edit, 
  MapPin, 
  TrendingUp,
  Camera 
} from 'react-feather';
import { toast } from 'react-toastify';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import AvatarSelector from '../components/profile/AvatarSelector';

// Estilos
import '../styles/userProfile.css';

const UserProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePicture: null
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, statsResponse] = await Promise.all([
          axios.get('/api/users/profile'),
          axios.get('/api/users/stats')
        ]);
        
        setProfileData(profileResponse.data.user);
        setStats(profileResponse.data.stats);
        
        // Preencher dados do formulário
        setFormData({
          name: profileResponse.data.user.name,
          bio: profileResponse.data.user.bio || '',
          profilePicture: profileResponse.data.user.profilePicture
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        toast.error('Erro ao carregar perfil');
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePicture' && files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePicture: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = new FormData();
    updateData.append('name', formData.name);
    
    if (formData.bio) {
      updateData.append('bio', formData.bio);
    }
    
    if (formData.profilePicture instanceof File) {
      updateData.append('profilePicture', formData.profilePicture);
    }
    
    try {
      const response = await axios.put('/api/users/profile', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Atualizar contexto de autenticação
      updateUser(response.data);
      
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };
  
  const handleSelectAvatar = async (avatar) => {
    try {
      // Atualizar o avatar do usuário
      const response = await axios.put('/api/users/profile/avatar', {
        avatarId: avatar.id
      });
      
      // Atualizar contexto de autenticação
      updateUser(response.data);
      
      // Atualizar formulário
      setFormData(prev => ({
        ...prev,
        profilePicture: avatar.url
      }));
      
      setShowAvatarSelector(false);
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast.error('Erro ao atualizar avatar');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {editMode ? (
            <div className="avatar-edit">
              <img 
                src={
                  formData.profilePicture instanceof File 
                    ? URL.createObjectURL(formData.profilePicture)
                    : formData.profilePicture
                } 
                alt={user.name} 
              />
              <div 
                className="avatar-overlay"
                onClick={() => setShowAvatarSelector(true)}
              >
                <Camera size={24} />
                <span>Alterar foto</span>
              </div>
            </div>
          ) : (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
            />
          )}
        </div>
        
        <div className="profile-info">
          {editMode ? (
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Conte um pouco sobre você"
                rows="3"
              ></textarea>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Salvar
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1>{user.name}</h1>
              <p>{user.bio || 'Nenhuma bio adicionada'}</p>
              <button 
                className="edit-profile-btn"
                onClick={() => setEditMode(true)}
              >
                <Edit size={16} /> Editar Perfil
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <Award size={24} />
          <div className="stat-details">
            <h3>{user.level}</h3>
            <p>Nível</p>
          </div>
        </div>
        
        <div className="stat-card">
          <Star size={24} />
          <div className="stat-details">
            <h3>{user.points}</h3>
            <p>Pontos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <CheckCircle size={24} />
          <div className="stat-details">
            <h3>{stats?.totalCheckIns || 0}</h3>
            <p>Check-ins</p>
          </div>
        </div>
      </div>
      
      <section className="profile-sections">
        <div className="section-header">
          <h2>Minhas Conquistas</h2>
          <Link to="/achievements">Ver todas</Link>
        </div>
        
        {user.achievements && user.achievements.length > 0 ? (
          <div className="achievements-grid">
            {user.achievements.slice(0, 4).map((achievement, index) => (
              <div key={index} className="achievement-item">
                <img 
                  src={achievement.icon} 
                  alt={achievement.title} 
                />
                <div className="achievement-details">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-achievements">
            <p>Nenhuma conquista desbloqueada ainda</p>
            <p>Continue ajudando gatos para desbloquear conquistas!</p>
          </div>
        )}
      </section>
      
      <section className="profile-sections">
        <div className="section-header">
          <h2>Meus Gatos Favoritos</h2>
          <Link to="/favorites">Ver todos</Link>
        </div>
        
        {stats?.favorites && stats.favorites.length > 0 ? (
          <div className="favorites-grid">
            {stats.favorites.slice(0, 4).map(cat => (
              <Link 
                key={cat._id} 
                to={`/cat/${cat._id}`} 
                className="favorite-cat-card"
              >
                <img src={cat.photoUrl} alt={cat.name} />
                <div className="cat-details">
                  <h4>{cat.name}</h4>
                  <p>
                    <MapPin size={16} />
                    {cat.location.address}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <p>Nenhum gato adicionado aos favoritos</p>
            <Link to="/map" className="btn btn-primary">
              Encontrar Gatos
            </Link>
          </div>
        )}
      </section>
      
      <section className="profile-sections">
        <div className="section-header">
          <h2>Últimos Check-ins</h2>
          <Link to="/checkins">Ver todos</Link>
        </div>
        
        {stats?.recentCheckIns && stats.recentCheckIns.length > 0 ? (
          <div className="checkins-list">
            {stats.recentCheckIns.slice(0, 3).map(checkIn => (
              <div key={checkIn._id} className="checkin-item">
                <img 
                  src={checkIn.cat.photoUrl} 
                  alt={checkIn.cat.name} 
                />
                <div className="checkin-details">
                  <h4>{checkIn.cat.name}</h4>
                  <p>{checkIn.actions.join(', ')}</p>
                  <span>
                    {new Date(checkIn.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-checkins">
            <p>Nenhum check-in recente</p>
            <Link to="/map" className="btn btn-primary">
              Fazer Check-in
            </Link>
          </div>
        )}
      </section>
      
      {/* Modal para seleção de avatar */}
      {showAvatarSelector && (
        <AvatarSelector 
          onSelectAvatar={handleSelectAvatar}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
    </div>
  );
};

export default UserProfile; 