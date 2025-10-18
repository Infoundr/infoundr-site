#!/bin/bash

echo "🚀 Starting mainnet deployment..."

# Deploy to mainnet
echo "📦 Deploying canisters to mainnet..."
dfx deploy --network ic

# Get the mainnet canister ID
CANISTER_ID=$(dfx canister --network ic id backend)
echo "📝 Mainnet canister ID: $CANISTER_ID"

# Update config.ts with mainnet settings
echo "⚙️ Updating configuration for mainnet..."
sed -i '' "s|export const MAINNET_CANISTER_ID = \".*\";|export const MAINNET_CANISTER_ID = \"$CANISTER_ID\";|" src/frontend/src/config.ts

# Set DEV_MODE to false in mockData.ts
echo "🔧 Disabling development mode..."
sed -i '' "s|export const DEV_MODE = true;|export const DEV_MODE = false;|" src/frontend/src/mocks/mockData.ts

# Create/update .env file for mainnet
echo "📝 Creating mainnet environment configuration..."
cat > src/frontend/.env << EOL
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://icp0.io
VITE_CANISTER_ID=$CANISTER_ID
VITE_AUTH_MODE=backend
VITE_ENV_MODE=mainnet
EOL

# Update config.ts to use mainnet mode
sed -i '' "s|mode: import.meta.env.VITE_ENV_MODE || 'local'|mode: 'mainnet'|" src/frontend/src/config.ts
sed -i '' "s|authMode: import.meta.env.VITE_AUTH_MODE || 'backend'|authMode: 'backend'|" src/frontend/src/config.ts

# Configure payment system if environment variables are set
if [ ! -z "$PAYSTACK_PUBLIC_KEY" ] && [ ! -z "$PAYSTACK_SECRET_KEY" ]; then
    echo "💳 Configuring payment system..."
    ./scripts/configure-payment.sh
else
    echo "⚠️  Skipping payment configuration (PAYSTACK_PUBLIC_KEY or PAYSTACK_SECRET_KEY not set)"
    echo "💡 To configure payments manually, run:"
    echo "   PAYSTACK_PUBLIC_KEY=your_key PAYSTACK_SECRET_KEY=your_secret ./scripts/configure-payment.sh"
fi

echo "✅ Mainnet deployment complete!"
echo "🔗 Your application is now live on mainnet!"
echo "📝 Canister ID: $CANISTER_ID" 