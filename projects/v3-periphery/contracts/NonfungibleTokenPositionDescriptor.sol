// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@kasplex/v3-core/contracts/interfaces/IKaspaV3Pool.sol';
import '@uniswap/lib/contracts/libraries/SafeERC20Namer.sol';

import './libraries/ChainId.sol';
import './interfaces/INonfungiblePositionManager.sol';
import './interfaces/INonfungibleTokenPositionDescriptor.sol';
import './interfaces/IERC20Metadata.sol';
import './libraries/PoolAddress.sol';
import './libraries/NFTDescriptor.sol';
import './libraries/TokenRatioSortOrder.sol';
import './NFTDescriptorEx.sol';

/// @title Describes NFT token positions
/// @notice Produces a string containing the data URI for a JSON metadata string
contract NonfungibleTokenPositionDescriptor is INonfungibleTokenPositionDescriptor {
    address private constant FCN = 0x8869040c9AFABDAbC6D0Dc773D4c98a681BA4a92;
    address private constant USDC = 0x593Cd4124ffE9D11B3114259fbC170a5759E0f54;
    address private constant USDT = 0xEcff9AabD043e49C450A73808c7a16Aa96e2000F;
    address private constant KFC = 0xf87e587AB945F7B111329a6ace6dc497D34f098B;
    address private constant BLK = 0x9cbF7D0146d0bbD1F8294bBAD2bb6208A0b85cFf;

    address public immutable WETH9;
    /// @dev A null-terminated string
    bytes32 public immutable nativeCurrencyLabelBytes;

    /// @dev A NFTDescriptorEx address
    address public immutable nftDescriptorEx;

    constructor(address _WETH9, bytes32 _nativeCurrencyLabelBytes, address _nftDescriptorEx) {
        WETH9 = _WETH9;
        nativeCurrencyLabelBytes = _nativeCurrencyLabelBytes;
        nftDescriptorEx = _nftDescriptorEx;
    }

    /// @notice Returns the native currency label as a string
    function nativeCurrencyLabel() public view returns (string memory) {
        uint256 len = 0;
        while (len < 32 && nativeCurrencyLabelBytes[len] != 0) {
            len++;
        }
        bytes memory b = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            b[i] = nativeCurrencyLabelBytes[i];
        }
        return string(b);
    }

    /// @inheritdoc INonfungibleTokenPositionDescriptor
    function tokenURI(INonfungiblePositionManager positionManager, uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        (, , address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, , , , , ) =
            positionManager.positions(tokenId);

        IKaspaV3Pool pool =
            IKaspaV3Pool(
                PoolAddress.computeAddress(
                    positionManager.deployer(),
                    PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
                )
            );

        bool _flipRatio = flipRatio(token0, token1, ChainId.get());
        address quoteTokenAddress = !_flipRatio ? token1 : token0;
        address baseTokenAddress = !_flipRatio ? token0 : token1;
        (, int24 tick, , , , , ) = pool.slot0();

        return
            NFTDescriptorEx(nftDescriptorEx).constructTokenURI(
                NFTDescriptorEx.ConstructTokenURIParams({
                    tokenId: tokenId,
                    quoteTokenAddress: quoteTokenAddress,
                    baseTokenAddress: baseTokenAddress,
                    quoteTokenSymbol: quoteTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(quoteTokenAddress),
                    baseTokenSymbol: baseTokenAddress == WETH9
                        ? nativeCurrencyLabel()
                        : SafeERC20Namer.tokenSymbol(baseTokenAddress),
                    quoteTokenDecimals: IERC20Metadata(quoteTokenAddress).decimals(),
                    baseTokenDecimals: IERC20Metadata(baseTokenAddress).decimals(),
                    flipRatio: _flipRatio,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    tickCurrent: tick,
                    tickSpacing: pool.tickSpacing(),
                    fee: fee,
                    poolAddress: address(pool)
                })
            );
    }

    function flipRatio(
        address token0,
        address token1,
        uint256 chainId
    ) public view returns (bool) {
        return tokenRatioPriority(token0, chainId) > tokenRatioPriority(token1, chainId);
    }

    function tokenRatioPriority(address token, uint256 chainId) public view returns (int256) {
        if (token == WETH9) {
            return TokenRatioSortOrder.DENOMINATOR;
        }
        if (chainId == 167012) {
            if (token == USDC) {
                return TokenRatioSortOrder.NUMERATOR_MOST;
            } else if (token == USDT) {
                return TokenRatioSortOrder.NUMERATOR_MORE;
            } else if (token == FCN) {
                return TokenRatioSortOrder.NUMERATOR;
            } else if (token == KFC) {
                return TokenRatioSortOrder.DENOMINATOR_MORE;
            } else if (token == BLK) {
                return TokenRatioSortOrder.DENOMINATOR_MOST;
            } else {
                return 0;
            }
        }
        return 0;
    }
}
