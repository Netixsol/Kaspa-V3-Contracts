// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import '@kasplex/v3-core/contracts/interfaces/IKaspaV3Factory.sol';
import '@kasplex/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';

import './KaspaV3LmPool.sol';
import './interfaces/IMasterChefV3.sol';

/// @dev This contract is for Master Chef to create a corresponding LmPool when
/// adding a new farming pool. As for why not just create LmPool inside the
/// Master Chef contract is merely due to the imcompatibility of the solidity
/// versions.
contract KaspaV3LmPoolDeployer {
    struct Parameters {
        address pool;
        address masterChef;
    }

    Parameters public parameters;

    address public immutable masterChef;

    event NewLMPool(address indexed pool, address indexed LMPool);

    modifier onlyMasterChef() {
        require(msg.sender == masterChef, "Not MC");
        _;
    }

    constructor(address _masterChef) {
        masterChef = _masterChef;
    }

    /// @dev Deploys a LmPool
    /// @param pool The contract address of the Kaspa Finance V3 pool
    function deploy(address pool) external onlyMasterChef returns (address lmPool) {
        parameters = Parameters({pool: pool, masterChef: masterChef});

        lmPool = address(new KaspaV3LmPool{salt: keccak256(abi.encode(pool, masterChef, block.timestamp))}());

        delete parameters;

        // Set new LMPool for Kaspa v3 pool.
        IKaspaV3Factory(INonfungiblePositionManager(IMasterChefV3(masterChef).nonfungiblePositionManager()).factory())
            .setLmPool(pool, lmPool);

        emit NewLMPool(pool, lmPool);
    }
}
