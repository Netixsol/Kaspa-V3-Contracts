/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "solidity-docgen";
import "dotenv/config";

require("dotenv").config({ path: require("find-config")(".env") });

const kasplexTestnet: NetworkUserConfig = {
  url: "https://rpc.kasplextest.xyz",
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
};
const igraCaravel: NetworkUserConfig = {
  url: "https://caravel.igralabs.com:8545",
  chainId: 19416,
  accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  gasPrice: 2000000000000, // 2000 Gwei - minimum required by Igra network
  gas: 2100000,
};

const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ...(process.env.KEY_KASPLEX_TESTNET && { kasplexTestnet }),
    ...(process.env.KEY_KASPLEX_TESTNET && { igraCaravel }),
  },
  etherscan: {
    apiKey: {
      kasplexTestnet: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      igraCaravel: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
    },
    customChains: [
      {
        network: "kasplexTestnet",
        chainId: 167012,
        urls: {
          apiURL: "https://explorer.testnet.kasplextest.xyz/api",
          browserURL: "https://explorer.testnet.kasplextest.xyz",
        },
      },
      {
        network: "igraCaravel",
        chainId: 19416,
        urls: {
          apiURL: "https://explorer.caravel.igralabs.com/api",
          browserURL: "https://explorer.caravel.igralabs.com",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  docgen: {
    pages: "files",
  },
};

export default config;
