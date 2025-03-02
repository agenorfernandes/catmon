import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Award, Star, TrendingUp } from 'react-feather';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const Ranking = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  
  const [ranking, setRanking] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get('/api/users/ranking');
        
        setRanking(response.data.ranking);
        setUserRank(response.data.userRank);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <Star size={48} />
        <h1>Ranking de Usuários</h1>
        <p>Ajude gatos e ganhe pontos!</p>
      </div>
      
      {user && (
        <div className="user-ranking-summary">
          <div className="user-rank">
            <h3>Sua Posição</h3>
            <div className="rank-badge">
              <span>{userRank}º</span>
            </div>
          </div>
          
          <div className="user-stats">
            <div className="stat-item">
              <Award />
              <span>{user.points} Pontos</span>
            </div>
            <div className="stat-item">
              <TrendingUp />
              <span>Nível {user.level}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="ranking-list">
        <h2>Top Usuários</h2>
        
        {ranking.map((rankedUser, index) => (
          <div 
            key={rankedUser._id} 
            className={`ranking-item ${rankedUser._id === user?._id ? 'current-user' : ''}`}
          >
            <div className="rank-position">
              <span>{index + 1}º</span>
            </div>
            
            <div className="user-info">
              <img 
                src={rankedUser.profilePicture} 
                alt={rankedUser.name} 
                className="user-avatar" 
              />
              <div className="user-details">
                <h4>{rankedUser.name}</h4>
                <div className="user-achievements">
                  <span>Nível {rankedUser.level}</span>
                  <span>{rankedUser.points} pontos</span>
                  <span>{rankedUser.totalCatsHelped} gatos ajudados</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {ranking.length === 0 && (
          <div className="empty-ranking">
            <p>Nenhum usuário no ranking ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;