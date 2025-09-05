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
      runs: 200,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}
const MID_LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000,
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

const kasplexTestnet: NetworkUserConfig = {
  url: 'https://rpc.kasplextest.xyz',
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
}
const igraCaravel: NetworkUserConfig = {
  url: 'https://caravel.igralabs.com:8545',
  chainId: 19416,
  accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 2000000000000, // 2000 Gwei - minimum required by Igra network
  gas: 8000000, // Increased gas limit for large contracts
  blockGasLimit: 10000000, // Set block gas limit
  allowUnlimitedContractSize: true, // Allow large contracts
}

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    kasplexTestnet,
    igraCaravel,
  },
  etherscan: {
    apiKey: {
      kasplexTestnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
      igraCaravel: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
    },
    customChains: [
      {
        network: 'kasplexTestnet',
        chainId: 167012,
        urls: {
          apiURL: 'https://explorer.testnet.kasplextest.xyz/api',
          browserURL: 'https://explorer.testnet.kasplextest.xyz',
        },
      },
      {
        network: 'igraCaravel',
        chainId: 19416,
        urls: {
          apiURL: 'https://explorer.caravel.igralabs.com/api',
          browserURL: 'https://explorer.caravel.igralabs.com',
        },
      },
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/MockTimeNonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/NFTDescriptorTest.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/NFTDescriptorEx.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/libraries/NFTDescriptor.sol': MID_LOWEST_OPTIMIZER_COMPILER_SETTINGS,
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
