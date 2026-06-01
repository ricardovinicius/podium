# Overview

This project is a Web 3 decentralized, game-agnostic infrastructure layer built to orchestrate tournaments and automate trustless prize distribution. By decoupling tournament progression logic from outcome verification, the protocol allows organizers to lock prize pools in secure on-chain vaults that can only be unlocked via modular resolvers—such as multi-sig human judges, automated data APIs, or community voting. Designed to bridge the gap between cryptographic security and mainstream usability, it utilizes a high-performance off-chain relayer and account abstraction to provide esports, tabletop, and real-world event organizers with a seamless, tamper-proof system for managing competitive events.

## Referee Protocol

The Referee Protocol is a set of immutable smart contracts that act as the sole source of truth for tournament state, prize custody, and result verification — with no off-chain dependencies. The protocol works even if all backends and frontends go down; any wallet can interact with the contracts directly.

Unlike traditional platforms, the Referee Protocol treats tournament rules and result verification as decoupled, modular components, allowing it to remain entirely game-agnostic. Organizers can define custom tournament formats (e.g., single elimination, round-robin) and plug in various result resolvers—ranging from human judges to automated Oracles—without modifying the underlying protocol. By locking prize pools in secure on-chain vaults that can only be unlocked through verified outcomes, the Referee Protocol ensures trustless finality and eliminates the risk of fraud or manipulation, making it ideal for esports, tabletop, and real-world competitive events.

### Protocol Layer (On-Chain — "The Laws")

The "Source of Truth" composed of immutable smart contracts that manage the protocol's state and assets.
- **Tournament Factory**: Instantiates isolated tournament environments.
- **Engine Strategies**: Modular contracts (Brackets, RoundRobin) that enforce specific tournament formats.
- **The Vault**: A secure, non-custodial contract that locks prize pools, releasing them only when cryptographic proof of a winner is provided.
- **Result Solvers**: An interface-based system (`IResultSolver`) that allows for pluggable verification methods — from manual judges to automated Oracles.

### SDK Layer (Shared Tooling)

A TypeScript library that provides convenience utilities for applications building on the protocol. The SDK is not part of the protocol — it reduces boilerplate without introducing trust assumptions.
- **Bracket generation**: Algorithms to build binary-tree brackets from participant lists.
- **Contract helpers**: Typed wrappers around contract interactions (via Viem).
- **Event indexing**: Utilities to parse and process on-chain events.
- **ABI + Types**: Auto-generated TypeScript types from contract ABIs.

### Application Layer (Off-Chain — "The Execution")

Applications are user-facing products built on top of the protocol using the SDK. Each application owns its backend, database, and frontend — and can make its own technology and UX choices.

Examples of how different applications might interact with the protocol:
- **Direct wallet interaction** (Web3-native): Users sign transactions via MetaMask; the application backend indexes events and serves a queryable API.
- **Backend relayer** (gasless UX): The application relays meta-transactions on behalf of users, so they don't need ETH for gas.
- **Account abstraction** (Web2-friendly): Embedded wallets, social login, and chain adapters abstract away blockchain complexity entirely.

### How it Works

- **Creation**: An organizer deploys a tournament via the Factory, defining the Strategy (Rules) and the Solver (Verification method).
- **Locking**: The prize pool is locked in the Vault at creation.
- **Orchestration**: Applications track match progress by indexing on-chain events, updating their local databases and UIs in real-time.
- **Resolution**: Judges or Oracles submit results through the Solver directly on-chain.
- **Payout**: The Vault validates the submission against the tournament state and automatically triggers the prize distribution to the winner's wallet.

### Why This Design?

- **Trustless Finality**: No single entity can unilaterally change a tournament result or access the prize pool once locked. The protocol has no off-chain dependencies.
- **Game Agnostic**: Whether it's a 1v1 FPS match, a massive tabletop event, or a chess tournament, the system only cares about the Strategy and the Result.
- **Application Freedom**: The protocol doesn't prescribe how users interact. Applications choose their own UX model — direct wallets, relayers, or account abstraction.
- **Developer Friendly**: Extensible via the Engine Strategy pattern, allowing developers to build and plug in their own tournament formats and verification methods.

## Podium 

Podium is the first user-facing application built on top of the Referee Protocol. It serves as a showcase for the protocol's capabilities, providing a polished interface for organizers and participants to create, manage, and compete in tournaments across various games and formats. By leveraging the modular architecture of the Referee Protocol, Podium abstracts away the complexities of blockchain interactions, allowing users to focus on the competitive experience while still benefiting from the security and trustlessness of the underlying protocol.

# Tech Stack

- **Protocol (On-Chain)**: Solidity for smart contract development, deployed on Ethereum or compatible chains. Hardhat for development and testing, with OpenZeppelin libraries for secure contract patterns.
- **SDK**: TypeScript library with Viem for contract interactions, bracket generation algorithms, event parsing utilities, and auto-generated ABI types.
- **Frontend (Podium)**: Next.js with TypeScript, shadcn/ui + Tailwind CSS for UI components, Viem for direct contract interactions via MetaMask.
- **Backend (Podium)**: Fastify for a lightweight and efficient server, with TypeScript for type safety. Drizzle ORM for database management and migrations. Viem for on-chain event indexing.
- **Database**: PostgreSQL for storing tournament data, user profiles, and other relevant information.
- **Testing**: Vitest for unit and integration testing, and Hardhat for smart contract testing.
- **CI/CD**: GitHub Actions for continuous integration and deployment, with automated testing, code quality checks, and deployment automation.
- **Containerization**: Docker for containerizing the application, with Docker Compose for local development and Kubernetes for production deployments.
- **Monitoring**: Prometheus and Grafana for monitoring application performance and health, along with centralized logging using tools like ELK Stack (Elasticsearch, Logstash, Kibana).

# Codebase Architecture and Standards

- Modular Architecture
- Dependency Management
- Code Organization
- Code Style and Formatting
- Documentation Standards
- Testing Standards

# Workflow and Git Standards

- Trunk Based Development
- Conventional Commits
- Pre-commit Hooks
- Code Reviews
- Continuous Integration
- Continuous Deployment

# CI/CD & Deployment Readiness

- Automated Testing
- Code Quality Checks
    - Static Code Analysis
    - Code Coverage
    - Linting
    - Formatting
- Security Scanning (SAST, DAST)
- Containerization and Orchestration
    - Docker (multi-stage builds, best practices)
    - Docker Compose (for local development, and initial staging environments)
    - Kubernetes (for production deployments, and advanced staging environments)
- Deployment Automation 
    - Infrastructure as Code (IaC)
    - Configuration Management
    - Blue-Green Deployments
    - Canary Releases

# Operations and Monitoring

- Logging
- Monitoring
- Observability
- Incident Management

# Documentation and Knowledge Sharing

- `README.md` - Project overview, setup instructions, and usage guidelines
- `CONTRIBUTING.md` - Contribution guidelines for the project
- `/docs/adr/` - Architectural Decision Records 
- `/docs/setup.md` - Local setup and configuration notes

# Repository Structure

- `onchain` - Referee Protocol (Hardhat contracts and tests)
- `packages/sdk` - Shared SDK (bracket generation, contract helpers, event parsing)
- `apps/web` - Podium frontend (Next.js + shadcn/ui)
- `apps/api` - Podium backend (Fastify + Drizzle)
- `docs` - Architecture, ADRs, and project docs
- `specs` - Product and engineering specs

# Getting Started

## Prerequisites

- Node.js 24+
- pnpm 11+
- Docker (optional, for local Postgres + containers)

## Install

```bash
pnpm install
```

## Web

```bash
pnpm --filter ./apps/web... dev
```

## API

```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter ./apps/api... dev
```

## On-chain

```bash
cp onchain/.env.example onchain/.env
pnpm --filter ./onchain... test
```

## Docker Compose

```bash
docker compose up --build
```
