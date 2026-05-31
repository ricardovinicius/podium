# Overview

This project is a Web 3 decentralized, game-agnostic infrastructure layer built to orchestrate tournaments and automate trustless prize distribution. By decoupling tournament progression logic from outcome verification, the protocol allows organizers to lock prize pools in secure on-chain vaults that can only be unlocked via modular resolvers—such as multi-sig human judges, automated data APIs, or community voting. Designed to bridge the gap between cryptographic security and mainstream usability, it utilizes a high-performance off-chain relayer and account abstraction to provide esports, tabletop, and real-world event organizers with a seamless, tamper-proof system for managing competitive events.

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

- Node.js 20+
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
