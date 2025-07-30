import bn from "bignumber.js";
import { BigNumber, Contract } from "ethers";
import { ethers, waffle, run } from "hardhat";

const kaspaV3PoolDeployer = '0x238C4b82C5093E00ce44de78701E74d5bDd78634';
const KaspaV3Factory = '0x1b72D7165a0D7256a4F197765C15bb70bC5D66A8';
const swapRouter = '0xcC2c3d5ed3774e363a5E07AddA43ec2D5bE3E38F';
const nftDescriptor = '0x27a8a033863f40890FC5Bcdc288F9cB2aF876793';
const nftDescriptorEx = '0x65C283bE0B7DF3Ef111A87181254CDc9020063D2';
const nonfungibleTokenPositionDescriptor = '0x1346602dB2b30A3e7907bBc08401b92191538098';
const nonfungiblePositionManager = '0x4E25637cF39822364b877F81B18c5B6CF0eeF589';

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

  await run(`verify:verify`, {
    address: swapRouter,
    contract: 'contracts/SwapRouter.sol:SwapRouter',
    constructorArguments: [
      kaspaV3PoolDeployer,
      KaspaV3Factory,
      '0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94 ', //WBNB
    ],
  });

  await run(`verify:verify`, {
    address: nftDescriptor,
    contract: 'contracts/libraries/NFTDescriptor.sol:NFTDescriptor',
    constructorArguments: [],
  });

  await run(`verify:verify`, {
    address: nftDescriptorEx,
    contract: 'contracts/NFTDescriptorEx.sol:NFTDescriptorEx',
    constructorArguments: [],
  });

  // await run(`verify:verify`, {
  //     address: nonfungibleTokenPositionDescriptor,
  //     contract: 'contracts/NonfungibleTokenPositionDescriptor.sol:NonfungibleTokenPositionDescriptor',
  //     constructorArguments: [
  //         '0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94 ', //WBNB
  //         '0x4554480000000000000000000000000000000000000000000000000000000000',
  //         nftDescriptorEx
  //     ],
  // });

  await run(`verify:verify`, {
    address: nonfungiblePositionManager,
    contract: 'contracts/NonfungiblePositionManager.sol:NonfungiblePositionManager',
    constructorArguments: [
      kaspaV3PoolDeployer,
      KaspaV3Factory,
      "0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94 ", // WBNB
      nonfungibleTokenPositionDescriptor,
    ],
  });

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
