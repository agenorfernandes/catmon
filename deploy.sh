#!/bin/bash

# KatMon Deployment Script

# Detect script location and set APP_DIR accordingly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
APP_DIR="$( dirname "$SCRIPT_DIR" )"  # Assume script is in a subdirectory of the app

# Set environment variables
export NODE_ENV=production
export PATH=$PATH:/usr/local/bin:$HOME/.nvm/versions/node/v18.16.0/bin

# Log file
LOG_FILE="$APP_DIR/deploy.log"

# Function for timestamped logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print start message and environment info
log "Starting KatMon deployment..."
log "Detected application directory: $APP_DIR"
log "Running as user: $(whoami)"
log "Current path: $PATH"

# Navigate to the project directory
cd $APP_DIR || { log "Failed to navigate to application directory"; exit 1; }

# Pull latest changes
log "Pulling latest changes from repository..."
git pull || { log "Failed to pull latest changes"; exit 1; }

# Install backend dependencies
log "Installing backend dependencies..."
cd $APP_DIR/backend || { log "Failed to navigate to backend directory"; exit 1; }
npm ci --production || { log "Failed to install backend dependencies"; exit 1; }

# Install frontend dependencies
log "Installing frontend dependencies..."
cd $APP_DIR/frontend || { log "Failed to navigate to frontend directory"; exit 1; }
npm ci || { log "Failed to install frontend dependencies"; exit 1; }

# Copy production environment files
log "Copying production environment files..."
cp $APP_DIR/backend/.env.production $APP_DIR/backend/.env || { log "Failed to copy backend environment file"; exit 1; }
cp $APP_DIR/frontend/.env.production $APP_DIR/frontend/.env || { log "Failed to copy frontend environment file"; exit 1; }

# Build frontend
log "Building frontend..."
npm run build || { log "Failed to build frontend"; exit 1; }

# Ensure uploads directory exists
log "Ensuring uploads directory exists..."
mkdir -p $APP_DIR/uploads/cats $APP_DIR/uploads/profiles $APP_DIR/uploads/checkins || { log "Failed to create uploads directories"; exit 1; }

# Set proper permissions (use current user instead of hardcoded username)
log "Setting correct permissions..."
sudo chown -R $(whoami):$(whoami) $APP_DIR/uploads || { log "Failed to set permissions on uploads directory"; exit 1; }
sudo chown -R $(whoami):$(whoami) $APP_DIR/frontend/build || { log "Failed to set permissions on frontend build directory"; exit 1; }

# Restart the backend service
log "Restarting backend service..."
cd $APP_DIR || { log "Failed to navigate to application directory"; exit 1; }
pm2 restart katmon-backend || pm2 start backend/server.js --name katmon-backend || { log "Failed to start/restart backend"; exit 1; }

# Reload nginx
log "Reloading Nginx..."
sudo systemctl reload nginx || { log "Failed to reload Nginx"; exit 1; }

# Add a timestamp to indicate successful deployment
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo $TIMESTAMP > $APP_DIR/last_deploy.txt

log "Deployment completed successfully!"