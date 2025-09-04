#!/bin/bash

# Deploy All Script
# This script deploys the complete Kaspa V3 ecosystem: DEX + Farming
# Usage: ./deploy-all.sh [network]

set -e
source .env

NETWORK=${1:-kasplex_testnet}

# Set RPC URL based on network
if [ "$NETWORK" = "kasplex_testnet" ]; then
    RPC_URL="https://rpc.kasplextest.xyz"
elif [ "$NETWORK" = "kasplex_mainnet" ]; then
    RPC_URL="https://rpc.kasplextest.xyz"  # Update with mainnet RPC when available
else
    RPC_URL="$NETWORK"  # Allow direct RPC URL input
fi

# Configuration for MasterChef V3
KFC_TOKEN_ADDRESS="0xf87e587AB945F7B111329a6ace6dc497D34f098B"  # This needs to be set for production

# Variables to store deployed addresses
MASTERCHEF_V3_ADDRESS=""
LM_POOL_DEPLOYER_ADDRESS=""
RECEIVER_V2_ADDRESS=""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${GREEN}=== Kaspa V3 Complete Deployment ===${NC}"
echo "Network: $NETWORK"
echo "RPC URL: $RPC_URL"
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY environment variable is not set${NC}"
    echo "Please export your private key: export PRIVATE_KEY=your_private_key_here"
    exit 1
fi

LOG_DIR="logs/deployments/${NETWORK}"
mkdir -p "$LOG_DIR"
DEPLOYMENT_LOG="${LOG_DIR}/full_deployment_${NETWORK}_$(date +%Y%m%d_%H%M%S).log"
DEPLOYMENT_LOG_FROM_PROJECT="../../${LOG_DIR}/full_deployment_${NETWORK}_$(date +%Y%m%d_%H%M%S).log"
echo "Full Deployment started at $(date)" > "$DEPLOYMENT_LOG"

# Function to log messages
log_message() {
    local message="$1"
    echo -e "$message"
    echo -e "$message" >> "$DEPLOYMENT_LOG" 2>/dev/null || true
}

# Function to update contract address in the script file
update_contract_address() {
    local contract_var="$1"
    local contract_address="$2"
    local script_file
    
    # Validate inputs
    if [ -z "$contract_var" ] || [ -z "$contract_address" ]; then
        echo "Warning: Invalid parameters for update_contract_address: var='$contract_var' addr='$contract_address'"
        return 1
    fi
    
    # Clean the address to ensure it's just the address
    contract_address=$(echo "$contract_address" | grep -o "0x[a-fA-F0-9]\{40\}" | head -1)
    if [ -z "$contract_address" ]; then
        echo "Warning: Could not extract valid address from: $2"
        return 1
    fi
    
    # Get the absolute path of the script file
    if [ -f "$0" ]; then
        script_file="$(realpath "$0")"
    else
        # If running from subdirectory, find the script in parent directories
        local current_dir="$(pwd)"
        while [ "$current_dir" != "/" ] && [ "$current_dir" != "" ]; do
            if [ -f "$current_dir/deploy-all.sh" ]; then
                script_file="$current_dir/deploy-all.sh"
                break
            fi
            current_dir="$(dirname "$current_dir")"
        done
    fi
    
    if [ -z "$script_file" ] || [ ! -f "$script_file" ]; then
        echo "Warning: Could not locate script file to update ${contract_var}"
        return 1
    fi
    
    # Create a backup of the script
    cp "$script_file" "${script_file}.backup" 2>/dev/null || true
    
    # Update the address using awk
    awk -v var="$contract_var" -v addr="$contract_address" '
    {
        if ($0 ~ "^" var "=") {
            print var "=\"" addr "\""
        } else {
            print $0
        }
    }' "$script_file" > "${script_file}.tmp" && mv "${script_file}.tmp" "$script_file"
    
    echo "Updated ${contract_var} to ${contract_address} in script"
}

# Function to log messages from project subdirectories
log_from_project_message() {
    local message="$1"
    echo -e "$message"
    echo -e "$message" >> "$DEPLOYMENT_LOG_FROM_PROJECT" 2>/dev/null || true
}

# Function to extract address from forge output
extract_address() {
    local output="$1"
    echo "$output" | grep -o "Deployed to: 0x[a-fA-F0-9]*" | cut -d' ' -f3 | head -1
}

# Function to extract addresses from deploy-dex.sh script
extract_dex_addresses() {
    local dex_script="deploy-dex.sh"
    
    if [ ! -f "$dex_script" ]; then
        log_message "${RED}Error: deploy-dex.sh script not found${NC}"
        return 1
    fi
    
    # Extract addresses from the script variables using more robust extraction
    WKAS=$(grep '^WKAS=' "$dex_script" | head -1 | cut -d'"' -f2)
    POOL_DEPLOYER_ADDRESS=$(grep '^POOL_DEPLOYER_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    FACTORY_ADDRESS=$(grep '^FACTORY_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    SWAP_ROUTER_ADDRESS=$(grep '^SWAP_ROUTER_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    NFT_DESCRIPTOR_ADDRESS=$(grep '^NFT_DESCRIPTOR_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    NFT_DESCRIPTOR_EX_ADDRESS=$(grep '^NFT_DESCRIPTOR_EX_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    POSITION_DESCRIPTOR_ADDRESS=$(grep '^POSITION_DESCRIPTOR_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    POSITION_MANAGER_ADDRESS=$(grep '^POSITION_MANAGER_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    QUOTER_V2_ADDRESS=$(grep '^QUOTER_V2_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    TICK_LENS_ADDRESS=$(grep '^TICK_LENS_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    SMART_ROUTER_HELPER_ADDRESS=$(grep '^SMART_ROUTER_HELPER_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    SMART_ROUTER_ADDRESS=$(grep '^SMART_ROUTER_ADDRESS=' "$dex_script" | head -1 | cut -d'"' -f2)
    
    # Validate critical addresses
    if [ -z "$FACTORY_ADDRESS" ] || [ -z "$POSITION_MANAGER_ADDRESS" ]; then
        log_message "${RED}Error: Critical addresses not found in deploy-dex.sh${NC}"
        log_message "${RED}Factory: '$FACTORY_ADDRESS', Position Manager: '$POSITION_MANAGER_ADDRESS'${NC}"
        return 1
    fi
    
    # Check if addresses are valid (42 characters including 0x)
    if [ ${#FACTORY_ADDRESS} -ne 42 ] || [ ${#POSITION_MANAGER_ADDRESS} -ne 42 ]; then
        log_message "${RED}Error: Invalid address format detected${NC}"
        log_message "${RED}Factory length: ${#FACTORY_ADDRESS}, Position Manager length: ${#POSITION_MANAGER_ADDRESS}${NC}"
        return 1
    fi
    
    log_message "${GREEN}Successfully extracted DEX addresses:${NC}"
    log_message "WKAS: $WKAS"
    log_message "Factory: $FACTORY_ADDRESS"
    log_message "Position Manager: $POSITION_MANAGER_ADDRESS"
    log_message "Pool Deployer: $POOL_DEPLOYER_ADDRESS"
    
    return 0
}

# Function to execute command with retry logic
execute_with_retry() {
    local command="$1"
    local description="$2"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -le $max_retries ]; do
        if [ $retry_count -gt 0 ]; then
            log_from_project_message "${YELLOW}Retry attempt $retry_count for $description...${NC}"
            sleep 5
        fi
        
        log_from_project_message "Executing: $description..."
        local output=$(eval "$command" 2>&1)
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log_from_project_message "${GREEN}$description completed successfully${NC}"
            echo "$output"
            return 0
        else
            log_from_project_message "${RED}$description failed (attempt $((retry_count + 1)))${NC}"
            log_from_project_message "${RED}Error output: $output${NC}"
            
            if echo "$output" | grep -qi "insufficient funds"; then
                log_from_project_message "${RED}Error: Insufficient funds${NC}"
                return 1
            elif echo "$output" | grep -qi "already set\|already initialized"; then
                log_from_project_message "${GREEN}$description: Already set/initialized${NC}"
                return 0
            fi
        fi
        
        retry_count=$((retry_count + 1))
    done
    
    log_from_project_message "${RED}$description failed after $((max_retries + 1)) attempts${NC}"
    return 1
}

# Function to deploy contract with retry
deploy_contract_with_retry() {
    local contract_name="$1"
    local contract_path="$2"
    local constructor_args="$3"
    local libraries="$4"
    local profile="$5"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -le $max_retries ]; do
        if [ $retry_count -gt 0 ]; then
            log_from_project_message "${YELLOW}Retry attempt $retry_count for $contract_name deployment...${NC}"
            sleep 5
        fi
        
        local forge_cmd="FOUNDRY_PROFILE=${profile} forge create ${contract_path}"
        forge_cmd="$forge_cmd --rpc-url \"$RPC_URL\""
        forge_cmd="$forge_cmd --private-key \"$PRIVATE_KEY\""
        forge_cmd="$forge_cmd --broadcast"
        
        if [ -n "$constructor_args" ]; then
            forge_cmd="$forge_cmd --constructor-args $constructor_args"
        fi
        
        if [ -n "$libraries" ]; then
            forge_cmd="$forge_cmd --libraries \"$libraries\""
        fi
        
        forge_cmd="$forge_cmd -vvv"
        
        log_from_project_message "Deploying $contract_name (attempt $((retry_count + 1)))..."
        local output=$(eval "$forge_cmd" 2>&1)
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            local deployed_address=$(extract_address "$output")
            if [ -n "$deployed_address" ] && [ ${#deployed_address} -eq 42 ]; then
                log_from_project_message "${GREEN}$contract_name deployed to: $deployed_address${NC}"
                # Only return the address, nothing else
                echo "$deployed_address"
                return 0
            fi
        else
            log_from_project_message "${RED}Deployment failed for $contract_name${NC}"
            if echo "$output" | grep -qi "insufficient funds"; then
                return 1
            fi
        fi
        
        retry_count=$((retry_count + 1))
    done
    
    log_from_project_message "${RED}Failed to deploy $contract_name after $((max_retries + 1)) attempts${NC}"
    return 1
}

# Phase 1: Deploy DEX
log_message "${GREEN}=== Phase 1: Deploying DEX Infrastructure ===${NC}"

# Run the deploy-dex.sh script
log_message "Running DEX deployment..."
if ./deploy-dex.sh "$NETWORK"; then
    log_message "${GREEN}✅ DEX deployment completed successfully${NC}"
else
    log_message "${RED}❌ DEX deployment failed${NC}"
    exit 1
fi

# Extract addresses from the deployed DEX contracts
log_message "Extracting DEX contract addresses..."
if extract_dex_addresses; then
    log_message "${GREEN}✅ DEX addresses extracted successfully${NC}"
else
    log_message "${RED}❌ Failed to extract DEX addresses${NC}"
    exit 1
fi

# Phase 2: Deploy Farming Contracts
log_message "${GREEN}=== Phase 2: Deploying Farming Contracts ===${NC}"

# Step 1: Deploy MasterChef V3
log_message "${BLUE}=== Step 1: Deploying MasterChef V3 ===${NC}"
cd projects/masterchef-v3

log_from_project_message "Compiling masterchef-v3..."
if forge build; then
    log_from_project_message "${GREEN}MasterChef V3 compilation successful${NC}"
else
    log_from_project_message "${RED}Failed to compile masterchef-v3${NC}"
    exit 1
fi


# Check if KFC_TOKEN_ADDRESS is provided as environment variable
if [ -n "$KFC_TOKEN_ADDRESS" ] && [ "$KFC_TOKEN_ADDRESS" != "" ] && [ "$KFC_TOKEN_ADDRESS" != "0x0000000000000000000000000000000000000000" ]; then
    # Validate KFC token address format
    if [[ "$KFC_TOKEN_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        log_from_project_message "${GREEN}Using configured KFC token: $KFC_TOKEN_ADDRESS${NC}"
    else
        log_from_project_message "${RED}Error: Invalid KFC token address format: $KFC_TOKEN_ADDRESS${NC}"
        log_from_project_message "${RED}KFC token address must be a valid 42-character hex address${NC}"
        exit 1
    fi
else
    log_from_project_message "${RED}❌ ERROR: KFC token address is required for MasterChef V3 deployment${NC}"
    log_from_project_message "${RED}❌ KFC token is set as 'immutable' in MasterChef contract and cannot be changed after deployment${NC}"
    log_from_project_message "${YELLOW}To proceed, you must set a valid KFC token address:${NC}"
    log_from_project_message "${BLUE}  export KFC_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890${NC}"
    log_from_project_message "${BLUE}  ./deploy-all.sh $NETWORK${NC}"
    log_from_project_message ""
    log_from_project_message "${YELLOW}If you want to deploy only the DEX without farming contracts, use:${NC}"
    log_from_project_message "${BLUE}  ./deploy-dex.sh $NETWORK${NC}"
    log_from_project_message ""
    log_from_project_message "${YELLOW}Deployment stopped to prevent deploying an unusable MasterChef contract.${NC}"
    exit 1
fi



log_from_project_message "Deploying MasterChef V3..."
log_from_project_message "Using KFC Token: $KFC_TOKEN_ADDRESS"
log_from_project_message "Using Position Manager: $POSITION_MANAGER_ADDRESS"
log_from_project_message "Using WKAS: $WKAS"

# Deploy MasterChef V3 directly without registry dependency
if [ -z "$MASTERCHEF_V3_ADDRESS" ] || [ "$MASTERCHEF_V3_ADDRESS" = "" ]; then
    MASTERCHEF_V3_OUTPUT=$(deploy_contract_with_retry "MasterChefV3" "contracts/MasterChefV3.sol:MasterChefV3" "$KFC_TOKEN_ADDRESS $POSITION_MANAGER_ADDRESS $WKAS" "" "default")
    DEPLOY_EXIT_CODE=$?

    if [ $DEPLOY_EXIT_CODE -eq 0 ] && [ -n "$MASTERCHEF_V3_OUTPUT" ]; then
        # Clean the output to get just the address
        MASTERCHEF_V3_ADDRESS=$(echo "$MASTERCHEF_V3_OUTPUT" | grep -o "0x[a-fA-F0-9]\{40\}" | tail -1)
        if [ -n "$MASTERCHEF_V3_ADDRESS" ] && [ ${#MASTERCHEF_V3_ADDRESS} -eq 42 ]; then
            update_contract_address "MASTERCHEF_V3_ADDRESS" "$MASTERCHEF_V3_ADDRESS"
            log_from_project_message "${GREEN}MasterChef V3 deployed and saved: $MASTERCHEF_V3_ADDRESS${NC}"
        else
            log_from_project_message "${RED}Failed to extract valid MasterChef V3 address${NC}"
            exit 1
        fi
    else
        log_from_project_message "${RED}Failed to deploy MasterChef V3${NC}"
        exit 1
    fi
else
    log_from_project_message "${GREEN}MasterChef V3 already deployed at: $MASTERCHEF_V3_ADDRESS${NC}"
fi

# Step 1.5: Deploy ReceiverV2 and configure it in MasterChef V3
log_from_project_message "${BLUE}=== Step 1.5: Deploying ReceiverV2 ===${NC}"

log_from_project_message "Deploying MasterChefV3ReceiverV2..."
log_from_project_message "Using MasterChef V3: $MASTERCHEF_V3_ADDRESS"
log_from_project_message "Using KFC Token: $KFC_TOKEN_ADDRESS"

# Deploy ReceiverV2 directly
if [ -z "$RECEIVER_V2_ADDRESS" ] || [ "$RECEIVER_V2_ADDRESS" = "" ]; then
    RECEIVER_V2_OUTPUT=$(deploy_contract_with_retry "MasterChefV3ReceiverV2" "contracts/receiver/MasterChefV3ReceiverV2.sol:MasterChefV3ReceiverV2" "$MASTERCHEF_V3_ADDRESS $KFC_TOKEN_ADDRESS" "" "default")
    RECEIVER_DEPLOY_EXIT_CODE=$?

    if [ $RECEIVER_DEPLOY_EXIT_CODE -eq 0 ] && [ -n "$RECEIVER_V2_OUTPUT" ]; then
        # Clean the output to get just the address
        RECEIVER_V2_ADDRESS=$(echo "$RECEIVER_V2_OUTPUT" | grep -o "0x[a-fA-F0-9]\{40\}" | tail -1)
        if [ -n "$RECEIVER_V2_ADDRESS" ] && [ ${#RECEIVER_V2_ADDRESS} -eq 42 ]; then
            update_contract_address "RECEIVER_V2_ADDRESS" "$RECEIVER_V2_ADDRESS"
            log_from_project_message "${GREEN}ReceiverV2 deployed and saved: $RECEIVER_V2_ADDRESS${NC}"
        else
            log_from_project_message "${RED}Failed to extract valid ReceiverV2 address${NC}"
            exit 1
        fi
    else
        log_from_project_message "${RED}Failed to deploy ReceiverV2${NC}"
        exit 1
    fi
else
    log_from_project_message "${GREEN}ReceiverV2 already deployed at: $RECEIVER_V2_ADDRESS${NC}"
fi

# Configure ReceiverV2 in MasterChef V3
log_from_project_message "Setting ReceiverV2 in MasterChef V3..."
SET_RECEIVER_CMD="cast send \"$MASTERCHEF_V3_ADDRESS\" \"setReceiver(address)\" \"$RECEIVER_V2_ADDRESS\" --rpc-url \"$RPC_URL\" --private-key \"$PRIVATE_KEY\""

if execute_with_retry "$SET_RECEIVER_CMD" "Setting ReceiverV2 in MasterChef V3"; then
    log_from_project_message "${GREEN}Successfully set ReceiverV2 in MasterChef V3${NC}"
else
    log_from_project_message "${RED}Failed to set ReceiverV2 in MasterChef V3${NC}"
    log_from_project_message "${YELLOW}You may need to set this manually later${NC}"
fi

cd ../..

# Step 2: Deploy V3 LM Pool Deployer
log_message "${BLUE}=== Step 2: Deploying V3 LM Pool Deployer ===${NC}"
cd projects/v3-lm-pool

log_from_project_message "Compiling v3-lm-pool..."
if forge build; then
    log_from_project_message "${GREEN}V3 LM Pool compilation successful${NC}"
else
    log_from_project_message "${RED}Failed to compile v3-lm-pool${NC}"
    exit 1
fi

log_from_project_message "Deploying KaspaV3LmPoolDeployer..."
log_from_project_message "Using MasterChef V3: $MASTERCHEF_V3_ADDRESS"

# Deploy KaspaV3LmPoolDeployer directly
if [ -z "$LM_POOL_DEPLOYER_ADDRESS" ] || [ "$LM_POOL_DEPLOYER_ADDRESS" = "" ]; then
    LM_POOL_DEPLOYER_OUTPUT=$(deploy_contract_with_retry "KaspaV3LmPoolDeployer" "contracts/KaspaV3LmPoolDeployer.sol:KaspaV3LmPoolDeployer" "$MASTERCHEF_V3_ADDRESS" "" "default")
    LM_DEPLOY_EXIT_CODE=$?

    if [ $LM_DEPLOY_EXIT_CODE -eq 0 ] && [ -n "$LM_POOL_DEPLOYER_OUTPUT" ]; then
        # Clean the output to get just the address
        LM_POOL_DEPLOYER_ADDRESS=$(echo "$LM_POOL_DEPLOYER_OUTPUT" | grep -o "0x[a-fA-F0-9]\{40\}" | tail -1)
        if [ -n "$LM_POOL_DEPLOYER_ADDRESS" ] && [ ${#LM_POOL_DEPLOYER_ADDRESS} -eq 42 ]; then
            update_contract_address "LM_POOL_DEPLOYER_ADDRESS" "$LM_POOL_DEPLOYER_ADDRESS"
            log_from_project_message "${GREEN}KaspaV3LmPoolDeployer deployed and saved: $LM_POOL_DEPLOYER_ADDRESS${NC}"
        else
            log_from_project_message "${RED}Failed to extract valid LM Pool Deployer address${NC}"
            exit 1
        fi
    else
        log_from_project_message "${RED}Failed to deploy KaspaV3LmPoolDeployer${NC}"
        exit 1
    fi
else
    log_from_project_message "${GREEN}KaspaV3LmPoolDeployer already deployed at: $LM_POOL_DEPLOYER_ADDRESS${NC}"
fi

# Configure LM Pool Deployer in MasterChef V3
log_from_project_message "Setting LM Pool Deployer in MasterChef V3..."
SET_LM_DEPLOYER_IN_MC_CMD="cast send \"$MASTERCHEF_V3_ADDRESS\" \"setLMPoolDeployer(address)\" \"$LM_POOL_DEPLOYER_ADDRESS\" --rpc-url \"$RPC_URL\" --private-key \"$PRIVATE_KEY\""

if execute_with_retry "$SET_LM_DEPLOYER_IN_MC_CMD" "Setting LM Pool Deployer in MasterChef V3"; then
    log_from_project_message "${GREEN}Successfully set LM Pool Deployer in MasterChef V3${NC}"
else
    log_from_project_message "${RED}Failed to set LM Pool Deployer in MasterChef V3${NC}"
    log_from_project_message "${YELLOW}You may need to set this manually later${NC}"
fi

cd ../..

# Step 3: Configure LM Pool Deployer in Factory
log_message "${BLUE}=== Step 3: Configuring LM Pool Deployer in Factory ===${NC}"

log_message "Setting LM Pool Deployer in Factory (always override)..."
log_message "Factory Address: $FACTORY_ADDRESS"
log_message "LM Pool Deployer Address: $LM_POOL_DEPLOYER_ADDRESS"

# Always set the LM Pool Deployer in Factory regardless of current value
SET_FACTORY_LM_CMD="cast send \"$FACTORY_ADDRESS\" \"setLmPoolDeployer(address)\" \"$LM_POOL_DEPLOYER_ADDRESS\" --rpc-url \"$RPC_URL\" --private-key \"$PRIVATE_KEY\""

if execute_with_retry "$SET_FACTORY_LM_CMD" "Setting LM Pool Deployer in Factory"; then
    log_message "${GREEN}Successfully set LM Pool Deployer in Factory${NC}"
else
    log_message "${RED}Failed to set LM Pool Deployer in Factory${NC}"
    log_message "${YELLOW}You may need to set this manually later${NC}"
fi

# Final Summary
log_message "${GREEN}=== Final Deployment Summary ===${NC}"

log_message "${BLUE}=== DEX Contract Addresses ===${NC}"
log_message "WKAS: $WKAS"
log_message "KaspaV3PoolDeployer: $POOL_DEPLOYER_ADDRESS"
log_message "KaspaV3Factory: $FACTORY_ADDRESS"
log_message "SwapRouter: $SWAP_ROUTER_ADDRESS"
log_message "NFTDescriptor: $NFT_DESCRIPTOR_ADDRESS"
log_message "NFTDescriptorEx: $NFT_DESCRIPTOR_EX_ADDRESS"
log_message "NonfungibleTokenPositionDescriptor: $POSITION_DESCRIPTOR_ADDRESS"
log_message "NonfungiblePositionManager: $POSITION_MANAGER_ADDRESS"
log_message "QuoterV2: $QUOTER_V2_ADDRESS"
log_message "TickLens: $TICK_LENS_ADDRESS"
log_message "SmartRouterHelper: $SMART_ROUTER_HELPER_ADDRESS"
log_message "SmartRouter: $SMART_ROUTER_ADDRESS"

log_message "${BLUE}=== Farming Contract Addresses ===${NC}"
log_message "MasterChef V3: $MASTERCHEF_V3_ADDRESS"
log_message "ReceiverV2: $RECEIVER_V2_ADDRESS"
log_message "KaspaV3LmPoolDeployer: $LM_POOL_DEPLOYER_ADDRESS"

log_message "${BLUE}=== Configuration ===${NC}"
log_message "Network: $NETWORK"
log_message "RPC URL: $RPC_URL"
log_message "KFC Token: $KFC_TOKEN_ADDRESS"

# Create comprehensive deployment summary file
SUMMARY_FILE="deployment_summary_${NETWORK}_$(date +%Y%m%d_%H%M%S).json"
cat > "$SUMMARY_FILE" << EOF
{
  "network": "$NETWORK",
  "rpcUrl": "$RPC_URL",
  "deploymentDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deploymentLog": "$DEPLOYMENT_LOG",
  "status": "complete",
  "contracts": {
    "dex": {
      "wkas": "$WKAS",
      "poolDeployer": "$POOL_DEPLOYER_ADDRESS",
      "factory": "$FACTORY_ADDRESS",
      "swapRouter": "$SWAP_ROUTER_ADDRESS",
      "nftDescriptor": "$NFT_DESCRIPTOR_ADDRESS",
      "nftDescriptorEx": "$NFT_DESCRIPTOR_EX_ADDRESS",
      "positionDescriptor": "$POSITION_DESCRIPTOR_ADDRESS",
      "positionManager": "$POSITION_MANAGER_ADDRESS",
      "quoterV2": "$QUOTER_V2_ADDRESS",
      "tickLens": "$TICK_LENS_ADDRESS",
      "smartRouterHelper": "$SMART_ROUTER_HELPER_ADDRESS",
      "smartRouter": "$SMART_ROUTER_ADDRESS"
    },
    "farming": {
      "masterChefV3": "$MASTERCHEF_V3_ADDRESS",
      "receiverV2": "$RECEIVER_V2_ADDRESS",
      "lmPoolDeployer": "$LM_POOL_DEPLOYER_ADDRESS",
      "kfcToken": "$KFC_TOKEN_ADDRESS"
    }
  },
  "components": {
    "dex": "deployed",
    "masterchef": "deployed",
    "lmPool": "deployed"
  }
}
EOF

log_message "${GREEN}=== Complete Deployment Finished ===${NC}"
log_message "${BLUE}Deployment log: $DEPLOYMENT_LOG${NC}"
log_message "${BLUE}Deployment summary: $SUMMARY_FILE${NC}"

echo ""
log_message "${GREEN}✅ Full deployment successful!${NC}"
log_message "${YELLOW}Next steps:${NC}"
log_message "1. Test DEX functionality with sample swaps"
log_message "2. Test farming functionality by creating LM pools"
log_message "3. Add liquidity to pools and test MasterChef farming"
log_message "4. Verify all contracts on block explorer"
log_message "5. Update frontend configurations with new addresses"
log_message ""
log_message "${BLUE}Important Contract Addresses:${NC}"
log_message "• Factory: $FACTORY_ADDRESS"
log_message "• Position Manager: $POSITION_MANAGER_ADDRESS"
log_message "• Smart Router: $SMART_ROUTER_ADDRESS" 
log_message "• MasterChef V3: $MASTERCHEF_V3_ADDRESS"
log_message "• ReceiverV2: $RECEIVER_V2_ADDRESS"
log_message "• LM Pool Deployer: $LM_POOL_DEPLOYER_ADDRESS"
