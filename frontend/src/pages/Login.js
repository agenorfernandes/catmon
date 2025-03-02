import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'react-feather';
import axios from 'axios';
import { toast } from 'react-toastify';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import SocialLogin from '../components/Auth/SocialLogin';

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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Entrar no CatMon</h1>
          <p>Ajude gatos de rua e ganhe pontos!</p>
        </div>
        
        <SocialLogin />
        
        <div className="divider">
          <span>ou</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className="input-group">
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
                <AlertCircle className="error-icon" />
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <div className="input-group">
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
                <AlertCircle className="error-icon" />
                {errors.password}
              </div>
            )}
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Esqueceu a senha?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'} <ArrowRight className="btn-icon" />
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;