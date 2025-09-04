// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Shared deployment registry that stores all contract addresses
// This will be deployed first and used by all subsequent deployments
contract DeploymentRegistry {
    mapping(string => mapping(string => address)) public deployedContracts;
    mapping(string => string[]) public contractNames;
    address public owner;

    event ContractRegistered(string indexed network, string indexed contractName, address contractAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can register contracts');
        _;
    }

    function registerContract(
        string memory network,
        string memory contractName,
        address contractAddress
    ) external onlyOwner {
        require(contractAddress != address(0), 'Invalid contract address');

        // If this is the first time registering this contract name for this network
        if (deployedContracts[network][contractName] == address(0)) {
            contractNames[network].push(contractName);
        }

        deployedContracts[network][contractName] = contractAddress;
        emit ContractRegistered(network, contractName, contractAddress);
    }

    function getContract(string memory network, string memory contractName) external view returns (address) {
        return deployedContracts[network][contractName];
    }

    function getAllContracts(
        string memory network
    ) external view returns (string[] memory names, address[] memory addresses) {
        string[] memory networkContracts = contractNames[network];
        addresses = new address[](networkContracts.length);

        for (uint i = 0; i < networkContracts.length; i++) {
            addresses[i] = deployedContracts[network][networkContracts[i]];
        }

        return (networkContracts, addresses);
    }

    function isContractDeployed(string memory network, string memory contractName) external view returns (bool) {
        return deployedContracts[network][contractName] != address(0);
    }
}
