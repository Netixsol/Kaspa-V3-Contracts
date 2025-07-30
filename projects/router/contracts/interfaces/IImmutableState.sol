// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Immutable state
/// @notice Functions that return immutable state of the router
interface IImmutableState {
    /// @return Returns the address of the Kaspa Finance V2 factory
    function factoryV2() external view returns (address);

    /// @return Returns the address of Kaspa Finance V3 NFT position manager
    function positionManager() external view returns (address);
}
