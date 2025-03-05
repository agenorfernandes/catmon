#!/bin/bash

# KatMon Deployment Check Script

# Detect script location and set APP_DIR accordingly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
APP_DIR="$( dirname "$SCRIPT_DIR" )"  # Assume script is in a subdirectory of the app

# Set environment variables
export PATH=$PATH:/usr/local/bin:$HOME/.nvm/versions/node/v18.16.0/bin

# Log file
LOG_FILE="$APP_DIR/deployment-check.log"

# Function for timestamped logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print start message and environment info
log "Starting KatMon deployment check..."
log "Detected application directory: $APP_DIR"

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
recent_errors=$(grep -i "error\|exception" /var/log/nginx/error.log 2>/dev/null | tail -20)
if [ -n "$recent_errors" ]; then
  log "⚠️ Recent errors found in Nginx logs:"
  echo "$recent_errors" | tee -a "$LOG_FILE"
else
  log "✅ No recent errors found in Nginx logs"
fi

# Also check PM2 logs
log "Checking PM2 logs for errors..."
pm2_errors=$(pm2 logs --lines 100 katmon-backend 2>&1 | grep -i "error\|exception" | tail -20)
if [ -n "$pm2_errors" ]; then
  log "⚠️ Recent errors found in PM2 logs:"
  echo "$pm2_errors" | tee -a "$LOG_FILE"
else
  log "✅ No recent errors found in PM2 logs"
fi

log "Deployment check completed."