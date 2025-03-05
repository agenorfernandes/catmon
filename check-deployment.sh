#!/bin/bash

# KatMon Deployment Check Script

# Set environment variables
export PATH=$PATH:/usr/local/bin:/home/ubuntu/.nvm/versions/node/v18.16.0/bin

# Application directory
APP_DIR="/var/www/katmon"

# Log file
LOG_FILE="$APP_DIR/deployment-check.log"

# Function for timestamped logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print start message
log "Starting KatMon deployment check..."

# Check if backend is running
log "Checking backend service status..."
if pm2 list | grep -q "katmon-backend"; then
  log "✅ Backend service is running"
else
  log "❌ Backend service is NOT running"
fi

# Check if frontend build exists
log "Checking frontend build..."
if [ -d "$APP_DIR/frontend/build" ]; then
  log "✅ Frontend build directory exists"
else
  log "❌ Frontend build directory does NOT exist"
fi

# Check Nginx configuration
log "Checking Nginx configuration..."
if sudo nginx -t; then
  log "✅ Nginx configuration is valid"
else
  log "❌ Nginx configuration has errors"
fi

# Check if Nginx is running
log "Checking Nginx service status..."
if systemctl is-active --quiet nginx; then
  log "✅ Nginx service is running"
else
  log "❌ Nginx service is NOT running"
fi

# Check API health
log "Checking API health..."
if curl -s https://catmon.com.br/api/health | grep -q "ok"; then
  log "✅ API health check passed"
else
  log "❌ API health check failed"
fi

# Check Frontend
log "Checking frontend..."
if curl -s https://catmon.com.br | grep -q "KatMon"; then
  log "✅ Frontend check passed"
else
  log "❌ Frontend check failed"
fi

# Check for common errors in logs
log "Checking for errors in logs..."
recent_errors=$(grep -i "error\|exception" /var/log/nginx/error.log $APP_DIR/backend/logs/error.log 2>/dev/null | tail -20)
if [ -n "$recent_errors" ]; then
  log "⚠️ Recent errors found:"
  echo "$recent_errors" | tee -a "$LOG_FILE"
else
  log "✅ No recent errors found in logs"
fi

log "Deployment check completed."
