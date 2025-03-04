import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'react-feather';
import 'react-toastify/dist/ReactToastify.css';
import './i18n'; // Importar configuração de i18n
import './styles/index.css';
import './styles/home.css'; // Agora o arquivo existe e pode ser importado
import './styles/catProfile.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './utils/axios';
import api from './utils/axios';

// Contextos
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';

// Componentes
import Navbar from './components/Shared/Navbar';
import BottomNavigation from './components/Shared/BottomNavigation';
import LoadingSpinner from './components/Shared/LoadingSpinner';
import PrivateRoute from './components/Shared/PrivateRoute';

// Páginas
import Home from './pages/Home';
import Map from './pages/Map';
import CatProfile from './pages/CatProfile';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import AddCat from './pages/AddCat';
import CheckIn from './pages/CheckIn';
import Ranking from './pages/Ranking';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Novo componente interno
const AppContent = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    document.title = t('app.name');
  }, [t]);

  useEffect(() => {
    // Verificar o status do servidor quando o componente montar
    const checkServer = async () => {
      try {
        await api.get('/api/health');
      } catch (error) {
        console.error('Erro ao conectar ao servidor:', error);
        toast.error('Erro ao conectar ao servidor');
      }
    };

    checkServer();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="app-container">
      <ToastContainer position="top-center" />
      {isAuthenticated && (
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sair
        </button>
      )}
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/cat/:id" element={<CatProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rota de notificações */}
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          {/* Outras rotas privadas */}
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/add-cat" element={
            <PrivateRoute>
              <AddCat />
            </PrivateRoute>
          } />
          <Route path="/checkin/:catId?" element={
            <PrivateRoute>
              <CheckIn />
            </PrivateRoute>
          } />
          <Route path="/ranking" element={
            <PrivateRoute>
              <Ranking />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          
          {/* Rota 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </main>
      <BottomNavigation />
    </div>
  );
};

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "273781721797-f1ls93taesljc0ic4notel3ev3g4rcqc.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <AppContent />
          </Router>
        </LocationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;