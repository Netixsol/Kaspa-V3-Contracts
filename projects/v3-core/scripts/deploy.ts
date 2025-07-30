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

  let kaspaV3PoolDeployer_address = ''
  let kaspaV3PoolDeployer
  const KaspaV3PoolDeployer = new ContractFactory(
    artifacts.KaspaV3PoolDeployer.abi,
    artifacts.KaspaV3PoolDeployer.bytecode,
    owner
  )
  if (!kaspaV3PoolDeployer_address) {
    kaspaV3PoolDeployer = await KaspaV3PoolDeployer.deploy()

    kaspaV3PoolDeployer_address = kaspaV3PoolDeployer.address
    console.log('kaspaV3PoolDeployer', kaspaV3PoolDeployer_address)
  } else {
    kaspaV3PoolDeployer = new ethers.Contract(
      kaspaV3PoolDeployer_address,
      artifacts.KaspaV3PoolDeployer.abi,
      owner
    )
  }

  let KaspaV3Factory_address = ''
  let kaspaV3Factory
  if (!KaspaV3Factory_address) {
    const KaspaV3Factory = new ContractFactory(
      artifacts.KaspaV3Factory.abi,
      artifacts.KaspaV3Factory.bytecode,
      owner
    )
    kaspaV3Factory = await KaspaV3Factory.deploy(kaspaV3PoolDeployer_address)

    KaspaV3Factory_address = kaspaV3Factory.address
    console.log('KaspaV3Factory', KaspaV3Factory_address)
  } else {
    kaspaV3Factory = new ethers.Contract(KaspaV3Factory_address, artifacts.KaspaV3Factory.abi, owner)
  }

  // Set FactoryAddress for kaspaV3PoolDeployer.
  await kaspaV3PoolDeployer.setFactoryAddress(KaspaV3Factory_address);


  const contracts = {
    KaspaV3Factory: KaspaV3Factory_address,
    KaspaV3PoolDeployer: kaspaV3PoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
