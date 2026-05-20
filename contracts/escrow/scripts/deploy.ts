import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AgentPayEscrow contract to local network...");

  const escrow = await ethers.deployContract("AgentPayEscrow");
  await escrow.waitForDeployment();

  console.log(`AgentPayEscrow successfully deployed to: ${await escrow.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
