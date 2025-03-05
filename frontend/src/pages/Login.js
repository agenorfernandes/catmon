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
import { useGoogleLogin } from '@react-oauth/google';
import api from '../utils/axios';

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
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const { email, password } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
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
      console.log('Attempting login...');
      const response = await api.post('/auth/login', formData);
      
      console.log('Login successful, storing token');
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Update authentication state
      login(response.data.token, response.data.user);
      
      toast.success('Successfully logged in!');
      
      // Redirect to previous page or home
      const redirectPath = location.state?.from || '/';
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error.response?.data?.msg || error.message);
      toast.error(error.response?.data?.msg || 'Error logging in');
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google login successful, token received');
        const response = await api.post('/auth/google', 
          { token: tokenResponse.access_token }
        );

        console.log('Backend authentication successful, storing token');
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Update authentication state
        login(response.data.token, response.data.user);
        
        toast.success('Google login successful!');
        navigate('/');
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(error.response?.data?.msg || 'Error logging in with Google');
      }
    },
    onError: (error) => {
      console.error('Google Login error:', error);
      toast.error('Error logging in with Google');
    }
  });
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-circle">
              <img src={katmonLogo} alt="KatMon Logo" className="login-logo" />
            </div>
          </div>
          <h1>Login to KatMon</h1>
          <p>Help stray cats and earn points!</p>
        </div>
        
        <div className="social-buttons">
          <button 
            className="google-login-btn"
            onClick={() => handleGoogleLogin()}
            type="button"
          >
            <img src={googleIcon} alt="Google" className="social-icon" />
            <span>Sign in with Google</span>
          </button>
          
          <button className="apple-login-btn">
            <img src={appleIcon} alt="Apple" className="social-icon" />
            <span>Sign in with Apple</span>
          </button>
        </div>
        
        <div className="divider">
          <span>or</span>
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
                placeholder="your@email.com"
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
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Your password"
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
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register" className="register-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;