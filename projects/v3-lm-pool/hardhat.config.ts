import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })

const kasplexTestnet: NetworkUserConfig = {
  url: 'https://rpc.kasplextest.xyz',
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
}
const igraCaravel: NetworkUserConfig = {
  url: "https://caravel.igralabs.com:8545",
  chainId: 19416,
  accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 2000000000000, // 2000 Gwei - minimum required by Igra network
  gas: 2100000,
};}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {},
    ...(process.env.KEY_KASPLEX_TESTNET && { kasplexTestnet }),
    ...(process.env.KEY_KASPLEX_TESTNET && { igraCaravel }),
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
  paths: {
    sources: './contracts/',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}

export default config
