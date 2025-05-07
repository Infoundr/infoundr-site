#!/bin/bash

echo "Starting deployment to playground..."

# First deployment to get the canister ID
echo "Performing initial deployment..."
dfx deploy --playground

# Get the backend canister ID
CANISTER_ID=$(dfx canister --playground id backend)
echo "Retrieved canister ID: $CANISTER_ID"

# Update config.ts with the new canister ID
echo "Updating config.ts with new canister ID..."
sed -i '' "s/export const LOCAL_CANISTER_ID = '.*'/export const LOCAL_CANISTER_ID = '$CANISTER_ID'/" src/frontend/src/config.ts
sed -i '' "s/export const MAINNET_CANISTER_ID = '.*'/\/\/ export const MAINNET_CANISTER_ID = '$CANISTER_ID'/" src/frontend/src/config.ts
sed -i '' "s/\/\/ export const LOCAL_CANISTER_ID/export const LOCAL_CANISTER_ID/" src/frontend/src/config.ts

# Update environment configuration
echo "Updating environment configuration..."
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://ic0.app
VITE_CANISTER_ID=$CANISTER_ID
VITE_AUTH_MODE=backend
EOL

# Second deployment to ensure everything is properly configured
echo "Performing final deployment..."
dfx deploy --playground

echo "Deployment complete and configuration updated!" 