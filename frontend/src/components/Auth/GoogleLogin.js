import React, { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

const GoogleLogin = () => {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // Carregar script do Google
    const loadGoogleScript = () => {
      // Verificar se o script já existe
      if (document.querySelector('script#google-login')) {
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'google-login';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      document.body.appendChild(script);
      
      script.onload = initializeGoogleLogin;
    };
    
    loadGoogleScript();
    
    return () => {
      // Limpar script ao desmontar componente
      const scriptTag = document.querySelector('script#google-login');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, []);
  
  const initializeGoogleLogin = () => {
    if (!window.google) return;
    
    window.google.accounts.id.initialize({
      client_id: '508080296158-oolionejtqmqdolsa1fjk2o94h5t3n17.apps.googleusercontent.com',
      callback: handleGoogleLogin,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    
    window.google.accounts.id.renderButton(
      document.getElementById('google-login-button'),
      { 
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 280
      }
    );
  };
  
  const handleGoogleLogin = async (response) => {
    try {
      // Enviar o token ID para o backend
      const apiResponse = await axios.post('/api/auth/google', {
        idToken: response.credential
      });
      
      // Login com o token JWT retornado pelo backend
      login(apiResponse.data.token, apiResponse.data.user);
      
      toast.success(t('success.loginSuccess'));
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast.error(t('errors.loginError'));
    }
  };
  
  return (
    <div className="google-login-container">
      <div id="google-login-button" className="google-login-button"></div>
    </div>
  );
};

export default GoogleLogin;