#!/bin/bash

# Deploy script para KatMon

echo "Iniciando deploy do KatMon..."

# Configurar ambiente baseado no parâmetro (local ou prod)
if [ "$1" == "prod" ]; then
  echo "Configurando para ambiente de produção"
  export NODE_ENV=production
  export PUBLIC_URL=https://catmon.com.br
  export FRONTEND_URL=https://catmon.com.br
  export API_URL=https://catmon.com.br/api
else
  echo "Configurando para ambiente local"
  export NODE_ENV=development
  export PUBLIC_URL=http://localhost
  export FRONTEND_URL=http://localhost:3000
  export API_URL=http://localhost:5000
fi

# Instalar dependências do backend
echo "Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd ../frontend
npm install

# Criar build de produção do frontend
if [ "$1" == "prod" ]; then
  echo "Criando build de produção do frontend..."
  npm run build
fi

# Retornar para a raiz
cd ..

# Iniciar a aplicação
if [ "$1" == "prod" ]; then
  echo "Iniciando aplicação em modo produção..."
  pm2 start backend/server.js --name katmon-backend
  echo "Deploy concluído. Aplicação rodando em: $PUBLIC_URL"
else
  echo "Iniciando aplicação em modo desenvolvimento..."
  npm run dev
fi