import { verifyContract } from '@kasplex/common/verify'
import { sleep } from '@kasplex/common/sleep'
import { network } from 'hardhat'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@kasplex/v3-core/deployments/${networkName}.json`)

  // Verify KaspaV3PoolDeployer
  console.log('Verify KaspaV3PoolDeployer')
  await verifyContract(deployedContracts.KaspaV3PoolDeployer)
  await sleep(10000)

  // Verify kaspaV3Factory
  console.log('Verify kaspaV3Factory')
  await verifyContract(deployedContracts.KaspaV3Factory, [deployedContracts.KaspaV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
