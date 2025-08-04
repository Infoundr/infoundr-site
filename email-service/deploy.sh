#!/bin/bash

# InFoundr Email Service Deployment Script for Contabo
# This script deploys the email service to a Contabo server

set -e

echo "🚀 Starting InFoundr Email Service deployment..."

# Configuration
SERVICE_NAME="infoundr-email-service"
SERVICE_PORT="3002"
PM2_APP_NAME="infoundr-email"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (commented out for server deployment)
# if [ "$EUID" -eq 0 ]; then
#     print_error "Please don't run this script as root"
#     exit 1
# fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create one based on env.example"
    exit 1
fi

# Check if SENDGRID_API_KEY is set
if ! grep -q "SENDGRID_API_KEY=" .env || grep -q "SENDGRID_API_KEY=your_sendgrid_api_key_here" .env; then
    print_error "Please set your SendGrid API key in the .env file"
    exit 1
fi

# Check if API_KEY is set
if ! grep -q "API_KEY=" .env || grep -q "API_KEY=your_secure_api_key_here" .env; then
    print_error "Please set your API key in the .env file"
    exit 1
fi

print_status "Installing dependencies..."
npm install --production

print_status "Checking if PM2 is installed..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

print_status "Stopping existing service if running..."
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true

print_status "Starting email service with PM2..."
pm2 start server.js --name $PM2_APP_NAME --env production

print_status "Saving PM2 configuration..."
pm2 save

print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Checking service status..."
pm2 status

print_status "Testing email service..."
sleep 3
if curl -f http://localhost:$SERVICE_PORT/health > /dev/null 2>&1; then
    print_status "✅ Email service is running successfully!"
    print_status "Health check endpoint: http://localhost:$SERVICE_PORT/health"
    print_status "Test endpoint: http://localhost:$SERVICE_PORT/test?email=your-email@example.com"
else
    print_error "❌ Email service failed to start properly"
    print_status "Check logs with: pm2 logs $PM2_APP_NAME"
    exit 1
fi

print_status "Setting up Nginx configuration (if needed)..."
if command -v nginx &> /dev/null; then
    cat > /tmp/infoundr-email-nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    location / {
        proxy_pass http://localhost:$SERVICE_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    print_warning "Nginx configuration created at /tmp/infoundr-email-nginx.conf"
    print_warning "Please review and copy it to your Nginx sites-available directory"
fi

print_status "Setting up firewall rules..."
if command -v ufw &> /dev/null; then
    sudo ufw allow $SERVICE_PORT/tcp
    print_status "Firewall rule added for port $SERVICE_PORT"
fi

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
print_status "Useful commands:"
echo "  - View logs: pm2 logs $PM2_APP_NAME"
echo "  - Restart service: pm2 restart $PM2_APP_NAME"
echo "  - Stop service: pm2 stop $PM2_APP_NAME"
echo "  - Monitor: pm2 monit"
echo ""
print_status "Service endpoints:"
echo "  - Health check: http://localhost:$SERVICE_PORT/health"
echo "  - Send startup invite: POST http://localhost:$SERVICE_PORT/send-startup-invite"
echo "  - Send welcome email: POST http://localhost:$SERVICE_PORT/send-welcome-email"
echo "  - Test email: GET http://localhost:$SERVICE_PORT/test?email=test@example.com"
echo ""
print_warning "Remember to:"
echo "  1. Update your domain DNS to point to this server"
echo "  2. Configure SSL certificate with Let's Encrypt"
echo "  3. Update the frontend configuration to use this email service URL" 