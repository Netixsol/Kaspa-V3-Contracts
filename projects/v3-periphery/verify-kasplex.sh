#!/bin/bash

# Kasplex Testnet Contract Verification Script
# This script manually verifies contracts on Kasplex testnet explorer

CONTRACT_ADDRESS="0xD7872B6852aaC662d1343426C3c2ce5Cb1Dc5974"
CONTRACT_NAME="NonfungiblePositionManager"
COMPILER_VERSION="0.7.6"
OPTIMIZATION_ENABLED="true"
OPTIMIZATION_RUNS="1000000"
EXPLORER_API_KEY="MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J"
EXPLORER_URL="https://explorer.testnet.kasplextest.xyz/api"

# Constructor arguments (ABI encoded)
CONSTRUCTOR_ARGS="0x000000000000000000000000118da2e86a8935cc8ee05f7844e11173fdf058f1000000000000000000000000b365456e94f3d53661d537a62b06d41aeab50eb4000000000000000000000000d18fcd278f7156daa2a506dbc2a4a15337b91b94000000000000000000000000d9ed9d69c5263d0c82ea63250efe916c85ec313d"

echo "=== Kasplex Testnet Contract Verification ==="
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Contract Name: $CONTRACT_NAME"
echo "Compiler Version: $COMPILER_VERSION"
echo "Optimization: $OPTIMIZATION_ENABLED (Runs: $OPTIMIZATION_RUNS)"
echo "Constructor Args: $CONSTRUCTOR_ARGS"
echo ""

# Step 1: Check if we have the flattened contract
if [ ! -f "NFTManagerFlatten.sol" ]; then
    echo "Error: NFTManagerFlatten.sol not found. Please run the flattening command first:"
    echo "yarn hardhat flatten contracts/NonfungiblePositionManager.sol > NFTManagerFlatten.sol"
    exit 1
fi

echo "✓ Flattened contract found: NFTManagerFlatten.sol"

# Step 2: Prepare verification payload
echo ""
echo "=== Manual Verification Steps ==="
echo ""
echo "1. Go to: https://explorer.testnet.kasplextest.xyz"
echo "2. Search for contract: $CONTRACT_ADDRESS"
echo "3. Click on 'Contract' tab"
echo "4. Click 'Verify and Publish'"
echo ""
echo "5. Fill in the verification form with these details:"
echo "   - Contract Address: $CONTRACT_ADDRESS"
echo "   - Contract Name: $CONTRACT_NAME"
echo "   - Compiler Version: v$COMPILER_VERSION+commit.7338295f"
echo "   - Optimization: Enabled"
echo "   - Optimization Runs: $OPTIMIZATION_RUNS"
echo "   - Constructor Arguments: $CONSTRUCTOR_ARGS"
echo ""
echo "6. Upload the flattened source code from: NFTManagerFlatten.sol"
echo ""

# Step 3: Try API verification (if supported)
echo "=== Attempting API Verification ==="
echo ""

# Check if the API supports verification endpoint
API_RESPONSE=$(curl -s -X POST \
  "$EXPLORER_URL?module=contract&action=verifysourcecode" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "apikey=$EXPLORER_API_KEY&module=contract&action=verifysourcecode" \
  --connect-timeout 10 || echo "API_ERROR")

if [[ "$API_RESPONSE" == "API_ERROR" ]]; then
    echo "⚠️  API verification not available or timed out"
    echo "   Please use manual verification through the web interface"
else
    echo "API Response: $API_RESPONSE"
    
    # If API supports verification, prepare the full request
    if [[ "$API_RESPONSE" != *"NOTOK"* ]]; then
        echo ""
        echo "=== API Verification Command ==="
        echo "curl -X POST \\"
        echo "  '$EXPLORER_URL?module=contract&action=verifysourcecode' \\"
        echo "  -H 'Content-Type: application/x-www-form-urlencoded' \\"
        echo "  -d 'apikey=$EXPLORER_API_KEY' \\"
        echo "  -d 'module=contract' \\"
        echo "  -d 'action=verifysourcecode' \\"
        echo "  -d 'contractaddress=$CONTRACT_ADDRESS' \\"
        echo "  -d 'sourceCode=@NFTManagerFlatten.sol' \\"
        echo "  -d 'contractname=$CONTRACT_NAME' \\"
        echo "  -d 'compilerversion=v$COMPILER_VERSION+commit.7338295f' \\"
        echo "  -d 'optimizationUsed=1' \\"
        echo "  -d 'runs=$OPTIMIZATION_RUNS' \\"
        echo "  -d 'constructorArguements=$CONSTRUCTOR_ARGS'"
    fi
fi

echo ""
echo "=== Constructor Parameters Breakdown ==="
echo "deployer (poolDeployer): 0x118dA2E86a8935cc8ee05f7844E11173fdF058F1"
echo "factory: 0xb365456e94F3d53661d537a62b06d41AEAb50EB4"
echo "WETH9 (WKAS): 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94"
echo "tokenDescriptor: 0xD9ed9d69c5263D0C82Ea63250Efe916c85ec313d"
echo ""
echo "=== Verification Complete ==="
