#!/bin/bash

# Diretórios dos projetos
FRONTEND_DIR="catmon/frontend"
BACKEND_DIR="catmon/backend"

# Função para iniciar o frontend
start_frontend() {
  echo "Iniciando o frontend..."
  cd "$FRONTEND_DIR" || { echo "Erro ao acessar o diretório do frontend."; return 1; }
  npm start
  cd ../.. # Volta para o diretório raiz
}

# Função para iniciar o backend
start_backend() {
  echo "Iniciando o backend..."
  cd "$BACKEND_DIR" || { echo "Erro ao acessar o diretório do backend."; return 1; }
  npm start
  cd ../.. # Volta para o diretório raiz
}

# Inicia os projetos em background
start_frontend &
start_backend &

echo "Frontend e backend iniciados."

# Aguarda os processos em background terminarem
wait