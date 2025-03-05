#!/bin/bash
# Very Simple KatMon Deployment Script
# Starts backend and frontend services

# Function for logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Project directory is the directory where the script is located
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
log "Starting KatMon services from $PROJECT_DIR..."
log "Running as user: $(whoami)"

# Ensure uploads directory exists
log "Creating uploads directory if it doesn't exist..."
mkdir -p "$PROJECT_DIR/uploads/cats" "$PROJECT_DIR/uploads/profiles" "$PROJECT_DIR/uploads/checkins"

# Start backend service with production environment
log "Starting backend service with production environment..."
cd "$PROJECT_DIR/backend"
# Stop existing backend service if running
if pm2 list | grep -q "katmon-backend"; then
  log "Stopping existing backend service..."
  pm2 stop katmon-backend
  pm2 delete katmon-backend
fi
NODE_ENV=production pm2 start server.js --name katmon-backend

# Start frontend service
log "Starting frontend service..."
cd "$PROJECT_DIR/frontend"
# Stop existing frontend service if running
if pm2 list | grep -q "katmon-frontend"; then
  log "Stopping existing frontend service..."
  pm2 stop katmon-frontend
  pm2 delete katmon-frontend
fi
pm2 start npm --name katmon-frontend -- start

log "Backend and Frontend services started. Current PM2 processes:"
pm2 list
log "Deployment complete!"