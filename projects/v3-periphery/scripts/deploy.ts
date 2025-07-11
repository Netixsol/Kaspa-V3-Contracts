import bn from "bignumber.js";
import { Contract, ContractFactory, utils, BigNumber } from "ethers";
import { ethers, waffle } from "hardhat";
import { linkLibraries } from "../util/linkLibraries";

// For Kasplex testnet - TODO: Deploy a WETH9 contract or get the actual WETH address
const WETH9 = "0x5C8cbE2110865332bB2Ff5B5eC8F3b7688eDbB05"; // Placeholder - replace with actual WETH address

type ContractJson = { abi: any; bytecode: string };
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  SwapRouter: require("../artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  // eslint-disable-next-line global-require
  NFTDescriptor: require("../artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  // eslint-disable-next-line global-require
  NFTDescriptorEx: require("../artifacts/contracts/NFTDescriptorEx.sol/NFTDescriptorEx.json"),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptor: require("../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  // eslint-disable-next-line global-require
  NonfungiblePositionManager: require("../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = waffle.provider;
  console.log("owner", owner.address);

  // Use your deployed v3-core contract addresses
  const KaspaV3PoolDeployer_address = '0xf7558bD5C46f0906809E920619B1f058a2B3e959';
  const kaspaV3Factory_address = '0x71a6A2cbf1b7bAEaa53643E4456A90F4Cbf6C216';

  // Use existing deployed SwapRouter
  const swapRouter_address = '0xE519eF4C3890c65891BC768eb40555dE09Cb43F6';
  
  // SwapRouter deployment code (commented out for future reference)
  /*
  console.log("Deploying SwapRouter...");
  const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner);
  const swapRouter = await SwapRouter.deploy(KaspaV3PoolDeployer_address, kaspaV3Factory_address, WETH9);
  await swapRouter.deployed();
  console.log("swapRouter", swapRouter.address);
  */
  
  // Create contract instance for existing SwapRouter
  const swapRouter = new ethers.Contract(swapRouter_address, artifacts.SwapRouter.abi, owner);
  console.log("Using existing SwapRouter at:", swapRouter_address);

  // Use existing deployed NFTDescriptor
  const nftDescriptor_address = '0xc721befD83fC703F6CEE3FDC6a57999AEa6711a2';
  
  // NFTDescriptor deployment code (commented out for future reference)
  /*
  console.log("Deploying NFTDescriptor...");
  const NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner);
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();
  console.log("nftDescriptor", nftDescriptor.address);
  */
  
  // Create contract instance for existing NFTDescriptor
  const nftDescriptor = new ethers.Contract(nftDescriptor_address, artifacts.NFTDescriptor.abi, owner);
  console.log("Using existing NFTDescriptor at:", nftDescriptor_address);

  // Use existing deployed NFTDescriptorEx
  const nftDescriptorEx_address = '0x0d7BbB9586d7c6ba59FBCc466C532F6ED12C4E86';
  
  // NFTDescriptorEx deployment code (commented out for future reference)
  /*
  console.log("Deploying NFTDescriptorEx...");
  const NFTDescriptorEx = new ContractFactory(
    artifacts.NFTDescriptorEx.abi,
    artifacts.NFTDescriptorEx.bytecode,
    owner
  );
  const nftDescriptorEx = await NFTDescriptorEx.deploy();
  await nftDescriptorEx.deployed();
  console.log("nftDescriptorEx", nftDescriptorEx.address);
  */
  
  // Create contract instance for existing NFTDescriptorEx
  const nftDescriptorEx = new ethers.Contract(nftDescriptorEx_address, artifacts.NFTDescriptorEx.abi, owner);
  console.log("Using existing NFTDescriptorEx at:", nftDescriptorEx_address);

  // Use existing deployed NonfungibleTokenPositionDescriptor
  const nonfungibleTokenPositionDescriptor_address = '0x6255F36479aEa29454f9C2E03086ee9CB4D7F170';
  
  // NonfungibleTokenPositionDescriptor deployment code (commented out for future reference)
  /*
  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor_address,
    }
  );

  console.log("Deploying NonfungibleTokenPositionDescriptor...");
  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    owner
  );
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
    WETH9,
    asciiStringToBytes32('KAS'),
    nftDescriptorEx_address
  );
  await nonfungibleTokenPositionDescriptor.deployed();
  console.log("nonfungibleTokenPositionDescriptor", nonfungibleTokenPositionDescriptor.address);
  */
  
  // Create contract instance for existing NonfungibleTokenPositionDescriptor
  const nonfungibleTokenPositionDescriptor = new ethers.Contract(
    nonfungibleTokenPositionDescriptor_address,
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    owner
  );
  console.log("Using existing NonfungibleTokenPositionDescriptor at:", nonfungibleTokenPositionDescriptor_address);

  // Use existing deployed NonfungiblePositionManager
  const nonfungiblePositionManager_address = '0x1AFCE81090995BDcc93182DF44be1c50D2401256';
  
  // NonfungiblePositionManager deployment code (commented out for future reference)
  /*
  console.log("Deploying NonfungiblePositionManager...");
  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    KaspaV3PoolDeployer_address,
    kaspaV3Factory_address,
    WETH9,
    nonfungibleTokenPositionDescriptor_address
  );
  await nonfungiblePositionManager.deployed();
  console.log("nonfungiblePositionManager", nonfungiblePositionManager.address);
  */
  
  // Create contract instance for existing NonfungiblePositionManager
  const nonfungiblePositionManager = new ethers.Contract(nonfungiblePositionManager_address, artifacts.NonfungiblePositionManager.abi, owner);
  console.log("Using existing NonfungiblePositionManager at:", nonfungiblePositionManager_address);

  // Save deployment addresses
  const contracts = {
    SwapRouter: swapRouter_address,
    NFTDescriptor: nftDescriptor_address,
    NFTDescriptorEx: nftDescriptorEx_address,
    NonfungibleTokenPositionDescriptor: nonfungibleTokenPositionDescriptor_address,
    NonfungiblePositionManager: nonfungiblePositionManager_address,
    WETH9: WETH9,
    KaspaV3PoolDeployer: KaspaV3PoolDeployer_address,
    KaspaV3Factory: kaspaV3Factory_address,
  };

  const fs = require('fs');
  const networkName = 'kasplexTestnet';
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }
  
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2));
  console.log("Deployment addresses saved to deployments/kasplexTestnet.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
