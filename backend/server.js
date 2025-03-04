require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const configDB = require('../config/db');
const authRoutes = require('./routes/authRoutes');
const catRoutes = require('./routes/catRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const userRoutes = require('./routes/userRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Inicializar app
const app = express();

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desativado para desenvolvimento, ativar em produção
  crossOriginEmbedderPolicy: false // Permite carregar recursos de domínios diferentes
}));

// Middleware para logs
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para compressão
app.use(compression());

// Limitar requisições para prevenir ataques de força bruta
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
});
app.use('/api/', apiLimiter);

// Configurar limite específico para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de login, tente novamente mais tarde'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Configuração do CORS
app.use((req, res, next) => {
  // Em desenvolvimento, aceita qualquer origem
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conectar ao MongoDB Atlas
console.log(`Conectando ao MongoDB Atlas (${process.env.NODE_ENV || 'development'})...`);
mongoose.connect(configDB.mongoURI, configDB.options)
  .then(() => console.log('MongoDB Atlas Conectado com Sucesso'))
  .catch(err => {
    console.error('Erro na conexão com MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);

// Rota de verificação de saúde
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  
  const memoryUsage = process.memoryUsage();
  const memoryStats = {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`
  };
  
  res.json({ 
    status: 'ok', 
    message: 'API KatMon funcionando',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeFormatted,
    memory: memoryStats,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Formatar tempo de execução em formato legível
function formatUptime(uptime) {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.round(uptime % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Middleware para tratamento de erros 404
app.use((req, res, next) => {
  res.status(404).json({
    msg: 'Endpoint não encontrado',
    path: req.path
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erro:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Erro interno no servidor' 
    : err.message;
  
  res.status(statusCode).json({
    msg: errorMessage,
    error: process.env.NODE_ENV === 'production' ? 'Entre em contato com o suporte' : err.stack
  });
});

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Porta
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Permitir conexões de qualquer IP

const server = app.listen(PORT, HOST, () => {
  console.log(`Servidor KatMon rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Tratamento de encerramento para graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB fechada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB fechada');
      process.exit(0);
    });
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  // Em produção, pode-se enviar uma notificação ao administrador
  if (process.env.NODE_ENV === 'production') {
    // Implementar notificação
  }
  
  // Em ambiente de produção, reinicia o servidor
  // Em desenvolvimento, encerra para evitar comportamento inesperado
  if (process.env.NODE_ENV === 'production') {
    console.log('Servidor continuará executando após erro não capturado');
  } else {
    console.log('Servidor será encerrado devido a erro não capturado');
    process.exit(1);
  }
});

// Tratamento de rejeições de promises não capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição de Promise não tratada:', reason);
  // Em ambiente de produção, pode registrar em um serviço de logs
});

module.exports = app;