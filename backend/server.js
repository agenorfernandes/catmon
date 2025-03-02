const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const configDB = require('../config/db');
const authRoutes = require('./routes/authRoutes');
const catRoutes = require('./routes/catRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicializar app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB Atlas
console.log('Conectando ao MongoDB Atlas...');
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

// Rota de verificação de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API KatMon funcionando',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
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

app.listen(PORT, () => console.log(`Servidor KatMon rodando na porta ${PORT}`));

module.exports = app;