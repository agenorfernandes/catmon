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

// Conectar ao MongoDB
mongoose.connect(configDB.mongoURI)
  .then(() => console.log('MongoDB Conectado...'))
  .catch(err => {
    console.error('Erro na conexão com MongoDB:', err.message);
    process.exit(1);
  });

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/cats', catRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/users', userRoutes);

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Porta
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;
