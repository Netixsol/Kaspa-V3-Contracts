#!/bin/bash

# Foundry Setup Validation Script
# This script validates that everything is properly set up for deployment
# Usage: ./validate-setup.sh [network]

set -e
source .env
NETWORK=${1:-kasplex_testnet}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}=== Kaspa V3 Setup Validation ===${NC}"
echo "Network: $NETWORK"
echo ""

ERRORS=0
WARNINGS=0

# Function to check and report
check_requirement() {
    local name="$1"
    local command="$2"
    local error_msg="$3"
    local warning_msg="$4"
    
    printf "%-30s " "$name:"
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        if [ -n "$error_msg" ]; then
            echo -e "${RED}✗ FAIL${NC} - $error_msg"
            ((ERRORS++))
            return 1
        else
            echo -e "${YELLOW}⚠ WARNING${NC} - $warning_msg"
            ((WARNINGS++))
            return 2
        fi
    fi
}

echo -e "${BLUE}=== Checking System Requirements ===${NC}"

# Check Foundry installation
check_requirement "Foundry (forge)" "command -v forge" "Foundry not installed. Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"

check_requirement "Foundry (cast)" "command -v cast" "Foundry cast not available. Run: foundryup"

# Check Git
check_requirement "Git" "command -v git" "Git not installed. Required for dependency management"

# Check environment variables
check_requirement "PRIVATE_KEY" '[ -n "$PRIVATE_KEY" ]' "Private key not set. Export with: export PRIVATE_KEY=your_key"

echo ""
echo -e "${BLUE}=== Checking Project Structure ===${NC}"

# Check project directories
PROJECTS=("v3-core" "v3-periphery" "router" "masterchef-v3" "v3-lm-pool")
for project in "${PROJECTS[@]}"; do
    check_requirement "$project directory" "[ -d \"projects/$project\" ]" "Project directory missing"
    check_requirement "$project foundry.toml" "[ -f \"projects/$project/foundry.toml\" ]" "Foundry config missing"
    check_requirement "$project script dir" "[ -d \"projects/$project/script\" ]" "Script directory missing"
done

echo ""
echo -e "${BLUE}=== Checking Dependencies ===${NC}"

for project in "${PROJECTS[@]}"; do
    if [ -d "projects/$project" ]; then
        cd "projects/$project"
        check_requirement "$project forge-std" "[ -d \"lib/forge-std\" ] || [ -d \"node_modules/forge-std\" ]" "" "forge-std not installed, run setup-foundry.sh"
        cd ../..
    fi
done

echo ""
echo -e "${BLUE}=== Checking Network Configuration ===${NC}"

# Check network connectivity
case $NETWORK in
    "kasplex_testnet"|"kasplexTestnet")
        RPC_URL="https://rpc.kasplextest.xyz"
        ;;
    "kasplex_mainnet"|"kasplexMainnet") 
        RPC_URL="https://rpc.kasplextest.xyz"
        ;;
    *)
        echo -e "${YELLOW}Unknown network: $NETWORK${NC}"
        RPC_URL=""
        ;;
esac

if [ -n "$RPC_URL" ]; then
    check_requirement "Network connectivity" "cast block-number --rpc-url \"$RPC_URL\"" "Cannot connect to $RPC_URL" ""
fi

echo ""
echo -e "${BLUE}=== Checking Compilation ===${NC}"

for project in "${PROJECTS[@]}"; do
    if [ -d "projects/$project" ]; then
        cd "projects/$project"
        printf "%-30s " "$project compilation:"
        if forge build >/dev/null 2>&1; then
            echo -e "${GREEN}✓ OK${NC}"
        else
            echo -e "${YELLOW}⚠ WARNING${NC} - Compilation issues (may be normal)"
            ((WARNINGS++))
        fi
        cd ../..
    fi
done

echo ""
echo -e "${BLUE}=== Deployment Readiness ===${NC}"

# Check deployment scripts
check_requirement "deploy-dex.sh" "[ -f \"deploy-dex.sh\" ] && [ -x \"deploy-dex.sh\" ]" "DEX deployment script missing or not executable"
check_requirement "deploy-all.sh" "[ -f \"deploy-all.sh\" ] && [ -x \"deploy-all.sh\" ]" "Full deployment script missing or not executable"
check_requirement "query-contracts.sh" "[ -f \"query-contracts.sh\" ] && [ -x \"query-contracts.sh\" ]" "" "Contract query script missing"

# Check for existing deployments
REGISTRY_FILE="logs/deployments/${NETWORK}/.registry_address"
if [ -f "$REGISTRY_FILE" ]; then
    source "$REGISTRY_FILE"
    printf "%-30s " "Existing deployment:"
    if cast call "$REGISTRY_ADDRESS" "owner()" --rpc-url "$NETWORK" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Found (Registry: ${REGISTRY_ADDRESS:0:10}...)${NC}"
    else
        echo -e "${YELLOW}⚠ Stale${NC} - Registry file exists but registry not accessible"
        ((WARNINGS++))
    fi
else
    printf "%-30s " "Existing deployment:"
    echo -e "${BLUE}ℹ None${NC} - Fresh deployment"
fi

echo ""
echo -e "${BLUE}=== Validation Summary ===${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Deploy DEX only: ./deploy-dex.sh $NETWORK"
    echo "2. Deploy everything: ./deploy-all.sh $NETWORK"
    echo "3. Query contracts: ./query-contracts.sh $NETWORK"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with $WARNINGS warnings.${NC}"
    echo -e "${BLUE}You can proceed with deployment, but consider addressing warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ Setup incomplete! Found $ERRORS errors and $WARNINGS warnings.${NC}"
    echo ""
    echo -e "${YELLOW}Fix the errors above before proceeding with deployment.${NC}"
    echo ""
    echo -e "${BLUE}Common fixes:${NC}"
    echo "• Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    echo "• Set private key: export PRIVATE_KEY=your_private_key_here"
    echo "• Run setup: ./setup-foundry.sh"
    echo "• Make scripts executable: chmod +x *.sh"
    exit 1
fi
