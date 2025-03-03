import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertTriangle, Clock, Heart } from 'react-feather';  // Adicionei o import do Heart
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
      <div className="welcome-banner">
        <h1>{t('home.welcome')}</h1>
        <p>{t('app.slogan')}</p>
      </div>
      
      <div className="tabs-section">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            <MapPin size={20} />
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
                  <div className="cat-grid">
                    {nearbyCats.map(cat => (
                      <CatCard key={cat._id} cat={cat} />
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
                  <div className="cat-grid">
                    {emergencyCats.map(cat => (
                      <EmergencyCatCard key={cat._id} cat={cat} />
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
                    <div className="checkin-list">
                      {recentCheckIns.map(checkIn => (
                        <div key={checkIn._id} className="checkin-card">
                          <Link to={`/cat/${checkIn.cat._id}`}>
                            <img src={checkIn.cat.photoUrl} alt={checkIn.cat.name} />
                            <div className="checkin-info">
                              <h3>{checkIn.cat.name}</h3>
                              <p>
                                <Clock className="icon" /> {new Date(checkIn.createdAt).toLocaleDateString()}
                              </p>
                              <div className="checkin-actions">
                                {checkIn.actions.map((action, index) => (
                                  <span key={index} className="action-tag">
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </Link>
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