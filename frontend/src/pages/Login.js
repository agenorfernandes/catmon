import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'react-feather';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import SocialLogin from '../components/Auth/SocialLogin';
import googleIcon from '../assets/icons/google.svg';
import appleIcon from '../assets/icons/apple.svg';
import katmonLogo from '../assets/Logo_Katmon-removebg-preview.svg';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const { email, password } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpar erro do campo ao digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      
      // Armazenar token no localStorage
      localStorage.setItem('token', response.data.token);
      
      // Atualizar estado de autenticação
      login(response.data.token, response.data.user);
      
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar para a página anterior ou home
      const redirectPath = location.state?.from || '/';
      navigate(redirectPath);
    } catch (error) {
      console.error('Erro no login:', error.response?.data?.msg || error.message);
      toast.error(error.response?.data?.msg || 'Erro ao fazer login');
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-circle">
              <img src={katmonLogo} alt="KatMon Logo" className="login-logo" />
            </div>
          </div>
          <h1>Entrar no KatMon</h1>
          <p>Ajude gatos de rua e ganhe pontos!</p>
        </div>
        
        <div className="social-buttons">
          <button className="google-login-btn">
            <img src={googleIcon} alt="Google" className="social-icon" />
            <span>Fazer login com o Google</span>
          </button>
          
          <button className="apple-login-btn">
            <img src={appleIcon} alt="Apple" className="social-icon" />
            <span>Entrar com Apple</span>
          </button>
        </div>
        
        <div className="divider">
          <span>ou</span>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && (
              <div className="error-message">
                <AlertCircle size={16} className="error-icon" />
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <div className="label-forgot">
              <label htmlFor="password">Senha</label>
              <Link to="/forgot-password" className="forgot-link">Esqueceu a senha?</Link>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Sua senha"
                className={errors.password ? 'error' : ''}
              />
            </div>
            {errors.password && (
              <div className="error-message">
                <AlertCircle size={16} className="error-icon" />
                {errors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
            <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Não tem uma conta? <Link to="/register" className="register-link">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;