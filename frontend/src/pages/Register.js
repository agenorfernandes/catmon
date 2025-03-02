import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'react-feather';
import { toast } from 'react-toastify';
import axios from 'axios';

// Contextos
import { AuthContext } from '../contexts/AuthContext';

// Componentes
import SocialLogin from '../components/Auth/SocialLogin';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpar erro do campo ao digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!name) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
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
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      // Armazenar token no localStorage
      localStorage.setItem('token', response.data.token);
      
      // Atualizar estado de autenticação
      login(response.data.token, response.data.user);
      
      toast.success('Cadastro realizado com sucesso!');
      
      navigate('/');
    } catch (error) {
      console.error('Erro no cadastro:', error.response?.data?.msg || error.message);
      toast.error(error.response?.data?.msg || 'Erro ao cadastrar');
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Criar Conta no CatMon</h1>
          <p>Ajude gatos de rua e ganhe pontos!</p>
        </div>
        
        <SocialLogin />
        
        <div className="divider">
          <span>ou</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="name">Nome</label>
            <div className="input-group">
              <User className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Seu nome"
                className={errors.name ? 'error' : ''}
              />
            </div>
            {errors.name && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.name}
              </div>
            )}
          </div>
          
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
          
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirme sua senha"
                className={errors.confirmPassword ? 'error' : ''}
              />
            </div>
            {errors.confirmPassword && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
                {errors.confirmPassword}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'} <ArrowRight className="btn-icon" />
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
