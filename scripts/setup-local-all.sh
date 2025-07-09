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

# Set DEV_MODE to true in mockData.ts (already set to true, but let's ensure it)
echo "🔧 Ensuring development mode is enabled..."
sed -i '' "s|export const DEV_MODE = false;|export const DEV_MODE = true;|" src/frontend/src/mocks/mockData.ts

# Update config.ts to use local mode
echo "⚙️ Configuration updated for local development..."

# Setup frontend for deployment
printf "\n${GREEN}Setting up frontend...${NC}\n"
cd src/frontend
npm run dev