#!/bin/bash

# Payment Configuration Script
# This script configures the payment system with Paystack credentials

set -e

echo "💳 Configuring payment system..."

# Check if required environment variables are set
if [ -z "$PAYSTACK_PUBLIC_KEY" ]; then
    echo "❌ Error: PAYSTACK_PUBLIC_KEY environment variable is not set"
    exit 1
fi

if [ -z "$PAYSTACK_SECRET_KEY" ]; then
    echo "❌ Error: PAYSTACK_SECRET_KEY environment variable is not set"
    exit 1
fi

# Set default environment to live
PAYSTACK_ENVIRONMENT=${PAYSTACK_ENVIRONMENT:-"Live"}
echo "🌍 Paystack environment: $PAYSTACK_ENVIRONMENT"

# Get the canister ID
CANISTER_ID=$(dfx canister --network ic id backend)
echo "📝 Backend canister ID: $CANISTER_ID"

# Set up identity from IC_IDENTITY if provided
if [ -n "$IC_IDENTITY" ]; then
    echo "🔑 Setting up identity from IC_IDENTITY..."
    if ! dfx identity list | grep -q "deploy_identity"; then
        echo "$IC_IDENTITY" | base64 --decode > deploy_identity.pem
        dfx identity import --storage-mode=plaintext deploy_identity deploy_identity.pem
    fi
    dfx identity use deploy_identity
fi

# Check current identity
echo "🔑 Current identity: $(dfx identity whoami)"
echo "🔍 Available identities:"
dfx identity list

# Configure payment system
echo "🔧 Setting up Paystack configuration..."

# Create the payment configuration payload in Candid format
PAYMENT_CONFIG=$(cat << EOF
(
  record {
    public_key = "$PAYSTACK_PUBLIC_KEY";
    secret_key = "$PAYSTACK_SECRET_KEY";
    environment = variant { $PAYSTACK_ENVIRONMENT };
  },
)
EOF
)

# Call the payment_set_config function
echo "📡 Calling payment_set_config..."
RESULT=$(dfx canister --network ic call backend payment_set_config "$PAYMENT_CONFIG" --identity deploy_identity 2>&1 || true)

if [[ $RESULT == *"Unauthorized"* ]]; then
    echo "❌ Error: Unauthorized access. Make sure you're using the correct identity."
    echo "💡 The payment_set_config function is restricted to the authorized principal:"
    echo "   5mqc2-eelsb-rpsbu-tvroe-paiy3-c4wo3-4xl6q-7nelg-gprk3-rkq46-mqe"
    exit 1
elif [[ $RESULT == *"updated successfully"* ]]; then
    echo "✅ Payment configuration updated successfully!"
else
    echo "⚠️  Unexpected response: $RESULT"
    echo "🔍 This might be normal if the configuration was already set."
fi

# Verify the configuration was set correctly
echo "🔍 Verifying payment configuration..."
CONFIG_RESPONSE=$(dfx canister --network ic call backend payment_get_config --identity deploy_identity 2>/dev/null || echo "Error getting config")

if [[ $CONFIG_RESPONSE == *"$PAYSTACK_PUBLIC_KEY"* ]]; then
    echo "✅ Payment configuration verified successfully!"
    echo "📋 Public key: $PAYSTACK_PUBLIC_KEY"
    echo "🔒 Secret key: ***HIDDEN***"
else
    echo "⚠️  Could not verify payment configuration"
    echo "Response: $CONFIG_RESPONSE"
fi

echo "🎉 Payment system configuration complete!"
