import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
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

const kasplexTestnet: NetworkUserConfig = {
  url: 'https://rpc.kasplextest.xyz',
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
}

// 🚀 IGRA Devnet config
const igra: NetworkUserConfig = {
  url: `https://devnet.igralabs.com:8545/${process.env.IGRA_API_KEY}`,
  chainId: 2600, // ⚠️ confirm actual chainId
  accounts: [process.env.PRIVATE_KEY!],
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {},
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.PRIVATE_KEY && { kasplexTestnet }),
    ...(process.env.PRIVATE_KEY && process.env.IGRA_API_KEY && { igra }), // ✅ consistent
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
        network: 'igra', // ✅ consistent
        chainId: 2600,
        urls: {
          apiURL: 'https://explorer.igralabs.com/api',
          browserURL: 'https://explorer.igralabs.com',
        },
      },
    ],
  },
  paths: {
    sources: './contracts/',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}
export default config
