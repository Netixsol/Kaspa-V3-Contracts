#!/bin/bash

# Query Deployed Contracts Script
# This script queries all deployed contracts from the registry
# Usage: ./query-contracts.sh [network] [registry_address]

set -e
source .env

NETWORK=${1:-kasplex_testnet}
REGISTRY_ADDRESS=${2}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}=== Kaspa V3 Contract Query ===${NC}"
echo "Network: $NETWORK"

# Try to get registry address from file if not provided
if [ -z "$REGISTRY_ADDRESS" ]; then
    REGISTRY_FILE="logs/deployments/${NETWORK}/.registry_address"
    if [ -f "$REGISTRY_FILE" ]; then
        source "$REGISTRY_FILE"
        echo "Registry Address: $REGISTRY_ADDRESS (from file)"
    else
        echo -e "${RED}Error: Registry address not provided and no registry file found${NC}"
        echo "Usage: ./query-contracts.sh [network] [registry_address]"
        echo "Or ensure logs/deployments/${NETWORK}/.registry_address file exists"
        exit 1
    fi
else
    echo "Registry Address: $REGISTRY_ADDRESS (provided)"
fi

echo ""

# Function to query and display contract address
query_contract() {
    local contract_name="$1"
    local address=$(cast call "$REGISTRY_ADDRESS" "getContract(string,string)" "$NETWORK" "$contract_name" \
        --rpc-url "$NETWORK" 2>/dev/null | sed 's/0x000000000000000000000000/0x/' | sed 's/^0x0*/0x/')
    
    if [ "$address" != "0x" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        printf "%-35s %s\n" "$contract_name:" "$address"
        return 0
    else
        printf "%-35s %s\n" "$contract_name:" "${RED}Not deployed${NC}"
        return 1
    fi
}

echo -e "${BLUE}=== Core V3 Contracts ===${NC}"
query_contract "KaspaV3Factory"
query_contract "KaspaV3PoolDeployer"
echo ""

echo -e "${BLUE}=== V3 Periphery Contracts ===${NC}"
query_contract "SwapRouter"
query_contract "NFTDescriptor"
query_contract "NFTDescriptorEx"
query_contract "NonfungibleTokenPositionDescriptor"
query_contract "NonfungiblePositionManager"
query_contract "QuoterV2"
query_contract "TickLens"
echo ""

echo -e "${BLUE}=== Router Contracts ===${NC}"
query_contract "SmartRouterHelper"
query_contract "SmartRouter"
echo ""

echo -e "${BLUE}=== Farming Contracts ===${NC}"
query_contract "MasterChefV3"
query_contract "KaspaV3LmPoolDeployer"
echo ""

# Generate JSON output
echo -e "${BLUE}=== Generating JSON Export ===${NC}"
OUTPUT_FILE="deployed_contracts_${NETWORK}_$(date +%Y%m%d_%H%M%S).json"

cat > "$OUTPUT_FILE" << EOF
{
  "network": "$NETWORK",
  "registryAddress": "$REGISTRY_ADDRESS",
  "queryDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
EOF

# Core contracts
echo '    "core": {' >> "$OUTPUT_FILE"
for contract in "KaspaV3Factory" "KaspaV3PoolDeployer"; do
    address=$(cast call "$REGISTRY_ADDRESS" "getContract(string,string)" "$NETWORK" "$contract" \
        --rpc-url "$NETWORK" 2>/dev/null | sed 's/0x000000000000000000000000/0x/' | sed 's/^0x0*/0x/')
    if [ "$address" != "0x" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        echo "      \"$contract\": \"$address\"," >> "$OUTPUT_FILE"
    fi
done
sed -i '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || sed -i '' '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || true
echo '    },' >> "$OUTPUT_FILE"

# Periphery contracts
echo '    "periphery": {' >> "$OUTPUT_FILE"
for contract in "SwapRouter" "NonfungiblePositionManager" "NonfungibleTokenPositionDescriptor" "NFTDescriptor" "NFTDescriptorEx" "V3Migrator" "QuoterV2" "TickLens"; do
    address=$(cast call "$REGISTRY_ADDRESS" "getContract(string,string)" "$NETWORK" "$contract" \
        --rpc-url "$NETWORK" 2>/dev/null | sed 's/0x000000000000000000000000/0x/' | sed 's/^0x0*/0x/')
    if [ "$address" != "0x" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        echo "      \"$contract\": \"$address\"," >> "$OUTPUT_FILE"
    fi
done
sed -i '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || sed -i '' '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || true
echo '    },' >> "$OUTPUT_FILE"

# Router contracts
echo '    "router": {' >> "$OUTPUT_FILE"
for contract in "SmartRouter" "SmartRouterHelper"; do
    address=$(cast call "$REGISTRY_ADDRESS" "getContract(string,string)" "$NETWORK" "$contract" \
        --rpc-url "$NETWORK" 2>/dev/null | sed 's/0x000000000000000000000000/0x/' | sed 's/^0x0*/0x/')
    if [ "$address" != "0x" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        echo "      \"$contract\": \"$address\"," >> "$OUTPUT_FILE"
    fi
done
sed -i '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || sed -i '' '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || true
echo '    },' >> "$OUTPUT_FILE"

# Farming contracts
echo '    "farming": {' >> "$OUTPUT_FILE"
for contract in "MasterChefV3" "KaspaV3LmPoolDeployer"; do
    address=$(cast call "$REGISTRY_ADDRESS" "getContract(string,string)" "$NETWORK" "$contract" \
        --rpc-url "$NETWORK" 2>/dev/null | sed 's/0x000000000000000000000000/0x/' | sed 's/^0x0*/0x/')
    if [ "$address" != "0x" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        echo "      \"$contract\": \"$address\"," >> "$OUTPUT_FILE"
    fi
done
sed -i '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || sed -i '' '$ s/,$//' "$OUTPUT_FILE" 2>/dev/null || true
echo '    }' >> "$OUTPUT_FILE"

echo '  }' >> "$OUTPUT_FILE"
echo '}' >> "$OUTPUT_FILE"

echo -e "${GREEN}Contract addresses exported to: $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}To use this data in your applications:${NC}"
echo "1. Import the JSON file into your frontend/backend"
echo "2. Use the addresses to interact with the contracts"
echo "3. Update your configuration files with these addresses"
