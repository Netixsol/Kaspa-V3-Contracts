import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import '@nomiclabs/hardhat-truffle5'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'dotenv/config'
import 'hardhat-tracer'
import '@nomiclabs/hardhat-etherscan'
import 'solidity-docgen'

require('dotenv').config({ path: require('find-config')('.env') })

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

/**
 * ✅ IGRA Devnet Config
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
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: bscTestnet.url,
      },
    },
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.PRIVATE_KEY && { igra }), // ✅ consistent name
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
    customChains: [
      {
        network: 'igra', // ✅ consistent name
        chainId: 2600, // ⚠️ update once confirmed
        urls: {
          apiURL: 'https://explorer.devnet.igralabs.com/api',
          browserURL: 'https://explorer.devnet.igralabs.com',
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: { optimizer: { enabled: true, runs: 10 } },
      },
      {
        version: '0.8.10',
        settings: { optimizer: { enabled: true, runs: 10 } },
      },
      {
        version: '0.6.6',
        settings: { optimizer: { enabled: true, runs: 10 } },
      },
      {
        version: '0.5.16',
        settings: { optimizer: { enabled: true, runs: 10 } },
      },
      {
        version: '0.4.18',
        settings: { optimizer: { enabled: true, runs: 10 } },
      },
    ],
    overrides: {
      '@kasplex/v3-core/contracts/libraries/FullMath.sol': {
        version: '0.7.6',
      },
      '@kasplex/v3-core/contracts/libraries/TickBitmap.sol': {
        version: '0.7.6',
      },
      '@kasplex/v3-core/contracts/libraries/TickMath.sol': {
        version: '0.7.6',
      },
      '@kasplex/v3-periphery/contracts/libraries/PoolAddress.sol': {
        version: '0.7.6',
      },
      'contracts/libraries/PoolTicksCounter.sol': {
        version: '0.7.6',
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  docgen: {
    pages: 'files',
  },
}

export default config
