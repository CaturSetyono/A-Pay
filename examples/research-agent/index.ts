import { ethers } from "ethers";
import { AgentPay } from "@agentpay/pharos";

// This script simulates a Payer Agent hiring a Research Agent.
// The Payer Agent locks funds in escrow, the Research Agent does the work, and the Payer Agent releases the escrow.

async function main() {
  console.log("=== Research Agent Payment Simulation ===");

  // 1. Setup provider and wallets
  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  
  try {
    // Check if network is running
    await provider.getNetwork();
  } catch (error) {
    console.error("Error: Could not connect to local Hardhat node at http://localhost:8545.");
    console.error("Please run 'npx hardhat node' and deploy the contract first.");
    process.exit(1);
  }

  const accounts = await provider.listAccounts();
  if (accounts.length < 2) {
    console.error("Error: Local node does not have enough default accounts.");
    process.exit(1);
  }

  // We use the Hardhat accounts for Payer and Receiver
  const payerSigner = await provider.getSigner(0);
  const receiverSigner = await provider.getSigner(1);

  const payerAddress = await payerSigner.getAddress();
  const receiverAddress = await receiverSigner.getAddress();

  console.log(`Payer Agent Address: ${payerAddress}`);
  console.log(`Research Agent Address: ${receiverAddress}`);

  // Replace with actual deployed contract address on Hardhat
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS environment variable is not set.");
    console.log("Run with: CONTRACT_ADDRESS=0x... npm start");
    process.exit(1);
  }

  // Initialize AgentPay SDK for the Payer Agent
  const payerPay = new AgentPay({
    contractAddress,
    signerOrProvider: payerSigner
  });

  // Initialize AgentPay SDK for the Research Agent
  const researchPay = new AgentPay({
    contractAddress,
    signerOrProvider: receiverSigner
  });

  // 2. Payer Agent creates Escrow
  console.log("\n[Payer] Creating escrow of 1.0 ETH for research task...");
  const escrowId = ethers.hexlify(ethers.randomBytes(32));
  
  const createResult = await payerPay.createEscrow({
    escrowId,
    receiver: receiverAddress,
    amount: "1.0",
    token: ethers.ZeroAddress, // Native ETH
    lockDuration: 600 // 10 minutes timeout
  });

  console.log(`[Payer] Escrow locked! Tx Hash: ${createResult.txHash}`);
  console.log(`[Payer] Escrow ID: ${createResult.escrowId}`);

  // 3. Research Agent verifies payment
  console.log("\n[Research Agent] Checking escrow status before starting work...");
  const escrowDetails = await researchPay.getEscrow(escrowId);
  console.log(`[Research Agent] Escrow details on-chain:`, escrowDetails);

  if (escrowDetails.status === "Locked" && escrowDetails.amount === ethers.parseEther("1.0").toString()) {
    console.log("[Research Agent] Escrow confirmed! Starting research task...");
    
    // Simulate performing the work
    console.log("[Research Agent] Analyzing data...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("[Research Agent] Writing report...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const researchResult = "RESEARCH REPORT: Pharos is a decentralized network tailored for autonomous agents...";
    console.log(`[Research Agent] Task complete. Result: "${researchResult}"`);

    // 4. Payer Agent verifies result and releases escrow
    console.log("\n[Payer] Verifying research report...");
    if (researchResult.includes("RESEARCH REPORT")) {
      console.log("[Payer] Report is satisfactory. Releasing funds from escrow...");
      
      const releaseResult = await payerPay.releaseEscrow({ escrowId });
      console.log(`[Payer] Escrow released! Tx Hash: ${releaseResult.txHash}`);

      // Verify final status
      const finalDetails = await researchPay.getEscrow(escrowId);
      console.log(`[Simulation] Final Escrow Status: ${finalDetails.status}`);
      console.log("=== Simulation Succeeded ===");
    } else {
      console.log("[Payer] Report was unsatisfactory. Funds remain locked.");
    }
  } else {
    console.log("[Research Agent] Escrow not locked. Work aborted.");
  }
}

main().catch((err) => {
  console.error("Simulation failed:", err);
});
