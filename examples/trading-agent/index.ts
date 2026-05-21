import { ethers } from "ethers";
import { AgentPay } from "@agentpay/pharos";

// This script simulates a Trading Agent that verifies receipt of a transaction on-chain
// using the verifyTransaction SDK function before executing a trade.

async function main() {
  console.log("=== Trading Agent Transaction Verification Simulation ===");

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
  const tradingSigner = await provider.getSigner(1);

  const payerAddress = await payerSigner.getAddress();
  const tradingAddress = await tradingSigner.getAddress();

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Error: CONTRACT_ADDRESS environment variable is not set.");
    process.exit(1);
  }

  const tradingPay = new AgentPay({
    contractAddress,
    signerOrProvider: tradingSigner
  });

  // 1. Simulate Payer making a payment transaction
  console.log("\n[Payer] Initiating payment for trade signal...");
  const tx = await payerSigner.sendTransaction({
    to: tradingAddress,
    value: ethers.parseEther("0.5")
  });
  console.log(`[Payer] Payment sent! Tx Hash: ${tx.hash}`);

  // 2. Trading Agent monitors and verifies the transaction
  console.log("\n[Trading Agent] Monitoring network for transaction confirmations...");
  
  // Wait for 1 block confirmation
  await tx.wait(1);
  console.log("[Trading Agent] Transaction detected. Verifying confirmation state via SDK...");

  const verifyResult = await tradingPay.verifyTransaction({ txHash: tx.hash });
  console.log("[Trading Agent] SDK Verification Result:", verifyResult);

  if (verifyResult.confirmed) {
    console.log(`[Trading Agent] Transaction confirmed in block ${verifyResult.blockNumber}!`);
    console.log("[Trading Agent] Releasing trading signal: BUY BTC/USD at market price.");
    console.log("=== Simulation Succeeded ===");
  } else {
    console.log("[Trading Agent] Verification failed. Trade aborted.");
  }
}

main().catch((err) => {
  console.error("Simulation failed:", err);
});
