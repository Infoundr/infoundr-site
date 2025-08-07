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

# Pull and setup Internet Identity
printf "\n${GREEN}Setting up Internet Identity...${NC}\n"
dfx deps pull
dfx deps init
dfx deps deploy

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

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS uses BSD sed which requires a backup extension (even if it's empty)
  sed -i '' "s|export const LOCAL_CANISTER_ID = .*|export const LOCAL_CANISTER_ID = '$CANISTER_ID';|" src/frontend/src/config.ts
else
  # Linux (and WSL) uses GNU sed
  sed -i "s|export const LOCAL_CANISTER_ID = .*|export const LOCAL_CANISTER_ID = '$CANISTER_ID';|" src/frontend/src/config.ts
fi

# Set DEV_MODE to false in mockData.ts (use real backend for local development)
echo "🔧 Disabling mock data mode (using real backend)..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|export const DEV_MODE = true;|export const DEV_MODE = false;|" src/frontend/src/mocks/mockData.ts
else
  sed -i "s|export const DEV_MODE = true;|export const DEV_MODE = false;|" src/frontend/src/mocks/mockData.ts
fi

# Create/update .env file for local
echo "📝 Updating local environment configuration..."
ENV_FILE="src/frontend/.env"

# Function to update or add environment variable
update_env_var() {
    local key=$1
    local value=$2
    
    if [ -f "$ENV_FILE" ] && grep -q "^${key}=" "$ENV_FILE"; then
        # Variable exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        fi
    else
        # Variable doesn't exist, add it
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo "Created new .env file"
else
    echo "Updating existing .env file"
fi

# Update or add required environment variables
update_env_var "VITE_DFX_NETWORK" "local"
update_env_var "VITE_IC_HOST" "http://localhost:4943"
update_env_var "VITE_CANISTER_ID" "$CANISTER_ID"
update_env_var "VITE_PLAYGROUND_CANISTER_ID" "$CANISTER_ID"
update_env_var "VITE_AUTH_MODE" "backend"
update_env_var "VITE_ENV_MODE" "local"
update_env_var "VITE_II_URL" "http://127.0.0.1:4943/?canisterId=$CANISTER_ID"

# Setup frontend for deployment
printf "\n${GREEN}Setting up frontend...${NC}\n"
cd src/frontend
npm run dev