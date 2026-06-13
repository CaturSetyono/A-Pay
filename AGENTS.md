# AGENTS.md

## Repository overview

pnpm monorepo for AgentPay — payment & escrow SDK + Solidity contracts on the Pharos network. Four workspace areas:

| Workspace | Package name | Tool |
|---|---|---|
| `packages/agentpay-sdk` | `agentpay-pharos` | tsup (ESM + CJS + DTS) |
| `contracts/escrow` | `agentpay-contracts` | Hardhat (Solidity 0.8.24) |
| `apps/landing` | `landing` | Astro 6 + Tailwind |
| `examples/*` | `example-*-agent` | ts-node scripts |

## Commands

```bash
pnpm install                       # install all workspaces
pnpm --filter agentpay-contracts compile   # compile Solidity
pnpm --filter agentpay-contracts test      # run Hardhat tests (Chai + hardhat-network-helpers)
pnpm --filter agentpay-pharos build       # build SDK (tsup)
pnpm --filter landing dev                  # Astro dev server on :4321
```

Root `pnpm build` / `pnpm test` run recursively across all workspaces.

## Examples require a local node

The three example agents (`research-agent`, `marketplace-agent`, `trading-agent`) connect to a local Hardhat node. To run them:

1. `cd contracts/escrow && npx hardhat node` (keep running)
2. Deploy: `npx hardhat run scripts/deploy.ts --network localhost`
3. Set `CONTRACT_ADDRESS` env var to the deployed address
4. `pnpm --filter example-research-agent start` (or marketplace / trading)

## SDK architecture

Single-file SDK at `packages/agentpay-sdk/src/index.ts`. Exports:
- `AgentPay` class — wraps ethers.js v6 `Contract` for escrow lifecycle (create, release, cancel, verify, getEscrow)
- ABI constants (`AGENTPAY_ESCROW_ABI`, `ERC20_ABI`)
- TypeScript interfaces for all params/results

The SDK auto-approves ERC20 tokens if allowance is insufficient (no separate approve call needed).

## Contracts

- `AgentPayEscrow.sol` — main escrow contract
- `MockERC20.sol` — test-only ERC20 token
- Tests use `@nomicfoundation/hardhat-network-helpers` for time manipulation (`time.increase`)
- Solidity optimizer enabled (200 runs)
- Artifacts, cache, and typechain-types are gitignored

## Constraints

- Node >= 20.0.0 everywhere; `apps/landing` specifically requires >= 22.12.0
- No linter, formatter, or CI config exists — don't assume one
- Native module builds (`keccak`, `secp256k1`, `esbuild`, `sharp`, `push-wuzz`) are allowed in `pnpm-workspace.yaml`
- Git scripts `amend.sh` and `push.sh` create per-file commits with conventional-commit-style prefixes (`feat`, `test`, `docs`, `chore`, `refactor`, `style`) and auto-push

## Conventions

- SDK uses `ethers.js v6` (not v5) — `ethers.ZeroAddress`, `ethers.parseEther`, BigInt operators
- Contract addresses use `ethers.ZeroAddress` for native token, any ERC20 address for tokens
- `escrowId` is `bytes32`; SDK auto-generates via `ethers.hexlify(ethers.randomBytes(32))` if not provided
