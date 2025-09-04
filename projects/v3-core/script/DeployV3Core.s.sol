// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../contracts/KaspaV3Factory.sol";
import "../contracts/KaspaV3PoolDeployer.sol";

// Interface for the registry (since we can't import directly due to version differences)
interface IDeploymentRegistry {
    function registerContract(string memory network, string memory contractName, address contractAddress) external;
    function getContract(string memory network, string memory contractName) external view returns (address);
}

// V3 Core deployment script that registers contracts to the registry
contract V3CoreDeployment {
    address public kaspaV3PoolDeployer;
    address public kaspaV3Factory;
    
    event ContractDeployed(string indexed name, address indexed contractAddress);
    
    function deployContracts(address registryAddress, string memory network) external {
        IDeploymentRegistry registry = IDeploymentRegistry(registryAddress);
        
        // Deploy KaspaV3PoolDeployer
        KaspaV3PoolDeployer poolDeployer = new KaspaV3PoolDeployer();
        kaspaV3PoolDeployer = address(poolDeployer);
        emit ContractDeployed("KaspaV3PoolDeployer", kaspaV3PoolDeployer);
        
        // Register with registry
        registry.registerContract(network, "KaspaV3PoolDeployer", kaspaV3PoolDeployer);

        // Deploy KaspaV3Factory
        KaspaV3Factory factory = new KaspaV3Factory(kaspaV3PoolDeployer);
        kaspaV3Factory = address(factory);
        emit ContractDeployed("KaspaV3Factory", kaspaV3Factory);
        
        // Register with registry
        registry.registerContract(network, "KaspaV3Factory", kaspaV3Factory);

        // Set factory address in pool deployer
        poolDeployer.setFactoryAddress(kaspaV3Factory);
        
        emit ContractDeployed("SetupCompleted", address(this));
    }
    
    function getDeployedAddresses() external view returns (address, address) {
        return (kaspaV3Factory, kaspaV3PoolDeployer);
    }
}
