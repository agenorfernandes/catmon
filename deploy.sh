#!/bin/bash

# KatMon Simplified Deployment Script

# Detect script location and set APP_DIR accordingly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
APP_DIR="$( dirname "$SCRIPT_DIR" )"  # Assume script is in a subdirectory of the app

# Set environment variables
export PATH=$PATH:/usr/local/bin:$HOME/.nvm/versions/node/v18.16.0/bin

# Log file
LOG_FILE="$APP_DIR/deploy.log"

# Function for timestamped logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print start message and environment info
log "Starting KatMon services..."
log "Detected application directory: $APP_DIR"
log "Running as user: $(whoami)"

# Ensure uploads directory exists
log "Ensuring uploads directory exists..."
mkdir -p $APP_DIR/uploads/cats $APP_DIR/uploads/profiles $APP_DIR/uploads/checkins || { log "Failed to create uploads directories"; exit 1; }

# Set proper permissions
log "Setting correct permissions..."
sudo chown -R $(whoami):$(whoami) $APP_DIR/uploads || { log "Failed to set permissions on uploads directory"; exit 1; }

# Restart the backend service
log "Starting/restarting backend service..."
cd $APP_DIR/backend || { log "Failed to navigate to backend directory"; exit 1; }
pm2 restart katmon-backend || pm2 start server.js --name katmon-backend || { log "Failed to start/restart backend"; exit 1; }

# Restart the frontend service (in development mode)
log "Starting/restarting frontend service in development mode..."
cd $APP_DIR/frontend || { log "Failed to navigate to frontend directory"; exit 1; }
# Detect OS for proper start command
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows system
  log "Detected Windows system, using Windows-specific start command"
  pm2 restart katmon-frontend || pm2 start --name katmon-frontend npm -- run start-windows || { log "Failed to start/restart frontend"; exit 1; }
else
  # Unix-like system (Linux, macOS)
  log "Detected Unix-like system, using standard start command"
  pm2 restart katmon-frontend || pm2 start --name katmon-frontend npm -- run start || { log "Failed to start/restart frontend"; exit 1; }
fi

# Reload nginx
log "Reloading Nginx..."
sudo systemctl reload nginx || { log "Failed to reload Nginx"; exit 1; }

# Add a timestamp to indicate successful deployment
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo $TIMESTAMP > $APP_DIR/last_startup.txt

log "Services started successfully!"
log "PM2 process status:"
pm2 list

# Check if services are running
if pm2 show katmon-backend >/dev/null 2>&1 && pm2 show katmon-frontend >/dev/null 2>&1; then
  log "All services running properly."
else
  log "WARNING: Some services may have failed to start. Check logs for details."
  exit 1
fi