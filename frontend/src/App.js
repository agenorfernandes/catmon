import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'react-feather';
import 'react-toastify/dist/ReactToastify.css';
import './i18n'; // Import i18n configuration
import './styles/index.css';
import './styles/home.css';
import './styles/catProfile.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './utils/axios';
import api from './utils/axios';

// Contexts
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';

// Components
import Navbar from './components/Shared/Navbar';
import BottomNavigation from './components/Shared/BottomNavigation';
import LoadingSpinner from './components/Shared/LoadingSpinner';
import PrivateRoute from './components/Shared/PrivateRoute';

// Pages
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

// Log environment for debugging
console.log('App Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID ? '[SET]' : '[NOT SET]',
  PUBLIC_URL: process.env.PUBLIC_URL
});

// Internal component
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
    // Check server status when component mounts
    const checkServer = async () => {
      try {
        const response = await api.get('/health');
        console.log('Server Health Check:', response.data);
      } catch (error) {
        console.error('Error connecting to server:', error);
        toast.error('Error connecting to server. Please try again later.');
      }
    };

    checkServer();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully!');
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
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/cat/:id" element={<CatProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Notifications route */}
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          {/* Other private routes */}
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
          
          {/* 404 route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </main>
      <BottomNavigation />
    </div>
  );
};

function App() {
  // Get Google Client ID from environment variables
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn('Google Client ID is not set. Google login functionality may not work properly.');
  }
  
  console.log('Using Google Client ID:', googleClientId ? '[SET]' : '[NOT SET]');
  
  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
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