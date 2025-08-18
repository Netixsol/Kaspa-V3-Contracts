/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
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

const bscTestnet: NetworkUserConfig = {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
};

const bscMainnet: NetworkUserConfig = {
  url: "https://bsc-dataseed.binance.org/",
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
};

const goerli: NetworkUserConfig = {
  url: "https://rpc.ankr.com/eth_goerli",
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
};

const eth: NetworkUserConfig = {
  url: "https://eth.llamarpc.com",
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
};

const kasplexTestnet: NetworkUserConfig = {
  url: "https://rpc.kasplextest.xyz",
  chainId: 167012,
  accounts: [process.env.PRIVATE_KEY!],
};

// ✅ New: Igra Devnet
// ✅ Igra Network
const igra: NetworkUserConfig = {
  url: `https://devnet.igralabs.com:8545/${process.env.IGRA_API_KEY || "LIVE_API_KEY_HERE"}`,
  chainId: 2600,
  accounts: [process.env.PRIVATE_KEY!],
};


const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    ...(process.env.KEY_KASPLEX_TESTNET && { kasplexTestnet }),
    ...(process.env.IGRA_API_KEY && { igra }), // ✅ Consistent name
  },  
  etherscan: {
    apiKey: {
      bscTestnet: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      bscMainnet: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      goerli: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      mainnet: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      kasplexTestnet: "MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J",
      // no etherscan support for Igra yet
    },
    customChains: [
      {
        network: "kasplexTestnet",
        chainId: 167012,
        urls: {
          apiURL: "https://frontend.kasplextest.xyz/api",
          browserURL: "https://frontend.kasplextest.xyz",
        },
      },
      {
        network: "igra", // ✅ Consistent name
        chainId: 2600,
        urls: {
          apiURL: "https://explorer.devnet.igralabs.com/api", // not sure if API endpoint exists
          browserURL: "https://explorer.devnet.igralabs.com",
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
