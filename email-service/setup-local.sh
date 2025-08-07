#!/bin/bash

# InFoundr Email Service Local Setup Script

set -e

echo "🚀 Setting up InFoundr Email Service for local development..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_status "Please edit .env file with your SendGrid API key and other settings"
    print_warning "You need to set SENDGRID_API_KEY in the .env file"
else
    print_status ".env file already exists"
fi

# Check if SendGrid API key is set
if ! grep -q "SENDGRID_API_KEY=" .env || grep -q "SENDGRID_API_KEY=your_sendgrid_api_key_here" .env; then
    print_warning "Please set your SendGrid API key in the .env file"
    print_status "You can get a free SendGrid API key from: https://sendgrid.com/"
else
    print_status "SendGrid API key is configured"
fi

print_status "Setup completed!"
echo ""
print_status "Next steps:"
echo "  1. Edit .env file with your SendGrid API key"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Run 'npm test' to test the email service"
echo "  4. The service will be available at http://localhost:5005"
echo ""
print_status "Useful commands:"
echo "  - Start dev server: npm run dev"
echo "  - Test email service: npm test"
echo "  - Health check: curl http://localhost:5005/health"
echo "  - Test endpoint: curl http://localhost:5005/test?email=your-email@example.com" 