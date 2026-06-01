import { ethers } from "hardhat";

async function main() {
  const Tournament = await ethers.getContractFactory("Tournament");
  const tournament = await Tournament.deploy();
  await tournament.waitForDeployment();

  const address = await tournament.getAddress();
  console.log(`Tournament protocol deployed to: ${address}`);
  
  // Note: Copy this address to:
  // apps/api/.env (CONTRACT_ADDRESS)
  // apps/web/.env.local (NEXT_PUBLIC_CONTRACT_ADDRESS)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
