# AgentPay

### Universal Payment & Escrow Skill for Autonomous AI Agents on Pharos

AgentPay is a reusable, composable, production-ready payment and escrow framework that enables AI Agents on the Pharos Network to:
* Send on-chain payments
* Verify transaction confirmations
* Lock funds in secure escrow agreements
* Release escrow funds to service providers
* Cancel escrows and reclaim funds after timeouts

---

## Repository Structure

This repository is structured as a `pnpm` monorepo:

* `/apps/landing` - Astro & TailwindCSS website showcasing the product docs and an interactive playground simulator.
* `/packages/agentpay-sdk` - TypeScript SDK client built with `tsup` (exports ESM and CJS).
* `/contracts/escrow` - Hardhat developer suite containing the Solidity `AgentPayEscrow` smart contracts and unit tests.
* `/examples` - Complete, runnable AI agent integration examples (Research, Marketplace, and Trading agents).

---

## Getting Started

### Prerequisites

* Node.js >= 20.0.0
* `pnpm` installed globally (`npm install -g pnpm`)

### 1. Installation

Install all workspace dependencies from the root directory:
```bash
pnpm install
```

### 2. Compile and Test Smart Contracts

Compile the Solidity files and execute the Hardhat test suite:
```bash
pnpm --filter agentpay-contracts compile
pnpm --filter agentpay-contracts test
```

### 3. Build the SDK

Compile the TypeScript SDK files to ESM and CJS formats (emits to `dist/`):
```bash
pnpm --filter agentpay-pharos build
```

### 4. Run AI Agent Simulation Examples

The examples are designed to connect to a local Hardhat node.

1. **Spin up a local Hardhat RPC Node**:
   ```bash
   cd contracts/escrow
   npx hardhat node
   ```

2. **Deploy the contract** (or copy its address):
   Run the deployment script or deploy manually, then export the contract address:
   ```bash
   # Windows PowerShell
   $env:CONTRACT_ADDRESS="0x6EdcBd7A221CbA379Fe5eD54cad0A02B403a054D"
   # Linux/macOS
   export CONTRACT_ADDRESS="0x6EdcBd7A221CbA379Fe5eD54cad0A02B403a054D"
   ```

3. **Execute the simulations**:
   Choose an example and start it:
   ```bash
   pnpm --filter example-research-agent start
   pnpm --filter example-marketplace-agent start
   pnpm --filter example-trading-agent start
   ```

### 5. Run the Landing Page Locally

Start the Astro development server to view the landing page, documentation, and the interactive simulator playground:
```bash
pnpm --filter landing dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## SDK Usage Example

```typescript
import { AgentPay } from "agentpay-pharos";
import { ethers } from "ethers";

const agentPay = new AgentPay({
  contractAddress: "0x6EdcBd7A221CbA379Fe5eD54cad0A02B403a054D",
  signerOrProvider: walletSigner
});

// Lock funds in escrow
const escrow = await agentPay.createEscrow({
  receiver: "0x_receiver_address",
  amount: "1.0",
  token: ethers.ZeroAddress, // Native ETH
  lockDuration: 86400        // 24 hours Lock
});

// Release funds
await agentPay.releaseEscrow({ escrowId: escrow.escrowId });
```

---

## License

This project is licensed under the MIT License.
