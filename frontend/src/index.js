import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';  // Caminho corrigido
import App from './App';
import './i18n'; // Importar configuração de i18n

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);