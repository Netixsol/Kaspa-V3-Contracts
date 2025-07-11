import { tryVerify } from '@kasplex/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  KaspaV3PoolDeployer: require('../artifacts/contracts/KaspaV3PoolDeployer.sol/KaspaV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  KaspaV3Factory: require('../artifacts/contracts/KaspaV3Factory.sol/KaspaV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  // Use existing deployed KaspaV3PoolDeployer
  let KaspaV3PoolDeployer_address = '0xf7558bD5C46f0906809E920619B1f058a2B3e959'
  let KaspaV3PoolDeployer

  // KaspaV3PoolDeployer deployment code (commented out for future reference)
  /*
  const KaspaV3PoolDeployerFactory = new ContractFactory(
    artifacts.KaspaV3PoolDeployer.abi,
    artifacts.KaspaV3PoolDeployer.bytecode,
    owner
  )
  if (!KaspaV3PoolDeployer_address) {
    KaspaV3PoolDeployer = await KaspaV3PoolDeployerFactory.deploy()

    KaspaV3PoolDeployer_address = KaspaV3PoolDeployer.address
    console.log('KaspaV3PoolDeployer', KaspaV3PoolDeployer_address)
  } else {
    KaspaV3PoolDeployer = new ethers.Contract(
      KaspaV3PoolDeployer_address,
      artifacts.KaspaV3PoolDeployer.abi,
      owner
    )
  }
  */

  // Create contract instance for existing KaspaV3PoolDeployer
  KaspaV3PoolDeployer = new ethers.Contract(
    KaspaV3PoolDeployer_address,
    artifacts.KaspaV3PoolDeployer.abi,
    owner
  )

  // Use existing deployed KaspaV3Factory
  let kaspaV3Factory_address = '0x71a6A2cbf1b7bAEaa53643E4456A90F4Cbf6C216'
  let kaspaV3Factory

  // KaspaV3Factory deployment code (commented out for future reference)
  /*
  if (!kaspaV3Factory_address) {
    console.log('Deploying KaspaV3Factory...')
    const KaspaV3Factory = new ContractFactory(
      artifacts.KaspaV3Factory.abi,
      artifacts.KaspaV3Factory.bytecode,
      owner
    )
    kaspaV3Factory = await KaspaV3Factory.deploy(KaspaV3PoolDeployer_address)
    await kaspaV3Factory.deployed()

    kaspaV3Factory_address = kaspaV3Factory.address
    console.log('KaspaV3Factory deployed at:', kaspaV3Factory_address)
  } else {
    kaspaV3Factory = new ethers.Contract(kaspaV3Factory_address, artifacts.KaspaV3Factory.abi, owner)
  }
  */

  // Create contract instance for existing KaspaV3Factory
  kaspaV3Factory = new ethers.Contract(kaspaV3Factory_address, artifacts.KaspaV3Factory.abi, owner)

  // Set FactoryAddress for KaspaV3PoolDeployer.
  console.log('Setting factory address in KaspaV3PoolDeployer...')
  const tx = await KaspaV3PoolDeployer.setFactoryAddress(kaspaV3Factory_address)
  await tx.wait()
  console.log('Factory address set successfully')

  const contracts = {
    KaspaV3Factory: kaspaV3Factory_address,
    KaspaV3PoolDeployer: KaspaV3PoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
