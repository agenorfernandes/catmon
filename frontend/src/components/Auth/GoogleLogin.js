import React, { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import './GoogleLogin.css';

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
    <div className="google-login-custom">
      <button id="google-login-button" className="google-login-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
        <span>{t('auth.googleLogin')}</span>
      </button>
    </div>
  );
};

export default GoogleLogin;