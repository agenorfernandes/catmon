import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import './i18n'; // Importar configuração de i18n
import './styles/index.css';
import './styles/home.css'; // Agora o arquivo existe e pode ser importado
import './styles/catProfile.css';

// Contextos
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Atualizar título da página com base no idioma
    document.title = t('app.name');
  }, [t]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <div className="app-container">
            <ToastContainer position="top-center" />
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
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;