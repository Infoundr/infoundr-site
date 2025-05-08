#!/bin/bash

echo "🚀 Setting up local development environment..."

# Create/update .env file for local development
echo "📝 Creating local environment configuration..."
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=local
VITE_IC_HOST=http://localhost:4943
VITE_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
VITE_AUTH_MODE=mock
VITE_USE_MOCK_DATA=true
EOL

# Set DEV_MODE to true in mockData.ts
echo "🔧 Enabling development mode..."
sed -i '' "s|export const DEV_MODE = false;|export const DEV_MODE = true;|" src/frontend/src/mocks/mockData.ts

# Update config.ts to use local mode
echo "⚙️ Updating configuration for local development..."
sed -i '' "s|mode: import.meta.env.VITE_ENV_MODE || 'local'|mode: 'local'|" src/frontend/src/config.ts
sed -i '' "s|authMode: import.meta.env.VITE_AUTH_MODE || 'backend'|authMode: 'mock'|" src/frontend/src/config.ts

echo "✅ Local development environment configured with mock authentication and mock data!" 