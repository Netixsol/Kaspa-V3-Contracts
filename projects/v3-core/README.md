# Kaspa Finance V3

This repository contains the core smart contracts for the Kaspa Finance V3 Protocol.
For higher level contracts, see the [v3-periphery](../v3-periphery/)
repository.

## Local deployment

In order to deploy this code to a local testnet, you should install the npm package
`@kasplex/v3-core`
and import the factory bytecode located at
`@kasplex/v3-core/artifacts/contracts/KaspaV3Factory.sol/KaspaV3Factory.json`.
For example:

```typescript
import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@kasplex/v3-core/artifacts/contracts/KaspaV3Factory.sol/KaspaV3Factory.json'

// deploy the bytecode
```

This will ensure that you are testing against the same bytecode that is deployed to
mainnet and public testnets, and all Kaspa Finance code will correctly interoperate with
your local deployment.

## Using solidity interfaces

The Kaspa Finance v3 interfaces are available for import into solidity smart contracts
via the npm artifact `@kasplex/v3-core`, e.g.:

```solidity
import '@kasplex/v3-core/contracts/interfaces/IKaspaV3Pool.sol';

contract MyContract {
  IKaspaV3Pool pool;

  function doSomethingWithPool() {
    // pool.swap(...);
  }
}

```
