# Solidity API

## Quoter

Allows getting the expected amount out or amount in for a given swap without executing the swap

_These functions are not gas efficient and should _not_ be called on chain. Instead, optimistically execute
the swap and check the amounts in the callback._

### constructor

```solidity
constructor(address _deployer, address _factory, address _WETH9) public
```

### kaspaV3SwapCallback

```solidity
function kaspaV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes path) external view
```

Called to `msg.sender` after executing a swap via IKaspaV3Pool#swap.

_In the implementation you must pay the pool tokens owed for the swap.
The caller of this method must be checked to be a KaspaV3Pool deployed by the canonical KaspaV3Factory.
amount0Delta and amount1Delta can both be 0 if no tokens were swapped._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0Delta | int256 | The amount of token0 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token0 to the pool. |
| amount1Delta | int256 | The amount of token1 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token1 to the pool. |
| path | bytes |  |

### quoteExactInputSingle

```solidity
function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) public returns (uint256 amountOut)
```

Returns the amount out received for a given exact input but for a swap of a single pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | The token being swapped in |
| tokenOut | address | The token being swapped out |
| fee | uint24 | The fee of the token pool to consider for the pair |
| amountIn | uint256 | The desired input amount |
| sqrtPriceLimitX96 | uint160 | The price limit of the pool that cannot be exceeded by the swap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of `tokenOut` that would be received |

### quoteExactInput

```solidity
function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut)
```

Returns the amount out received for a given exact input swap without executing the swap

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | bytes | The path of the swap, i.e. each token pair and the pool fee |
| amountIn | uint256 | The amount of the first token to swap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of the last token that would be received |

### quoteExactOutputSingle

```solidity
function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) public returns (uint256 amountIn)
```

Returns the amount in required to receive the given exact output amount but for a swap of a single pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | The token being swapped in |
| tokenOut | address | The token being swapped out |
| fee | uint24 | The fee of the token pool to consider for the pair |
| amountOut | uint256 | The desired output amount |
| sqrtPriceLimitX96 | uint160 | The price limit of the pool that cannot be exceeded by the swap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount required as the input for the swap in order to receive `amountOut` |

### quoteExactOutput

```solidity
function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn)
```

Returns the amount in required for a given exact output swap without executing the swap

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| path | bytes | The path of the swap, i.e. each token pair and the pool fee. Path must be provided in reverse order |
| amountOut | uint256 | The amount of the last token to receive |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of first token required to be paid |

