import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertTriangle, Clock, Heart } from 'react-feather';
import axios from 'axios';

// Contextos
import { AuthContext } from '../contexts/AuthContext';
import { LocationContext } from '../contexts/LocationContext';

// Componentes
import CatCard from '../components/Cat/CatCard';
import EmergencyCatCard from '../components/Cat/EmergencyCatCard';
import EmptyState from '../components/Shared/EmptyState';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { userLocation } = useContext(LocationContext);
  
  const [nearbyCats, setNearbyCats] = useState([]);
  const [emergencyCats, setEmergencyCats] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on active tab
        if (activeTab === 'nearby' && userLocation) {
          const response = await axios.get(`/api/cats/nearby`, {
            params: {
              lat: userLocation.latitude,
              lng: userLocation.longitude,
              radius: 5000 // 5km
            }
          });
          setNearbyCats(response.data);
        } else if (activeTab === 'emergency') {
          const response = await axios.get('/api/cats', {
            params: {
              health: 'Precisa de atenção,Emergência',
              status: 'Ativo',
              sort: '-updatedAt'
            }
          });
          setEmergencyCats(response.data.cats);
        } else if (activeTab === 'recent' && isAuthenticated) {
          const response = await axios.get('/api/checkins/user', {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          setRecentCheckIns(response.data.checkIns);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, userLocation, isAuthenticated]);

  return (
    <div className="home-page">

      
      <div className="tabs-section">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            <Heart size={20} />
            <span>{t('home.nearbyCats')}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <AlertTriangle size={20} />
            <span>{t('home.emergencies')}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={20} />
            <span>{t('home.myCheckIns')}</span>
          </button>
        </div>
        
        <div className="tab-content">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeTab === 'nearby' && (
                nearbyCats.length > 0 ? (
                  <div className="cat-gallery">
                    {nearbyCats.map(cat => (
                      <Link to={`/cat/${cat._id}`} key={cat._id} className="cat-gallery-item">
                        <div className="cat-gallery-image">
                          <img src={cat.photoUrl} alt={cat.name} />
                          <div className="cat-status-badge">
                            <span className={`health-status ${cat.health.toLowerCase().replace(/\s+/g, '-')}`}>
                              {cat.health}
                            </span>
                          </div>
                        </div>
                        <div className="cat-gallery-info">
                          <h3>{cat.name}</h3>
                          <p className="cat-location">
                            <MapPin size={14} />
                            {cat.location?.address || 'Localização não especificada'}
                          </p>
                          <div className="cat-actions">
                            <Link to={`/checkin/${cat._id}`} className="cat-checkin-btn">
                              Fazer Check-in
                            </Link>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<MapPin size={48} />}
                    title={t('home.noNearbyCats')}
                    message={t('home.noNearbyCatsMsg')}
                    actionLink="/add-cat"
                    actionText={t('home.addCat')}
                  />
                )
              )}
              
              {activeTab === 'emergency' && (
                emergencyCats.length > 0 ? (
                  <div className="cat-gallery">
                    {emergencyCats.map(cat => (
                      <Link to={`/cat/${cat._id}`} key={cat._id} className="cat-gallery-item emergency">
                        <div className="cat-gallery-image">
                          <img src={cat.photoUrl} alt={cat.name} />
                          <div className="cat-status-badge">
                            <span className="health-status emergência">
                              {cat.health}
                            </span>
                          </div>
                        </div>
                        <div className="cat-gallery-info">
                          <h3>{cat.name}</h3>
                          <p className="cat-location">
                            <MapPin size={14} />
                            {cat.location?.address || 'Localização não especificada'}
                          </p>
                          <div className="cat-actions">
                            <Link to={`/checkin/${cat._id}`} className="cat-checkin-btn emergency">
                              Ajudar Agora
                            </Link>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<AlertTriangle size={48} />}
                    title={t('home.noEmergencies')}
                    message={t('home.noEmergenciesMsg')}
                  />
                )
              )}
              
              {activeTab === 'recent' && (
                isAuthenticated ? (
                  recentCheckIns.length > 0 ? (
                    <div className="checkin-gallery">
                      {recentCheckIns.map(checkIn => (
                        <div key={checkIn._id} className="checkin-card">
                          <Link to={`/cat/${checkIn.cat._id}`} className="checkin-header">
                            <img src={checkIn.cat.photoUrl} alt={checkIn.cat.name} className="checkin-cat-image"/>
                            <div className="checkin-info">
                              <h3>{checkIn.cat.name}</h3>
                              <p className="checkin-time">
                                <Clock size={14} /> {new Date(checkIn.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                          <div className="checkin-body">
                            <div className="checkin-actions-list">
                              {checkIn.actions.map((action, index) => (
                                <span key={index} className="action-tag">
                                  {action}
                                </span>
                              ))}
                            </div>
                            {checkIn.actionsDescription && (
                              <p className="checkin-description">{checkIn.actionsDescription}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Clock size={48} />}
                      title={t('home.noCheckIns')}
                      message={t('home.noCheckInsMsg')}
                      actionLink="/map"
                      actionText={t('home.viewMap')}
                    />
                  )
                ) : (
                  <EmptyState 
                    icon={<Heart size={48} />}
                    title={t('home.loginToHelp')}
                    message={t('home.loginToHelpMsg')}
                    actionLink="/login"
                    actionText={t('auth.login')}
                  />
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;