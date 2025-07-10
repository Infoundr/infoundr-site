#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN=$(printf '\033[32m')
RED=$(printf '\033[31m')
NC=$(printf '\033[0m')

# Function to handle errors
handle_error() {
    printf "\n${RED}Error: Setup failed${NC}\n"
    exit 1
}

# Set up error handling
trap 'handle_error' ERR

printf "${GREEN}Setting up...${NC}\n"

# Generate candid file for backend
printf "\n${GREEN}Generating candid file for backend...${NC}\n"
cd src/backend
cargo install generate-did
cargo install candid-extractor
cargo build --target wasm32-unknown-unknown
cd ../../
generate-did backend

# Deploy canisters
printf "\n${GREEN}Deploying canisters...${NC}\n"
dfx deploy

# Generate declarations
printf "\n${GREEN}Generating declarations...${NC}\n"
dfx generate

# Get the backend canister ID
CANISTER_ID=$(dfx canister id backend)
echo "Retrieved canister ID: $CANISTER_ID"

# Update config.ts with the new local canister ID
echo "Updating config.ts with new local canister ID..."
sed -i '' "s|export const LOCAL_CANISTER_ID = .*|export const LOCAL_CANISTER_ID = '$CANISTER_ID';|" src/frontend/src/config.ts

# Set DEV_MODE to false in mockData.ts (use real backend for local development)
echo "🔧 Disabling mock data mode (using real backend)..."
sed -i '' "s|export const DEV_MODE = true;|export const DEV_MODE = false;|" src/frontend/src/mocks/mockData.ts

# Create/update .env file for local
echo "📝 Creating local environment configuration..."
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=local
VITE_IC_HOST=http://localhost:4943
VITE_CANISTER_ID=$CANISTER_ID
VITE_PLAYGROUND_CANISTER_ID=$CANISTER_ID
VITE_AUTH_MODE=backend
VITE_ENV_MODE=local
VITE_II_URL=http://127.0.0.1:4943/?canisterId=$CANISTER_ID
EOL

# Setup frontend for deployment
printf "\n${GREEN}Setting up frontend...${NC}\n"
cd src/frontend
npm run dev