// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;
pragma abicoder v2;

import '@kasplex/v3-periphery/contracts/interfaces/ISelfPermit.sol';

import './IV2SwapRouter.sol';
import './IV3SwapRouter.sol';
import './IStableSwapRouter.sol';
import './IApproveAndCall.sol';
import './IMulticallExtended.sol';

/// @title Router token swapping functionality
interface ISmartRouter is IV2SwapRouter, IV3SwapRouter, IStableSwapRouter, IApproveAndCall, IMulticallExtended, ISelfPermit {

}
