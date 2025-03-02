// Config para conectar ao MongoDB Atlas (serviço gratuito na nuvem)
module.exports = {
  // Substitua essa URI pela sua string de conexão do MongoDB Atlas
  // Formato: mongodb+srv://<username>:<password>@cluster0.mongodb.net/catmon?retryWrites=true&w=majority
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/catmon',
  
  // Opções de conexão
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  },
  
  // Configurações de indexação geoespacial para localização dos gatos
  geoIndexConfig: {
    location: '2dsphere'
  }
};
