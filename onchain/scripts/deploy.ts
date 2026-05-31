import { ethers } from "hardhat";

async function main() {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = Math.floor(Date.now() / 1000) + ONE_YEAR_IN_SECS;

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, {
    value: ethers.parseEther("0.01"),
  });

  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${await lock.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
