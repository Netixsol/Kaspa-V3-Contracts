// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../contracts/MasterChefV3.sol";
import "../contracts/interfaces/INonfungiblePositionManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface for the registry
interface IDeploymentRegistry {
    function registerContract(string memory network, string memory contractName, address contractAddress) external;
    function getContract(string memory network, string memory contractName) external view returns (address);
}

contract MasterChefV3Deployment {
    // Network-specific constants
    mapping(string => address) public kfcAddresses;
    mapping(string => address) public wnativeAddresses;
    
    // Deployed contract addresses
    address public masterChefV3;
    
    event ContractDeployed(string indexed name, address indexed contractAddress);
    
    constructor() {
        // Initialize network configurations
        // Note: KFC token addresses need to be set for each network
        // For now, setting to zero - will need to be updated with actual KFC token addresses
        
        // Kasplex Testnet
        kfcAddresses["kasplexTestnet"] = address(0); // Update with actual KFC token address
        wnativeAddresses["kasplexTestnet"] = 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94;
        
        // Kasplex Mainnet
        kfcAddresses["kasplexMainnet"] = address(0); // Update with actual KFC token address
        wnativeAddresses["kasplexMainnet"] = 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94;
    }
    
    function deployContracts(address registryAddress, string memory network) external {
        IDeploymentRegistry registry = IDeploymentRegistry(registryAddress);
        
        // Get required addresses from registry
        address positionManager = registry.getContract(network, "NonfungiblePositionManager");
        require(positionManager != address(0), "NonfungiblePositionManager not found in registry");
        
        // Get network constants
        address kfc = kfcAddresses[network];
        address wnative = wnativeAddresses[network];
        
        require(wnative != address(0), "Network not supported");
        require(kfc != address(0), "KFC token address not configured for this network");
        
        // Deploy MasterChefV3
        MasterChefV3 _masterChefV3 = new MasterChefV3(
            IERC20(kfc),
            INonfungiblePositionManager(positionManager),
            wnative
        );
        masterChefV3 = address(_masterChefV3);
        emit ContractDeployed("MasterChefV3", masterChefV3);
        registry.registerContract(network, "MasterChefV3", masterChefV3);

        emit ContractDeployed("SetupCompleted", address(this));
    }
    
    function getDeployedAddresses() external view returns (address) {
        return masterChefV3;
    }
    
    // Function to update KFC token address for a network
    function updateKFCAddress(string memory network, address _kfc) external {
        kfcAddresses[network] = _kfc;
    }
    
    // Function to get current KFC address for a network
    function getKFCAddress(string memory network) external view returns (address) {
        return kfcAddresses[network];
    }
}
