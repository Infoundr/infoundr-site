#!/bin/bash

echo "Setting up local development environment..."

# Create or update .env file for local development
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=local
VITE_IC_HOST=http://localhost:4943
VITE_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
VITE_AUTH_MODE=mock
VITE_USE_MOCK_DATA=true
EOL

# Update config.ts for local development
sed -i '' "s/export const ENV = {.*}/export const ENV = { mode: 'local', authMode: 'mock' }/" src/frontend/src/config.ts

echo "Local development environment configured with mock authentication and mock data!" 