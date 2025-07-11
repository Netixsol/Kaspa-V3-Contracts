import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeKaspaV3Pool } from '../../typechain-types/contracts/test/MockTimeKaspaV3Pool'
import { TestERC20 } from '../../typechain-types/contracts/test/TestERC20'
import { KaspaV3Factory } from '../../typechain-types/contracts/KaspaV3Factory'
import { KaspaV3PoolDeployer } from '../../typechain-types/contracts/KaspaV3PoolDeployer'
import { TestKaspaV3Callee } from '../../typechain-types/contracts/test/TestKaspaV3Callee'
import { TestKaspaV3Router } from '../../typechain-types/contracts/test/TestKaspaV3Router'
import { MockTimeKaspaV3PoolDeployer } from '../../typechain-types/contracts/test/MockTimeKaspaV3PoolDeployer'
import KaspaV3LmPoolArtifact from '@kasplex/v3-lm-pool/artifacts/contracts/KaspaV3LmPool.sol/KaspaV3LmPool.json'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: KaspaV3Factory
}

interface DeployerFixture {
  deployer: KaspaV3PoolDeployer
}

async function factoryFixture(): Promise<FactoryFixture> {
  const { deployer } = await deployerFixture()
  const factoryFactory = await ethers.getContractFactory('KaspaV3Factory')
  const factory = (await factoryFactory.deploy(deployer.address)) as KaspaV3Factory
  return { factory }
}
async function deployerFixture(): Promise<DeployerFixture> {
  const deployerFactory = await ethers.getContractFactory('KaspaV3PoolDeployer')
  const deployer = (await deployerFactory.deploy()) as KaspaV3PoolDeployer
  return { deployer }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestKaspaV3Callee
  swapTargetRouter: TestKaspaV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeKaspaV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeKaspaV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeKaspaV3PoolDeployer')
  const MockTimeKaspaV3PoolFactory = await ethers.getContractFactory('MockTimeKaspaV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestKaspaV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestKaspaV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestKaspaV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestKaspaV3Router

  const KaspaV3LmPoolFactory = await ethers.getContractFactoryFromArtifact(KaspaV3LmPoolArtifact)

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer =
        (await MockTimeKaspaV3PoolDeployerFactory.deploy()) as MockTimeKaspaV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string

      const mockTimeKaspaV3Pool = MockTimeKaspaV3PoolFactory.attach(poolAddress) as MockTimeKaspaV3Pool

      await (
        await factory.setLmPool(
          poolAddress,
          (
            await KaspaV3LmPoolFactory.deploy(
              poolAddress,
              ethers.constants.AddressZero,
              Math.floor(Date.now() / 1000)
            )
          ).address
        )
      ).wait()

      return mockTimeKaspaV3Pool
    },
  }
}
