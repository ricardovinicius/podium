# Overview

This project is a Web 3 decentralized, game-agnostic infrastructure layer built to orchestrate tournaments and automate trustless prize distribution. By decoupling tournament progression logic from outcome verification, the protocol allows organizers to lock prize pools in secure on-chain vaults that can only be unlocked via modular resolvers—such as multi-sig human judges, automated data APIs, or community voting. Designed to bridge the gap between cryptographic security and mainstream usability, it utilizes a high-performance off-chain relayer and account abstraction to provide esports, tabletop, and real-world event organizers with a seamless, tamper-proof system for managing competitive events.

## Referee System

The Referee System is the core decentralized engine of the Arbiter Protocol. It acts as a trustless infrastructure layer designed to orchestrate tournament lifecycles and automate prize distributions without central authority intervention.

Unlike traditional platforms, the Referee System treats tournament rules and result verification as decoupled, modular components, allowing it to remain entirely game-agnostic. Organizers can define custom tournament formats (e.g., single elimination, round-robin) and plug in various result resolvers—ranging from human judges to automated Oracles—without modifying the underlying protocol. By locking prize pools in secure on-chain vaults that can only be unlocked through verified outcomes, the Referee System ensures trustless finality and eliminates the risk of fraud or manipulation, making it ideal for esports, tabletop, and real-world competitive events.

The system is defined by the seamless interaction between its two primary layers:

1. On-Chain Layer (The Laws)

The "Source of Truth" composed of immutable smart contracts that manage the protocol's state and assets.
- Tournament Factory: Instantiates isolated tournament environments.
- Engine Strategies: Modular contracts (Brackets, RoundRobin) that enforce specific tournament formats.
- The Vault: A secure, non-custodial contract that locks prize pools, releasing them only when cryptographic proof of a winner is provided.
- Result Solvers: An interface-based system (IResultSolver) that allows for pluggable verification methods—ranging from manual judges to automated Oracles.

2. Off-Chain Layer (The Execution)

The "Nervous System" built with Hono and Node.js to provide the agency that smart contracts lack.

- Relayer Service: A high-performance daemon that monitors Polygon RPC nodes for on-chain events and triggers necessary off-chain logic.
- Oracle/Backend: Orchestrates game data, manages tournament metadata in PostgreSQL, and feeds verified results back to the IResultSolver on-chain.
- PostgreSQL Database: Provides a high-speed CRUD layer for user profiles, tournament history, and platform-wide analytics.

### How it Works

- Creation: An organizer deploys a tournament via the Factory, defining the Strategy (Rules) and the Solver (Verification method).
- Locking: Participants join, and the prize pool is locked in the Vault.
- Orchestration: The Relayer Service tracks match progress off-chain, updating the local database and the UI in real-time.
- Resolution: Once the final match ends, the Oracle or Judge submits the result through the Solver.
- Payout: The Vault validates the submission against the tournament state and automatically triggers the prize distribution to the winner's wallet.

### Why This Design?

- Trustless Finality: No single entity can unilaterally change a tournament result or access the prize pool once locked.
- Game Agnostic: Whether it's a 1v1 FPS match, a massive tabletop event, or a chess tournament, the system only cares about the Strategy and the Result.
- High Performance: By offloading heavy indexing and CRUD operations to a backend while keeping the value-layer on-chain., we achieve a seamless user experience without sacrificing security or decentralization.
- Developer Friendly: Extensible via the Engine Strategy pattern, allowing developers to build and plug in their own tournament formats and verification methods.

## Podium 

Podium is the first user-facing application built on top of the Referee System. It serves as a showcase for the protocol's capabilities, providing a polished interface for organizers and participants to create, manage, and compete in tournaments across various games and formats. By leveraging the modular architecture of the Referee System, Podium abstracts away the complexities of blockchain interactions, allowing users to focus on the competitive experience while still benefiting from the security and trustlessness of the underlying protocol.

# Tech Stack

- **Frontend**: Next.js with TypeScript for building a responsive and user-friendly interface, utilizing libraries like Redux for state management and Web3.js or Ethers.js for blockchain interactions.
- **Backend**: Fastify for a lightweight and efficient server, with TypeScript for type safety. The backend will handle API requests, business logic, and interactions with the blockchain and database. Drizzle ORM for database management and migrations, and Redis for caching and real-time data handling.
- **Blockchain**: Solidity for smart contract development, deployed on Ethereum or compatible chains. Hardhat for development and testing, with OpenZeppelin libraries for secure contract patterns.
- **Relayer**: A high-performance off-chain relayer built with Node.js, responsible for monitoring on-chain events and orchestrating tournament logic.
- **Database**: PostgreSQL for storing tournament data, user profiles, and other relevant information.
- **Testing**: Jest for unit and integration testing, and Hardhat for smart contract testing.
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

- `apps/web` - Next.js frontend
- `apps/api` - Fastify API
- `onchain` - Hardhat contracts and tests
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
