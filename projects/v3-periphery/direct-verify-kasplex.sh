#!/bin/bash

# Simple Foundry verification script for Kasplex Testnet NFT Position Manager
# This bypasses build issues and attempts direct verification

CONTRACT_ADDRESS="0xD7872B6852aaC662d1343426C3c2ce5Cb1Dc5974"
RPC_URL="https://rpc.kasplextest.xyz"
EXPLORER_API_URL="https://explorer.testnet.kasplextest.xyz/api"
API_KEY="MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J"

echo "=== Direct Foundry Verification for Kasplex Testnet ==="
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""

# Encoded constructor arguments
CONSTRUCTOR_ARGS="0x000000000000000000000000118da2e86a8935cc8ee05f7844e11173fdf058f1000000000000000000000000b365456e94f3d53661d537a62b06d41aeab50eb4000000000000000000000000d18fcd278f7156daa2a506dbc2a4a15337b91b94000000000000000000000000d9ed9d69c5263d0c82ea63250efe916c85ec313d"

echo "Attempting verification with blockscout verifier..."
forge verify-contract \
    --rpc-url "$RPC_URL" \
    --verifier blockscout \
    --verifier-url "$EXPLORER_API_URL" \
    --constructor-args "$CONSTRUCTOR_ARGS" \
    --compiler-version 0.7.6 \
    --optimizer-runs 1000000 \
    "$CONTRACT_ADDRESS" \
    contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager

RESULT1=$?

if [ $RESULT1 -eq 0 ]; then
    echo "✅ Verification successful with blockscout!"
    exit 0
fi

echo ""
echo "Trying with etherscan verifier..."
forge verify-contract \
    --rpc-url "$RPC_URL" \
    --verifier etherscan \
    --verifier-url "$EXPLORER_API_URL" \
    --etherscan-api-key "$API_KEY" \
    --constructor-args "$CONSTRUCTOR_ARGS" \
    --compiler-version 0.7.6 \
    --optimizer-runs 1000000 \
    "$CONTRACT_ADDRESS" \
    contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager

RESULT2=$?

if [ $RESULT2 -eq 0 ]; then
    echo "✅ Verification successful with etherscan!"
    exit 0
fi

echo ""
echo "❌ Both verification methods failed."
echo "This is expected for new chains not yet supported by Foundry."
echo ""
echo "=== Manual Verification Required ==="
echo "Please use manual verification:"
echo "1. Go to: https://explorer.testnet.kasplextest.xyz"
echo "2. Search: $CONTRACT_ADDRESS"
echo "3. Use web interface with these settings:"
echo "   - Compiler: v0.7.6+commit.7338295f"
echo "   - Optimization: Yes (1000000 runs)"
echo "   - Constructor Args: $CONSTRUCTOR_ARGS"
echo "   - Source: NFTManagerFlatten.sol"
