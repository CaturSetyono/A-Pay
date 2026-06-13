# PRD — AgentPay

## Universal Payment & Escrow Skill for Autonomous AI Agents on Pharos

Version: 1.0

Status: Development PRD

Owner: Team AgentPay

Hackathon: Pharos Skill-to-Agent Dual Cascade (Phase 1)

---

# 1. Project Overview

## Project Name

AgentPay

## Tagline

Universal Payment & Escrow Skill for Autonomous AI Agents on Pharos

## Goal

Build a reusable, composable, production-ready payment skill that enables AI Agents to:

* Send on-chain payments
* Verify transactions
* Create escrow agreements
* Release escrow funds
* Track payment status

The skill must be reusable by any AI Agent operating on Pharos.

---

# 2. Problem Statement

AI Agents can reason, generate content, automate workflows, and make decisions.

However, most AI Agents cannot securely exchange value with other agents.

Every developer currently needs to build payment infrastructure from scratch.

This creates:

* duplicated work
* inconsistent implementations
* poor interoperability
* weak composability

Pharos aims to build an AI Agent Economy.

An economy requires trusted payment infrastructure.

AgentPay provides this missing layer.

---

# 3. Success Criteria

The project is successful when:

* SDK can be installed via npm
* Escrow contract deployed on Pharos
* Demo successfully creates escrow
* Demo successfully releases escrow
* Transaction verification works
* Landing page documents entire flow
* Example integrations provided

---

# 4. Product Scope

## In Scope

### SDK

* Payment execution
* Payment verification
* Escrow creation
* Escrow release

### Smart Contract

* Escrow creation
* Escrow release
* Escrow cancellation

### Landing Page

* Product explanation
* Architecture
* Installation
* Documentation
* Demo flows

### Examples

* Research Agent
* Marketplace Agent
* Trading Agent

---

## Out of Scope

For Phase 1:

* Agent marketplace
* Autonomous trading
* DAO governance
* Cross-chain payments
* Subscription payments
* Multi-signature wallets

---

# 5. User Stories

## AI Agent Developer

As a developer

I want to install AgentPay

So that my agent can perform on-chain payments.

---

## Marketplace Builder

As a builder

I want escrow support

So that two agents can transact safely.

---

## Research Agent

As an AI agent

I want to pay another agent

So that I can acquire services.

---

# 6. Core Architecture

```text
AI Agent
    │
    ▼
AgentPay SDK
    │
    ▼
AgentPay Service Layer
    │
    ▼
Escrow Smart Contract
    │
    ▼
Pharos Network
```

---

# 7. Repository Structure

Monorepo architecture required.

```text
agentpay/
│
├── apps/
│   │
│   └── landing/
│
├── packages/
│   │
│   └── agentpay-sdk/
│
├── contracts/
│   │
│   └── escrow/
│
├── examples/
│   │
│   ├── marketplace-agent/
│   ├── research-agent/
│   └── trading-agent/
│
├── docs/
│
├── .github/
│
└── README.md
```

---

# 8. Technology Stack

## Landing Page

Framework:
Astro

Styling:
TailwindCSS

Deployment:
Vercel

---

## SDK

Language:
TypeScript

Build Tool:
tsup

Package Manager:
pnpm

Publish:
npm

---

## Smart Contract

Language:
Solidity

Framework:
Hardhat

Network:
Pharos

---

# 9. NPM Package

Package Name

```bash
agentpay-pharos
```

Install

```bash
npm install agentpay-pharos
```

Example

```typescript
import { AgentPay } from "agentpay-pharos";
```

---

# 10. SDK API Specification

## createEscrow

Purpose:

Lock funds inside escrow.

Input

```typescript
{
 payer: string;
 receiver: string;
 amount: string;
 token: string;
}
```

Output

```typescript
{
 escrowId: string;
 status: "locked";
 txHash: string;
}
```

---

## releaseEscrow

Purpose:

Release funds to receiver.

Input

```typescript
{
 escrowId: string;
}
```

Output

```typescript
{
 status: "released";
 txHash: string;
}
```

---

## cancelEscrow

Purpose:

Cancel escrow.

Input

```typescript
{
 escrowId: string;
}
```

Output

```typescript
{
 status: "cancelled";
}
```

---

## verifyTransaction

Input

```typescript
{
 txHash: string;
}
```

Output

```typescript
{
 confirmed: boolean;
 blockNumber: number;
}
```

---

# 11. Smart Contract Requirements

Contract Name

AgentPayEscrow

Responsibilities:

* Hold funds
* Release funds
* Cancel escrow
* Emit events

Events:

```solidity
EscrowCreated
EscrowReleased
EscrowCancelled
```

---

# 12. Escrow Lifecycle

```text
Create Escrow
      │
      ▼
Locked
      │
      ▼
Release
      │
      ▼
Completed
```

Alternative:

```text
Create Escrow
      │
      ▼
Locked
      │
      ▼
Cancel
      │
      ▼
Refunded
```

---

# 13. Landing Page Requirements

Framework:

Astro

Styling:

TailwindCSS

No React unless absolutely necessary.

---

# 14. Landing Page Pages

## Home

Route:

```text
/
```

Contains:

* Hero
* Features
* Architecture
* Escrow Flow
* SDK Installation
* CTA

---

## Documentation

Route

```text
/docs
```

Contains:

* SDK API
* Examples
* Contract Docs

---

## Playground

Route

```text
/playground
```

Contains:

* Escrow Simulator
* Transaction Verification Demo

---

## Architecture

Route

```text
/architecture
```

Contains:

* System Diagram
* Smart Contract Flow
* Agent Integration Flow

---

# 15. Home Page Sections

## Hero

Headline

```text
Powering the AI Agent Economy on Pharos
```

Subheadline

```text
A reusable payment and escrow skill
for autonomous AI agents.
```

Buttons

```text
Get Started

View Documentation

GitHub
```

---

## Problem Section

Explain:

AI agents can think.

AI agents can act.

But AI agents cannot safely transact.

---

## Solution Section

Explain:

AgentPay provides payment and escrow infrastructure.

---

## Features Section

Cards:

* Payment Execution
* Transaction Verification
* Smart Escrow
* Agent SDK

---

## Architecture Section

Visual diagram.

---

## Installation Section

Show npm installation.

---

## Example Usage Section

Show code examples.

---

## CTA Section

Direct users to GitHub.

---

# 16. Example Integrations

## Research Agent

Research completed.

↓

Payment released.

---

## Marketplace Agent

Task accepted.

↓

Escrow created.

↓

Task completed.

↓

Escrow released.

---

## Trading Agent

Signal verified.

↓

Payment executed.

---

# 17. Documentation Requirements

Must include:

* Installation
* SDK Reference
* Escrow Flow
* Contract Architecture
* Examples
* FAQ

---

# 18. Deployment

Landing

Vercel

---

Contract

Pharos Network

---

SDK

NPM Registry

---

# 19. Milestones

Milestone 1

Repository setup

---

Milestone 2

Escrow contract

---

Milestone 3

SDK implementation

---

Milestone 4

Examples

---

Milestone 5

Landing page

---

Milestone 6

Documentation

---

Milestone 7

Deployment

---

# 20. Deliverables

Required:

* Landing Page
* SDK
* Smart Contract
* Documentation
* Examples
* GitHub Repository
* NPM Package
* Deployment on Pharos

The project must be usable by third-party AI Agent developers with minimal setup.
