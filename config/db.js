// Config para conectar ao MongoDB Atlas
module.exports = {
  // Conexão direta com MongoDB Atlas
  mongoURI: process.env.MONGO_URI || "mongodb+srv://agenorfbp:jcA5ACDmRmFQ9YuB@catmon.qsweq.mongodb.net/?retryWrites=true&w=majority&appName=catmon",
  
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