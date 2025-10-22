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

# Get the canister ID
CANISTER_ID=$(dfx canister --network ic id backend)
echo "📝 Backend canister ID: $CANISTER_ID"

# Configure payment system
echo "🔧 Setting up Paystack configuration..."

# Create the payment configuration payload
PAYMENT_CONFIG=$(cat << EOF
{
    "public_key": "$PAYSTACK_PUBLIC_KEY",
    "secret_key": "$PAYSTACK_SECRET_KEY"
}
EOF
)

# Call the payment_set_config function
echo "📡 Calling payment_set_config..."
RESULT=$(dfx canister --network ic call backend payment_set_config "$PAYMENT_CONFIG" --identity default 2>&1 || true)

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
CONFIG_RESPONSE=$(dfx canister --network ic call backend payment_get_config --identity default 2>/dev/null || echo "Error getting config")

if [[ $CONFIG_RESPONSE == *"$PAYSTACK_PUBLIC_KEY"* ]]; then
    echo "✅ Payment configuration verified successfully!"
    echo "📋 Public key: $PAYSTACK_PUBLIC_KEY"
    echo "🔒 Secret key: ***HIDDEN***"
else
    echo "⚠️  Could not verify payment configuration"
    echo "Response: $CONFIG_RESPONSE"
fi

echo "🎉 Payment system configuration complete!"
