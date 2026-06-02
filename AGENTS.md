# On-Chain Contracts and Testing

This project uses Hardhat with TypeScript for on-chain contract development and testing. The `onchain` directory contains the contracts, tests, and configuration for the Hardhat environment.

For Hardhat setup and usage, refer to the [on chain project startup spec](specs/001_on_chain_project_startup.md) which includes details on the on-chain configuration and testing approach. 

For Hardhat documentation, see: https://hardhat.org/llms.txt

## Testing

- We gonna use Solidity tests files (ending with .t.sol) to create unit tests for our contracts. 
- Also we can use TypeScript tests files (ending with .ts in `test/` directory) to create integration tests for our contracts.
- Is necessary to achieve at least 95% code coverage for our contracts.
- We gonna run `pnpm hardhat test --coverage` for all tests or `pnpm hardhat test solidity --coverage` for only solidity tests.

## Deploying Contracts

- We gonna use Hardhat Ignite to deploy our contracts to networks.
