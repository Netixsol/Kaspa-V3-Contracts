import { verifyContract } from '@kasplex/common/verify'
import { sleep } from '@kasplex/common/sleep'
import { configs } from '@kasplex/common/config'
import { network } from 'hardhat'

async function main() {
  const networkName = network.name
  // const config = configs[networkName as keyof typeof configs]

  // if (!config) {
  //   throw new Error(`No config found for network ${networkName}`)
  // }
  const deployedContracts_v3_core = await import(`@kasplex/v3-core/deployments/${networkName}.json`)
  const deployedContracts_v3_periphery = await import(`@kasplex/v3-periphery/deployments/${networkName}.json`)

  // Verify swapRouter
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_v3_periphery.SwapRouter, [
    deployedContracts_v3_core.KaspaV3PoolDeployer,
    deployedContracts_v3_core.KaspaV3Factory,
    deployedContracts_v3_periphery.WETH9,
  ])
  await sleep(10000)

  // Verify NFTDescriptor
  console.log('Verify NFTDescriptor')
  await verifyContract(deployedContracts_v3_periphery.NFTDescriptor)
  await sleep(10000)

  // Verify NFTDescriptorEx
  console.log('Verify NFTDescriptorEx')
  await verifyContract(deployedContracts_v3_periphery.NFTDescriptorEx)
  await sleep(10000)

  // Verify nonfungibleTokenPositionDescriptor
  console.log('Verify nonfungibleTokenPositionDescriptor')
  await verifyContract(deployedContracts_v3_periphery.NonfungibleTokenPositionDescriptor, [
    deployedContracts_v3_periphery.WETH9,
    '0x4b41530000000000000000000000000000000000000000000000000000000000', // asciiStringToBytes32('KAS')
    deployedContracts_v3_periphery.NFTDescriptorEx,
  ])
  await sleep(10000)

  // Verify NonfungiblePositionManager
  console.log('Verify NonfungiblePositionManager')
  await verifyContract(deployedContracts_v3_periphery.NonfungiblePositionManager, [
    deployedContracts_v3_core.KaspaV3PoolDeployer,
    deployedContracts_v3_core.KaspaV3Factory,
    deployedContracts_v3_periphery.WETH9,
    deployedContracts_v3_periphery.NonfungibleTokenPositionDescriptor,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
