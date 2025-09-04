// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "../contracts/SmartRouter.sol";

// Interface for the registry
interface IDeploymentRegistry {
    function registerContract(string memory network, string memory contractName, address contractAddress) external;
    function getContract(string memory network, string memory contractName) external view returns (address);
}

contract RouterDeployment {
    // Network-specific constants
    mapping(string => address) public wethAddresses;
    mapping(string => address) public factoryV2Addresses;
    mapping(string => address) public stableFactoryAddresses;
    mapping(string => address) public stableInfoAddresses;
    
    // Deployed contract addresses
    address public smartRouter;
    
    event ContractDeployed(string indexed name, address indexed contractAddress);
    
    constructor() {
        // Initialize network-specific constants
        // Kasplex Testnet
        wethAddresses["kasplexTestnet"] = 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94;
        factoryV2Addresses["kasplexTestnet"] = address(0); // Set to 0 if not available
        stableFactoryAddresses["kasplexTestnet"] = address(0); // Set to 0 if not available
        stableInfoAddresses["kasplexTestnet"] = address(0); // Set to 0 if not available
        
        // Kasplex Mainnet (using same config as testnet for now)
        wethAddresses["kasplexMainnet"] = 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94;
        factoryV2Addresses["kasplexMainnet"] = address(0);
        stableFactoryAddresses["kasplexMainnet"] = address(0);
        stableInfoAddresses["kasplexMainnet"] = address(0);
    }
    
    function deployContracts(address registryAddress, string memory network) external {
        IDeploymentRegistry registry = IDeploymentRegistry(registryAddress);
        
        // Get required addresses from registry
        address factoryV3 = registry.getContract(network, "KaspaV3Factory");
        address poolDeployer = registry.getContract(network, "KaspaV3PoolDeployer");
        address positionManager = registry.getContract(network, "NonfungiblePositionManager");
        
        require(factoryV3 != address(0), "KaspaV3Factory not found in registry");
        require(poolDeployer != address(0), "KaspaV3PoolDeployer not found in registry");
        require(positionManager != address(0), "NonfungiblePositionManager not found in registry");
        
        // Get network constants
        address weth = wethAddresses[network];
        address factoryV2 = factoryV2Addresses[network];
        address stableFactory = stableFactoryAddresses[network];
        address stableInfo = stableInfoAddresses[network];
        
        require(weth != address(0), "Network not supported");
        
        // Deploy SmartRouter (SmartRouterHelper library will be automatically linked by compiler)
        SmartRouter _smartRouter = new SmartRouter(
            factoryV2,
            poolDeployer,
            factoryV3,
            positionManager,
            stableFactory,
            stableInfo,
            weth
        );
        smartRouter = address(_smartRouter);
        emit ContractDeployed("SmartRouter", smartRouter);
        registry.registerContract(network, "SmartRouter", smartRouter);

        emit ContractDeployed("SetupCompleted", address(this));
    }
    
    function getDeployedAddresses() external view returns (address) {
        return smartRouter;
    }
}
