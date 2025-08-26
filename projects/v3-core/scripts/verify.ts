import { verifyContract } from '@kasplex/common/verify'
import { sleep } from '@kasplex/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@kasplex/v3-core/deployments/${networkName}.json`)
  console.log('Deployed contracts:', deployedContracts)
  // Verify KaspaFinanceV3PoolDeployer
  console.log('Verify KaspaFinanceV3PoolDeployer')
  await verifyContract(deployedContracts.default.KaspaV3PoolDeployer)
  await sleep(10000)

  // Verify KaspaV3Factory
  console.log('Verify KaspaV3Factory')
  await verifyContract(deployedContracts.KaspaV3Factory, [deployedContracts.KaspaV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
