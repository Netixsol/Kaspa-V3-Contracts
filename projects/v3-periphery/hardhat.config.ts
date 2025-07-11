import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 200,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const ULTRA_LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 50,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
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
  timeout: 120000,
  gas: 'auto',
  gasPrice: 'auto',
  allowUnlimitedContractSize: true,
}

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.PRIVATE_KEY && { kasplexTestnet }),
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.ETHERSCAN_API_KEY!,
      bsc: process.env.ETHERSCAN_API_KEY!,
      goerli: process.env.ETHERSCAN_API_KEY!,
      mainnet: process.env.ETHERSCAN_API_KEY!,
      kasplexTestnet: process.env.ETHERSCAN_API_KEY || 'dummy-api-key',
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
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/MockTimeNonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/NFTDescriptorTest.sol': ULTRA_LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/NFTDescriptorEx.sol': ULTRA_LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/libraries/NFTDescriptor.sol': ULTRA_LOW_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  docgen: {
    pages: 'files',
  },
}
