// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IKaspaV3Pool.sol";
import "./ILMPool.sol";

interface ILMPoolDeployer {
    function deploy(IKaspaV3Pool pool) external returns (ILMPool lmPool);
}
