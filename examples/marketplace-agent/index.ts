import { ethers } from "ethers";
import { AgentPay } from "agentpay-pharos";

// This script simulates a Marketplace flow where the Worker Agent cannot complete the task
// and voluntarily cancels the escrow to refund the Payer Agent.

async function main() {
  console.log("=== Marketplace Agent Refund Simulation ===");

  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  
  try {
    await provider.getNetwork();
  } catch (error) {
    console.error("Error: Could not connect to local Hardhat node at http://localhost:8545.");
    process.exit(1);
  }

  const accounts = await provider.listAccounts();
  if (accounts.length < 2) {
    process.exit(1);
  }

  const payerSigner = await provider.getSigner(0);
  const workerSigner = await provider.getSigner(1);

  const payerAddress = await payerSigner.getAddress();
  const workerAddress = await workerSigner.getAddress();

  console.log(`Payer Address: ${payerAddress}`);
  console.log(`Worker Address: ${workerAddress}`);

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS environment variable is not set.");
    process.exit(1);
  }

  const payerPay = new AgentPay({
    contractAddress,
    signerOrProvider: payerSigner
  });

  const workerPay = new AgentPay({
    contractAddress,
    signerOrProvider: workerSigner
  });

  // 1. Payer creates Escrow
  console.log("\n[Payer] Creating escrow of 2.5 ETH for logo design task...");
  const escrowId = ethers.hexlify(ethers.randomBytes(32));
  
  const createResult = await payerPay.createEscrow({
    escrowId,
    receiver: workerAddress,
    amount: "2.5",
    token: ethers.ZeroAddress,
    lockDuration: 3600 // 1 hour timeout
  });

  console.log(`[Payer] Escrow locked! Escrow ID: ${createResult.escrowId}`);

  // 2. Worker verifies escrow
  console.log("\n[Worker] Verifying escrow on-chain...");
  const escrowDetails = await workerPay.getEscrow(escrowId);
  console.log("[Worker] Escrow details:", escrowDetails);

  if (escrowDetails.status === "Locked") {
    console.log("[Worker] Escrow confirmed. Starting logo design...");
    
    // Simulate worker hitting an error or needing to reject the task
    console.log("[Worker] Error: Core design tool crashed, cannot deliver task.");
    console.log("[Worker] Cancelling escrow to refund payer...");

    const cancelResult = await workerPay.cancelEscrow({ escrowId });
    console.log(`[Worker] Escrow cancelled and refunded! Tx Hash: ${cancelResult.txHash}`);

    // Verify final state
    const finalDetails = await payerPay.getEscrow(escrowId);
    console.log(`[Simulation] Final Escrow Status: ${finalDetails.status}`);
    console.log("=== Simulation Succeeded ===");
  }
}

main().catch((err) => {
  console.error("Simulation failed:", err);
});
