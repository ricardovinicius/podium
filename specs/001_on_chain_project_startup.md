# On-Chain Project Startup

## Summary
Initial setup of the on-chain environment using Hardhat to support contract development, testing, and deployment.

## Goals
- Establish a reproducible local development environment for smart contracts.
- Integrate Hardhat within the `onchain` directory.
- Use `pnpm` as the package manager for consistency.

## Non-Goals
- Writing feature smart contracts (out of scope for initial setup).
- Deploying to public testnets or mainnet at this stage.

## Background / Context
- Following standard Hardhat setup as per the [Hardhat Getting Started Guide](https://hardhat.org/docs/getting-started.md).

## Requirements
### Functional
- Install Hardhat in the `onchain` folder.
- Initialize a new Hardhat TypeScript project.
- Use `pnpm` for installing dependencies.

## On-Chain (if applicable)
- Set up initial Hardhat configuration.
- Basic setup for contract compilation and testing.

## Architecture & Components
- `onchain/` directory will contain all contracts, deployment scripts, and tests.

## Testing Plan
- Ensure the default Hardhat tests can run successfully to verify the environment.

## Acceptance Criteria
- A developer can compile contracts and run tests in the `onchain` folder successfully using `pnpm`.