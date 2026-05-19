# AgentPay Landing Page — Design Brief

> **File ini berisi seluruh konten wajib yang harus muncul di website AgentPay.**
> Agent UI Designer tinggal menambahkan brief visual (warna, tipografi, layout, animasi, dll.)
> Semua konten tekstual, fitur, alur, dan informasi teknis SUDAH LENGKAP di bawah ini.
> Jangan menghapus atau mengurangi konten apapun dari file ini saat membuat desain.

---

## 📌 A. Project Identity

| Item | Value |
|---|---|
| **Product Name** | AgentPay |
| **Tagline** | Universal Payment & Escrow Skill for Autonomous AI Agents on Pharos |
| **One-liner** | A reusable payment and escrow skill for autonomous AI agents |
| **Value Prop** | Send on-chain payments, verify transactions, and build trust-free agent agreements |
| **Target Audience** | AI Agent Developers, Web3 Builders, Marketplace Creators |
| **Network** | Pharos Network (EVM-compatible) |
| **License** | MIT License |
| **Badge / Label** | `Pharos Network Skill-to-Agent Dual Cascade` |
| **Repository** | GitHub (monorepo: pnpm workspaces) |
| **Deployment** | Vercel (landing page) |

---

## 📌 B. Navigation (Header)

Semua link berikut WAJIB ada di header navigation:

| Label | Route | Keterangan |
|---|---|---|
| Home | `/` | Halaman utama |
| Docs | `/docs` | Dokumentasi SDK & Protocol |
| Playground | `/playground` | Simulator interaktif escrow & verifikasi |
| Architecture | `/architecture` | Diagram sistem & alur kerja |
| GitHub | `https://github.com` (external link) | Tombol/link ke repo |

---

## 📌 C. Halaman & Konten Per-Halaman

---

### C.1. HOME (`/`)

#### 1. Hero Section
- **Headline:** `Powering the AI Agent Economy on Pharos`
  - Efek gradien pada kata "AI Agent Economy"
- **Subheadline:** `A reusable payment and escrow skill for autonomous AI agents. Send on-chain payments, verify transactions, and build trust-free agent agreements.`
- **CTA Buttons:**
  - `Get Started` → link ke `/docs`
  - `Try Playground` → link ke `/playground`
- **Badge:** Label "Pharos Network Skill-to-Agent dual cascade" dengan dot indikator hijau/cyan

#### 2. Problem & Solution Section
- **Problem Headline:** `The Payment Problem in Agent Workflows`
- **Problem Copy:**
  - AI agents are highly capable—they reason, write code, run analyses, and coordinate. But they are blocked from exchanging value safely.
  - Without secure payments and escrows, agents cannot purchase services from one another. Direct transfers lack completion guarantees, leaving agents vulnerable to dishonest behaviors.
  - Until now, every agent developer has had to rebuild payment pipes from scratch, producing fragmented, insecure value flows.
- **Solution Headline:** `The Solution: AgentPay`
- **Solution Copy:** AgentPay introduces a unified payment and escrow protocol. Agents can lock payments in escrow that are released automatically only upon task validation, or cancelled and refunded after a custom expiration timeout.
- **Solution List Items:**
  - **Trustless Value Exchange:** Payers lock funds; workers deliver; escrow releases on verification.
  - **Expiration Protection:** Timeouts prevent funds from being held indefinitely.
  - **Developer SDK:** Minimal dependencies, direct clean APIs.

#### 3. Features Section
- **Section Headline:** `Built for the Autonomous Economy`
- **Section Subheadline:** `Everything an AI developer needs to enable secure value transfer workflows.`
- **Feature Cards (4 cards):**

| # | Icon (concept) | Title | Description |
|---|---|---|---|
| 1 | Currency / Wallet | Payment Execution | Facilitate instant native and ERC20 token transfers between AI agents on the Pharos Network. |
| 2 | Checkmark / Verify | Transaction Verification | Verify receipts on-chain asynchronously, allowing agents to confirm payments before proceeding. |
| 3 | Shield / Lock | Smart Escrow | Contracts support lock, release, and cancellation rules with block-timestamp refunds. |
| 4 | Code / Brackets | Developer SDK | TypeScript library built with `tsup` exporting clean, typed interfaces for quick agent setups. |

#### 4. Installation Section
- **Headline:** `Install in Seconds`
- **Subheadline:** `Add the skill to any Node.js / TypeScript AI agent project.`
- **Command to display:**
  ```
  npm install @agentpay/pharos
  ```
- **Tombol Copy** (Copy ke clipboard)

#### 5. Code Example Section
- **Headline:** `Simple SDK Integration`
- **Subheadline:** `Create and lock escrows with just a few lines of code.`
- **Code block (language: TypeScript):**
  ```typescript
  import { AgentPay } from "@agentpay/pharos";
  import { ethers } from "ethers";

  // Initialize SDK
  const agentPay = new AgentPay({
    contractAddress: "0x...",
    signerOrProvider: wallet
  });

  // Create an escrow agreement
  const result = await agentPay.createEscrow({
    receiver: "0x_receiver_agent_address",
    amount: "1.5",
    token: ethers.ZeroAddress, // Native ETH
    lockDuration: 86400 // 24 hours lock
  });

  console.log(`Escrow locked! ID: ${result.escrowId}, Tx: ${result.txHash}`);
  ```

#### 6. CTA Section (sebelum footer)
- **Headline:** `Ready to build autonomous value flows?`
- **Subheadline:** `Integrate secure escrows into your Pharos agent architectures today.`
- **Buttons:**
  - `Launch Playground` → link ke `/playground`
  - `Read the Docs` → link ke `/docs`

---

### C.2. DOCS (`/docs`)

Halaman dokumentasi teknis lengkap.

#### Sidebar Navigation (sticky, kiri):
- **Getting Started**
  - Installation
  - Quickstart
- **SDK Reference**
  - AgentPay Config
  - createEscrow()
  - releaseEscrow()
  - cancelEscrow()
  - verifyTransaction()
- **Escrow Lifecycle**
  - Smart Contract
  - State Rules

#### 1. Installation Section
- **Judul:** `Installation`
- **Konten:** Install `@agentpay/pharos` via npm:
  ```
  npm install @agentpay/pharos
  ```

#### 2. Quickstart Section
- **Judul:** `Quickstart`
- **Konten:** Inisialisasi AgentPay client dan verifikasi transaksi.
- **Code example:**
  ```typescript
  import { AgentPay } from "@agentpay/pharos";
  import { ethers } from "ethers";

  const provider = new ethers.JsonRpcProvider("https://rpc.pharos.network");
  const agentPay = new AgentPay({
    contractAddress: "0x_escrow_contract_address",
    signerOrProvider: provider
  });

  // Verify a payment transaction on-chain
  const verification = await agentPay.verifyTransaction({
    txHash: "0x_some_transaction_hash"
  });

  console.log(`Confirmed: ${verification.confirmed}, Block: ${verification.blockNumber}`);
  ```

#### 3. AgentPay Config (Constructor)
- **Table:**

| Parameter | Type | Description |
|---|---|---|
| `contractAddress` | `string` | Address of the deployed `AgentPayEscrow` smart contract. |
| `signerOrProvider` | `Signer \| Provider` | Ethers signer for executing transactions, or provider for read-only actions. |

#### 4. SDK Reference — createEscrow(params)
- **Deskripsi:** Locks funds in a secure escrow. Supports native tokens and ERC20 tokens. If ERC20 is specified, the SDK checks contract allowance and automatically requests an `approve()` transaction first if needed.
- **Parameter Table:**

| Field | Type | Required | Description |
|---|---|---|---|
| `receiver` | `string` | Yes | On-chain wallet address of the worker agent. |
| `amount` | `string` | Yes | Decimal amount of tokens (e.g. `"1.5"`). |
| `token` | `string` | Yes | Address of ERC20 token, or `ZeroAddress` for Native ETH. |
| `escrowId` | `string` | No | 32-byte hex string identifier. Generated randomly if omitted. |
| `lockDuration` | `number` | No | Duration (seconds) before payer can cancel. Defaults to 24 hours (86400). |

- **Returns:**
  ```typescript
  {
    escrowId: string;
    status: "locked";
    txHash: string;
  }
  ```

#### 5. SDK Reference — releaseEscrow(params)
- **Deskripsi:** Releases locked escrow funds directly to the receiver agent. Can only be successfully executed by the original payer agent signer.
- **Parameter:** `escrowId: string`
- **Returns:**
  ```typescript
  {
    status: "released";
    txHash: string;
  }
  ```

#### 6. SDK Reference — cancelEscrow(params)
- **Deskripsi:** Cancels the escrow agreement and refunds all locked tokens to the payer agent. Rules:
  - The **receiver** (worker agent) can trigger cancellation at any time (refunding payer).
  - The **payer** can only trigger cancellation *after* `lockDuration` timeout has passed.
- **Parameter:** `escrowId: string`
- **Returns:**
  ```typescript
  {
    status: "cancelled";
    txHash: string;
  }
  ```

#### 7. SDK Reference — verifyTransaction(params)
- **Deskripsi:** Checks if a transaction has been successfully confirmed and mined on the blockchain.
- **Parameter:** `txHash: string`
- **Returns:**
  ```typescript
  {
    confirmed: boolean;
    blockNumber: number;
  }
  ```

#### 8. Smart Contract Security Design
- The underlying contract `AgentPayEscrow.sol` implements:
  - OpenZeppelin's `ReentrancyGuard` (anti-reentrancy)
  - Checks-effects-interactions pattern
  - `SafeERC20` wrapper for ERC20 transfers
  - Custom errors: `TimeoutNotReached()`
- **Events:** `EscrowCreated`, `EscrowReleased`, `EscrowCancelled`

---

### C.3. ARCHITECTURE (`/architecture`)

#### Header
- **Title:** `System Architecture`
- **Subtitle:** `Deep dive into how AgentPay SDK, smart contract, and autonomous agents interact on the Pharos network.`

#### 1. Protocol Layer Interaction (Main Diagram — tampilan vertikal/layered)

| Layer | Name | Description |
|---|---|---|
| Layer 1 (top) | AI Agent Layer | Autonomous reasoning agents managing task execution and verification. |
| Layer 2 | AgentPay SDK (`@agentpay/pharos`) | TypeScript client wrapper, gas estimation, automatic ERC20 approvals. |
| Layer 3 | AgentPayEscrow Smart Contract | Holds value securely, processes validation commands, manages state. |
| Layer 4 (bottom) | Pharos Network | EVM-compatible layer providing high-speed, secure agent transactions. |

Setiap layer dipisah dengan panah/connector vertikal.

#### 2. Workflow: Payer to Receiver Happy Path
- **Step 1 — Escrow Created:** Payer Agent defines amount, receiver address, lock duration, and transfers tokens to the contract.
- **Step 2 — Verification and Task Execution:** Receiver Agent verifies the funds are locked on-chain via SDK, then starts executing the service.
- **Step 3 — Escrow Released:** Upon checking work quality, Payer Agent triggers fund release. The contract transfers funds to Receiver.

#### 3. Workflow: Escrow Timeout / Dispute Refund
- **Step 1 — Escrow Created:** Payer locks funds with a defined timeout lock duration (e.g. 24 hours).
- **Step 2 — Task Delayed or Stalled:** Receiver Agent fails to deliver the work, or goes offline during the execution phase.
- **Step 3 — Payer Cancels & Reclaims:** Once block-timestamp passes the lock duration timeout, Payer triggers cancellation and reclaims the locked funds.

---

### C.4. PLAYGROUND (`/playground`)

#### Header
- **Title:** `Interactive Playground`
- **Subtitle:** `Simulate real agent escrow value flows and transaction verification directly in the browser.`

#### 1. Escrow Simulator (Client-side simulation — NO real blockchain needed)
- **Form Inputs:**
  - Payer Agent Address (readonly, contoh: `0x7A9D8dE6...E812`)
  - Receiver Agent Address (readonly, contoh: `0x3f5C8e4A...F293`)
  - Amount (ETH) — number input, default `1.5`
  - Timeout (seconds) — number input, default `10`
- **Buttons:**
  - `Lock Escrow Funds` — trigger create escrow
  - `Release` — trigger release escrow (disabled when no active escrow)
  - `Cancel / Refund` — trigger cancel escrow (disabled when no active escrow)
- **On-Chain State Display:**
  - Escrow Status: None / Locked / Released / Cancelled
  - Locked Amount: `0.0 ETH`
  - Time Left: countdown timer
- **SDK Console & Event Logs:** Log area menampilkan simulasi output SDK dan event Contract secara real-time

#### 2. Transaction Verification Demo
- **Input:** Text field untuk Transaction Hash (contoh: `0x7f23a9d8...`)
- **Button:** `Verify`
- **Verification Result (show/hide):**
  - Status: `Transaction Confirmed!` (dengan green indicator dot)
  - Block Number: `14,821,394`
  - Status: `Success (1)`
  - Gas Used: `45,192`
  - Confirmations: `12 block confirmations`

> **Catatan:** Playground menggunakan simulasi client-side (JavaScript murni, tanpa React). Tidak perlu koneksi blockchain sungguhan.

---

## 📌 D. Footer (Semua Halaman)

| Elemen | Konten |
|---|---|
| Logo | AgentPay (sama seperti header) |
| Copyright | `© 2026 AgentPay. Deployed on Pharos Network. MIT License.` |
| Links | Documentation (`/docs`), Playground (`/playground`), Architecture (`/architecture`) |

---

## 📌 E. SEO / Meta

| Halaman | Title | Description |
|---|---|---|
| Home | `AgentPay - Pharos Payment Skill` | Universal Payment & Escrow Skill for Autonomous AI Agents on Pharos |
| Docs | `Documentation | AgentPay - Pharos Payment Skill` | SDK & Protocol Documentation for AgentPay |
| Playground | `Playground | AgentPay - Pharos Payment Skill` | Interactive escrow simulator for AgentPay |
| Architecture | `Architecture | AgentPay - Pharos Payment Skill` | System architecture of AgentPay on Pharos |

---

## 📌 F. Informasi Produk & Teknis (Referensi untuk Copywriting)

Berikut adalah data teknis yang harus TERSIRAT atau TERTULIS di halaman:

### SDK
- **Package name:** `@agentpay/pharos`
- **Language:** TypeScript
- **Build tool:** tsup (ESM + CJS)
- **Dependencies:** ethers.js
- **Class:** `AgentPay`
- **Methods:** `createEscrow()`, `releaseEscrow()`, `cancelEscrow()`, `verifyTransaction()`, `getEscrow()`

### Smart Contract
- **Contract name:** `AgentPayEscrow`
- **Language:** Solidity
- **Framework:** Hardhat
- **Security:** OpenZeppelin `ReentrancyGuard`, `SafeERC20`, checks-effects-interactions
- **States:** None → Locked → Released | None → Locked → Cancelled
- **Events:** `EscrowCreated`, `EscrowReleased`, `EscrowCancelled`
- **Custom errors:** `TimeoutNotReached()`

### Escrow Lifecycle Rules
1. Payer creates escrow dengan amount, receiver, token, dan lockDuration
2. Receiver bisa cancel KAPAN SAJA (refund ke payer)
3. Payer hanya bisa cancel SETELAH lockDuration timeout tercapai
4. Hanya payer yang bisa release escrow
5. Mendukung native token (ETH) dan ERC20

### Contoh Integrasi (untuk referensi konten "Use Cases" atau halaman Examples bila ditambahkan nanti)

#### Research Agent Flow
1. Payer Agent lock 1.0 ETH escrow
2. Research Agent verifikasi escrow on-chain via SDK
3. Research Agent mengerjakan tugas (analisis data, menulis report)
4. Payer Agent verifikasi hasil kerja
5. Payer Agent release escrow → dana diterima Research Agent

#### Marketplace Agent Flow (Refund Scenario)
1. Payer Agent lock 2.5 ETH escrow untuk logo design
2. Worker Agent verifikasi escrow
3. Worker Agent mengalami error (tool crash)
4. Worker Agent cancel escrow → dana refund ke Payer Agent

#### Trading Agent Flow (Transaction Verification)
1. Payer kirim 0.5 ETH ke Trading Agent
2. Trading Agent monitor transaksi via `verifyTransaction()`
3. Trading Agent konfirmasi transaksi di block tertentu
4. Trading Agent release trading signal

### Network
- **Name:** Pharos Network
- **Type:** EVM-compatible L1/L2
- **RPC (contoh):** `https://rpc.pharos.network`

### Repository Structure
```
agentpay/
├── apps/
│   └── landing/         # Astro + TailwindCSS
├── packages/
│   └── agentpay-sdk/   # TypeScript SDK (tsup)
├── contracts/
│   └── escrow/         # Solidity + Hardhat
└── examples/
    ├── research-agent/
    ├── marketplace-agent/
    └── trading-agent/
```

---

## 📌 G. Catatan untuk UI Designer

1. **Semua konten di atas WAJIB muncul** di halaman. Tidak boleh ada yang dihilangkan.
2. Agent UI Designer bebas menentukan: layout grid, spacing, tipografi, warna aksen, efek hover, animasi, ilustrasi, icon, background, dll.
3. **Tech stack landing page:** Astro + TailwindCSS (No React unless absolutely necessary).
4. **Font yang sudah digunakan:** Inter (body), Outfit (heading), JetBrains Mono (code). Boleh diganti asal konsisten.
5. Tema sudah dark mode. Designer bebas menyesuaikan tone warna aksen (cyan/indigo saat ini).
6. Playground adalah client-side simulation (vanilla JS, no React). Boleh di-refactor ke React jika diperlukan.
7. Halaman Docs sidebar navigasi menggunakan anchor link (`#id`) — smooth scroll.
8. Jika designer ingin menambahkan halaman baru (FAQ, Blog, Changelog, dll.) silakan, tapi 4 halaman utama di atas (Home, Docs, Architecture, Playground) WAJIB ada.
9. **File ini adalah sumber kebenaran konten.** Jika ada update PRD atau perubahan konten, file ini yang harus diedit terlebih dahulu.
