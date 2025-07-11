import { ethers } from 'hardhat'
import KaspaV3PoolArtifact from '../artifacts/contracts/KaspaV3Pool.sol/KaspaV3Pool.json'

const hash = ethers.utils.keccak256(KaspaV3PoolArtifact.bytecode)
console.log(hash)
