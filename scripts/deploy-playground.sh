#!/bin/bash

echo "🚀 Starting playground deployment..."

# Generate the candid interface
echo "Generating candid interface..."
npx generate-did backend

# First deployment to get the canister ID
echo "Performing initial deployment..."
dfx deploy --playground

# Get the backend canister ID
CANISTER_ID=$(dfx canister --playground id backend)
echo "Retrieved canister ID: $CANISTER_ID"

# Update config.ts with the new playground canister ID
echo "Updating config.ts with new playground canister ID..."
sed -i '' "s|export const PLAYGROUND_CANISTER_ID = .*|export const PLAYGROUND_CANISTER_ID = '$CANISTER_ID';|" src/frontend/src/config.ts

# Set DEV_MODE to false in mockData.ts
echo "🔧 Disabling development mode..."
sed -i '' "s|export const DEV_MODE = true;|export const DEV_MODE = false;|" src/frontend/src/mocks/mockData.ts

# Create/update .env file for playground
echo "📝 Creating playground environment configuration..."
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://icp0.io
VITE_CANISTER_ID=$CANISTER_ID
VITE_PLAYGROUND_CANISTER_ID=$CANISTER_ID
VITE_AUTH_MODE=backend
VITE_ENV_MODE=playground
EOL

# Second deployment to ensure everything is properly configured
echo "Performing final deployment..."
dfx deploy --playground

echo "Deployment complete and configuration updated!" 