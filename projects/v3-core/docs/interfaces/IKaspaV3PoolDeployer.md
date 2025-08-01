# Solidity API

## IKaspaV3PoolDeployer

A contract that constructs a pool must implement this to pass arguments to the pool

_This is used to avoid having constructor arguments in the pool contract, which results in the init code hash
of the pool being constant allowing the CREATE2 address of the pool to be cheaply computed on-chain_

### parameters

```solidity
function parameters() external view returns (address factory, address token0, address token1, uint24 fee, int24 tickSpacing)
```

Get the parameters to be used in constructing the pool, set transiently during pool creation.

_Called by the pool constructor to fetch the parameters of the pool
Returns factory The factory address
Returns token0 The first token of the pool by address sort order
Returns token1 The second token of the pool by address sort order
Returns fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
Returns tickSpacing The minimum number of ticks between initialized ticks_

### deploy

```solidity
function deploy(address factory, address token0, address token1, uint24 fee, int24 tickSpacing) external returns (address pool)
```

