import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'

require('dotenv').config({ path: require('find-config')('.env') })

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 400,
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

const config = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    ...(process.env.PRIVATE_KEY && { kasplexTestnet }),
  },
  etherscan: {
    apiKey: {
      kasplexTestnet: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
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
  docgen: {
    pages: 'files',
  },
}

export default config
