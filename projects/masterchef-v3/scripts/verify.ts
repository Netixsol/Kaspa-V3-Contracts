import { verifyContract } from "@kasplex/common/verify";
import { sleep } from "@kasplex/common/sleep";
import { configs } from "@kasplex/common/config";

async function main() {
  const networkName = network.name;
  const config = configs[networkName as keyof typeof configs];

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  const deployedContracts_masterchef_v3 = await import(`@kasplex/masterchef-v3/deployments/${networkName}.json`);
  const deployedContracts_v3_periphery = await import(`@kasplex/v3-periphery/deployments/${networkName}.json`);

  // Verify masterChefV3
  console.log("Verify masterChefV3");
  await verifyContract(deployedContracts_masterchef_v3.MasterChefV3, [
    config.kfc,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
    config.WNATIVE,
  ]);
  await sleep(10000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
