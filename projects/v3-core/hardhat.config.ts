import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'

require('dotenv').config({ path: require('find-config')('.env') })

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: { enabled: true, runs: 2000 },
    metadata: { bytecodeHash: 'none' },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: { enabled: true, runs: 400 },
    metadata: { bytecodeHash: 'none' },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: { enabled: true, runs: 1_000_000 },
    metadata: { bytecodeHash: 'none' },
  },
}

const bscTestnet: NetworkUserConfig = {
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
}

const bscMainnet: NetworkUserConfig = {
  url: 'https://bsc-dataseed.binance.org/',
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
}

const goerli: NetworkUserConfig = {
  url: 'https://rpc.ankr.com/eth_goerli',
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
}

const eth: NetworkUserConfig = {
  url: 'https://eth.llamarpc.com',
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
}

const kasplexTestnet: NetworkUserConfig = {
  url: 'https://rpc.kasplextest.xyz',
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
}

/**
 * ✅ IGRA Devnet
 * Needs in .env:
 *   IGRA_API_KEY=xxxxx
 *   KEY_IGRA_DEVNET=0xyourprivatekey
 */
const igra: NetworkUserConfig = {
  url: `https://devnet.igralabs.com:8545/${process.env.IGRA_API_KEY}`,
  chainId: 2600, // ⚠️ confirm with "npx hardhat console --network igra"
  accounts: [process.env.PRIVATE_KEY!],
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: { allowUnlimitedContractSize: true },
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.PRIVATE_KEY && { kasplexTestnet }),
    ...(process.env.PRIVATE_KEY && { igra }), // ✅ consistent name
  },
  etherscan: {
    apiKey: {
      bscTestnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      bscMainnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      goerli: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      mainnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      kasplexTestnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      // no etherscan for Igra
    },
    customChains: [
      {
        network: 'kasplexTestnet',
        chainId: 167012,
        urls: {
          apiURL: 'https://frontend.kasplextest.xyz/api',
          browserURL: 'https://frontend.kasplextest.xyz',
        },
      },
      {
        network: 'igra', // ✅ consistent name
        chainId: 2600,
        urls: {
          apiURL: 'https://explorer.devnet.igralabs.com/api',
          browserURL: 'https://explorer.devnet.igralabs.com',
        },
      },
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/KaspaV3Pool.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/KaspaV3PoolDeployer.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/OutputCodeHash.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  docgen: { pages: 'files' },
}

export default config
