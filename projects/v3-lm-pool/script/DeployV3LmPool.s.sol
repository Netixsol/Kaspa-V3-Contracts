// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '../contracts/KaspaV3LmPool.sol';
import '../contracts/KaspaV3LmPoolDeployer.sol';

// Interface for the registry
interface IDeploymentRegistry {
    function registerContract(string memory network, string memory contractName, address contractAddress) external;

    function getContract(string memory network, string memory contractName) external view returns (address);
}

contract V3LmPoolDeployment {
    // Deployed contract addresses
    address public kaspaV3LmPoolDeployer;
    address public kaspaV3LmPool;

    event ContractDeployed(string indexed name, address indexed contractAddress);

    function deployContracts(address registryAddress, string memory network) external {
        IDeploymentRegistry registry = IDeploymentRegistry(registryAddress);
        address masterChef = registry.getContract(network, 'MasterChef');

        // Deploy KaspaV3LmPoolDeployer
        KaspaV3LmPoolDeployer _deployer = new KaspaV3LmPoolDeployer(masterChef);
        kaspaV3LmPoolDeployer = address(_deployer);
        emit ContractDeployed('KaspaV3LmPoolDeployer', kaspaV3LmPoolDeployer);
        registry.registerContract(network, 'KaspaV3LmPoolDeployer', kaspaV3LmPoolDeployer);

        // Note: KaspaV3LmPool should be deployed through the deployer contract
        // This is typically done by calling deployPool on the deployer
        // For now, we just deploy the deployer and register it

        emit ContractDeployed('SetupCompleted', address(this));
    }

    function getDeployedAddresses() external view returns (address, address) {
        return (kaspaV3LmPoolDeployer, kaspaV3LmPool);
    }
}
