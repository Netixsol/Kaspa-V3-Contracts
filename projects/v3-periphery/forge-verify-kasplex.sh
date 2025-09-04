#!/bin/bash

# Custom Foundry Verification for Kasplex Testnet
# Since Kasplex is not in Foundry's chain registry, we need to use custom configuration

CONTRACT_ADDRESS="0xD7872B6852aaC662d1343426C3c2ce5Cb1Dc5974"
RPC_URL="https://rpc.kasplextest.xyz"
CHAIN_ID="167012"
EXPLORER_API_URL="https://explorer.testnet.kasplextest.xyz/api"
API_KEY="MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J"

echo "=== Custom Foundry Verification for Kasplex Testnet ==="
echo ""

# Step 1: Build the contract first
echo "1. Building contracts..."
forge build --use 0.7.6 --skip test --skip script

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix compilation errors first."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Try verification with custom parameters
echo "2. Attempting verification..."
echo ""

# Method 1: Direct forge verify-contract with explicit parameters
echo "Method 1: Direct Foundry verification"
forge verify-contract \
    --rpc-url "$RPC_URL" \
    --verifier blockscout \
    --verifier-url "$EXPLORER_API_URL" \
    --constructor-args $(cast abi-encode "constructor(address,address,address,address)" \
        0x118dA2E86a8935cc8ee05f7844E11173fdF058F1 \
        0xb365456e94f3d53661d537a62b06d41AEAb50EB4 \
        0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94 \
        0xD9ed9d69c5263D0C82Ea63250Efe916c85ec313d) \
    --compiler-version 0.7.6 \
    --optimizer-runs 1000000 \
    "$CONTRACT_ADDRESS" \
    contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager

RESULT1=$?

if [ $RESULT1 -eq 0 ]; then
    echo "✅ Verification successful with Method 1!"
    exit 0
fi

echo "⚠️ Method 1 failed, trying Method 2..."
echo ""

# Method 2: Try with etherscan verifier (some custom chains support this)
echo "Method 2: Etherscan-compatible verification"
forge verify-contract \
    --rpc-url "$RPC_URL" \
    --verifier etherscan \
    --verifier-url "$EXPLORER_API_URL" \
    --etherscan-api-key "$API_KEY" \
    --constructor-args $(cast abi-encode "constructor(address,address,address,address)" \
        0x118dA2E86a8935cc8ee05f7844E11173fdF058F1 \
        0xb365456e94f3d53661d537a62b06d41AEAb50EB4 \
        0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94 \
        0xD9ed9d69c5263D0C82Ea63250Efe916c85ec313d) \
    --compiler-version 0.7.6 \
    --optimizer-runs 1000000 \
    "$CONTRACT_ADDRESS" \
    contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager

RESULT2=$?

if [ $RESULT2 -eq 0 ]; then
    echo "✅ Verification successful with Method 2!"
    exit 0
fi

echo "❌ Both automated methods failed."
echo ""
echo "=== Fallback: Manual Verification Required ==="
echo ""
echo "Since Kasplex Testnet is a new chain, automated verification may not be supported."
echo "Please use the manual verification script instead:"
echo ""
echo "./verify-kasplex.sh"
echo ""
echo "Or follow these steps:"
echo "1. Go to: https://explorer.testnet.kasplextest.xyz"
echo "2. Search for contract: $CONTRACT_ADDRESS"
echo "3. Use the web interface to verify manually"
echo ""
echo "Required files:"
echo "- Source code: NFTManagerFlatten.sol (already generated)"
echo "- Constructor args: see verify-kasplex.sh for details"
