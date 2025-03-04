const config = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/katmon',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

module.exports = config;
