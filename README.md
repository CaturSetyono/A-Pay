# AgentPay — AI Agent Payment & Escrow Skill

### Universal, Composable Value Exchange Skill for Autonomous AI Agents on the Pharos Network

AgentPay is a production-ready **AI Agent Skill (Tool)** designed to give autonomous AI agents the native ability to transact, lock funds in escrows, verify transaction statuses, and securely trade services on-chain without human intermediaries. 

Instead of building custom payment scripts, developer swarms can register the **AgentPay Skill** directly into their agents' toolsets (e.g., in frameworks like Mastra, LangChain, or AutoGen) enabling LLMs to execute secure Web3 financial tasks via native **Function Calling**.

---

## 🚀 The AgentPay Skill Ecosystem

The `agentpay-pharos` SDK acts as the execution layer that connects AI agents to the **Pharos Network** on-chain escrow contracts.

```text
       ┌────────────────────────┐
       │   AI Agent (LLM Core)  │
       └───────────┬────────────┘
                   │  Function Calling / Tool Execution
                   ▼
       ┌────────────────────────┐
       │  AgentPay SDK (Skill)  │
       └───────────┬────────────┘
                   │  On-Chain Escrow Calls
                   ▼
       ┌────────────────────────┐
       │ Pharos Escrow Contract │
       └────────────────────────┘
```

---

## 📦 Skill Installation

Install the compiled, type-safe AgentPay skill package into your agent project workspace:

```bash
npm install agentpay-pharos
# or using pnpm
pnpm add agentpay-pharos
```

---

## 💡 Detailed Features of the `agentpay-pharos` Skill

The AgentPay Skill encapsulates complex blockchain mechanics into clean, deterministic actions that LLMs can reason about:

1. **Auto-Approvals for Tokens**: Agents don't need to write separate token allowance validation. The SDK automatically verifies allowances for ERC20 tokens and executes approval transactions in a single workflow.
2. **On-Chain Escrow Creation (`createEscrow`)**: Safely lock native ETH/PHAROS or ERC20 tokens in a contract with a defined duration.
3. **Decentralized Escrow Release (`releaseEscrow`)**: The paying agent releases locked funds directly to the provider once the task's deliverables pass validation.
4. **Conditional Refund / Cancellation (`cancelEscrow`)**:
   * **Receiver (Service Provider)** can cancel and refund the payer at any time if they reject the task.
   * **Payer (Client Agent)** can cancel and reclaim funds automatically *after* the lock duration has expired.
5. **Asynchronous Verification (`verifyTransaction`)**: Allows verifying transaction receipts and block confirmations on-chain to ensure payment execution.

---

## 🛠️ Registering the Skill in AI Agents (Function Calling)

AI Agents interact with the physical world by selecting "Tools" from their schema. Below is the JSON Schema definition for registering the **AgentPay Skill** within LLMs (like Gemini, GPT-4, or Claude):

### Tool Schema Example
```json
{
  "name": "createEscrow",
  "description": "Lock funds inside the Pharos AgentPay Escrow contract for a task. Returns the unique escrowId and transaction hash.",
  "parameters": {
    "type": "object",
    "properties": {
      "receiver": {
        "type": "string",
        "description": "The target Ethereum/Pharos wallet address of the service provider agent."
      },
      "amount": {
        "type": "string",
        "description": "The exact amount of tokens/ETH to lock (e.g., '1.5')."
      },
      "token": {
        "type": "string",
        "description": "The ERC20 contract address, or '0x0000000000000000000000000000000000000000' for native Pharos network token."
      },
      "lockDuration": {
        "type": "integer",
        "description": "Timeout duration in seconds after which the payer can cancel and refund."
      }
    },
    "required": ["receiver", "amount", "token"]
  }
}
```

---

## 💻 SDK Integration Example

Import the skill client and instantiate it using a standard Web3 provider or signer (such as an agent's private key wallet):ga 

```typescript
import { AgentPay } from "agentpay-pharos";
import { ethers } from "ethers";

// 1. Initialize the AgentPay Skill
const agentPaySkill = new AgentPay({
  contractAddress: "0x6EdcBd7A221CbA379Fe5eD54cad0A02B403a054D",
  signerOrProvider: agentWalletSigner
});

// 2. Lock funds inside the Escrow (Executes auto-approvals if using ERC20)
const escrow = await agentPaySkill.createEscrow({
  receiver: "0x_receiver_agent_address",
  amount: "1.0",
  token: ethers.ZeroAddress, // Native ETH/PHAROS
  lockDuration: 3600         // 1 hour lock timeout
});

console.log(`Locked Escrow ID: ${escrow.escrowId}`);

// 3. Release funds (Called by Payer Agent upon task completion)
await agentPaySkill.releaseEscrow({ escrowId: escrow.escrowId });
```

---

## 📂 Repository Structure

This workspace is managed as a `pnpm` monorepo:

* [`/packages/agentpay-sdk`](file:///E:/smweb/phaaros/packages/agentpay-sdk) - The compiled core SDK/Skill source code (`agentpay-pharos`).
* [`/contracts/escrow`](file:///E:/smweb/phaaros/contracts/escrow) - Smart contracts (`AgentPayEscrow.sol`) and Hardhat unit tests.
* [`/examples`](file:///E:/smweb/phaaros/examples) - Runnable multi-agent simulations (Research Agent, Marketplace Agent, Trading Agent).
* [`/apps/landing`](file:///E:/smweb/phaaros/apps/landing) - Astro docs, architecture pages, and an interactive simulator playground.

---

## 🧪 Running AI Agent Simulations & Tests

You can run the simulated agents locally by spinning up a local hardhat RPC node:

### 1. Compile & Test Smart Contracts
```bash
pnpm install
pnpm --filter agentpay-contracts compile
pnpm --filter agentpay-contracts test
```

### 2. Build the Skill SDK
```bash
pnpm --filter agentpay-pharos build
```

### 3. Run Agent Simulations
Open two terminals:

**Terminal 1 (Local Node)**:
```bash
cd contracts/escrow
npx hardhat node
```

**Terminal 2 (Deploy & Run)**:
```bash
# 1. Deploy the contract locally
npx hardhat run scripts/deploy.ts --network localhost

# 2. Export the deployed contract address
# On Windows PowerShell:
$env:CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
# On Linux/macOS:
export CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# 3. Execute the simulation scripts
pnpm --filter example-research-agent start
pnpm --filter example-marketplace-agent start
pnpm --filter example-trading-agent start
```

---

## 📄 License

This project is licensed under the MIT License.
