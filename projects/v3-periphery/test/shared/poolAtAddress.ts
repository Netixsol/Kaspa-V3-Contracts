import { abi as POOL_ABI } from '@kasplex/v3-core/artifacts/contracts/KaspaV3Pool.sol/KaspaV3Pool.json'
import { Contract, Wallet } from 'ethers'
import { IKaspaV3Pool } from '../../typechain-types'

export default function poolAtAddress(address: string, wallet: Wallet): IKaspaV3Pool {
  return new Contract(address, POOL_ABI, wallet) as IKaspaV3Pool
}
