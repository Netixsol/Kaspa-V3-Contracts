import { ethers, network } from 'hardhat'
import { configs } from '@kasplex/common/config'
import { tryVerify } from '@kasplex/common/verify'
import fs from 'fs'
import { abi } from '@kasplex/v3-core/artifacts/contracts/KaspaV3Factory.sol/KaspaV3Factory.json'

import { parseEther } from 'ethers/lib/utils'
const currentNetwork = network.name

async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@kasplex/v3-core/deployments/${networkName}.json`)
  const mcV3DeployedContracts = await import(`@kasplex/masterchef-v3/deployments/${networkName}.json`)

  const kaspaV3Factory_address = v3DeployedContracts.KaspaV3Factory

  const KaspaV3LmPoolDeployer = await ethers.getContractFactory('KaspaV3LmPoolDeployer')
  const kaspaV3LmPoolDeployer = await KaspaV3LmPoolDeployer.deploy(mcV3DeployedContracts.MasterChefV3)

  console.log('kaspaV3LmPoolDeployer deployed to:', kaspaV3LmPoolDeployer.address)

  const kaspaV3Factory = new ethers.Contract(kaspaV3Factory_address, abi, owner)

  await kaspaV3Factory.setLmPoolDeployer(kaspaV3LmPoolDeployer.address)

  const contracts = {
    KaspaV3LmPoolDeployer: kaspaV3LmPoolDeployer.address,
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
