import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, AlertTriangle, Clock, Droplet, Coffee } from 'react-feather';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Contextos
import { AuthContext } from '../contexts/AuthContext';
import { LocationContext } from '../contexts/LocationContext';

// Componentes
import CatCard from '../components/Cat/CatCard';
import EmergencyCatCard from '../components/Cat/EmergencyCatCard';
import EmptyState from '../components/Shared/EmptyState';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'nearby':
        return nearbyCats.length > 0 ? (
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
        );
      
      case 'emergency':
        return emergencyCats.length > 0 ? (
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
        );
      
      case 'recent':
        return isAuthenticated ? (
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
                        {checkIn.actions.map((action, index) => {
                          let icon;
                          switch (action) {
                            case 'Alimentou':
                              icon = <Coffee className="icon" />;
                              break;
                            case 'Deu água':
                              icon = <Droplet className="icon" />;
                              break;
                            default:
                              icon = null;
                          }
                          return (
                            <span key={index} className="action-tag">
                              {icon} {action}
                            </span>
                          );
                        })}
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
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>{t('home.welcome')}</h1>
          <p>{t('app.slogan')}</p>
          
          <div className="hero-actions">
            {!isAuthenticated && (
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary">{t('auth.register')}</Link>
                <Link to="/login" className="btn btn-secondary">{t('auth.login')}</Link>
              </div>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </section>
      
      <section className="tabs-section">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'nearby' ? 'active' : ''}`}
            onClick={() => setActiveTab('nearby')}
          >
            <MapPin className="tab-icon" />
            {t('home.nearbyCats')}
          </button>
          <button 
            className={`tab ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <AlertTriangle className="tab-icon" />
            {t('home.emergencies')}
          </button>
          <button 
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock className="tab-icon" />
            {t('home.myCheckIns')}
          </button>
        </div>
        
        <div className="tab-content">
          {renderContent()}
        </div>
      </section>
    </div>
  );
};

export default Home;