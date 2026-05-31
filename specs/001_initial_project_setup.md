# Initial Project Setup

## Summary
Establish a monorepo foundation for web, API, and on-chain development using Next.js, Fastify, and Hardhat, with shared tooling, local Docker/Postgres support, and basic CI jobs so the team can build and run the stack consistently.

## Goals
- Provide a working baseline for `apps/web`, `apps/api`, and `onchain` with consistent tooling.
- Enable local development with Docker Compose and Postgres.
- Ensure CI runs lint/test/build on pull requests.
- Document how to run the stack and configure env values.

## Non-Goals
- Implementing product features or business logic.
- Production-grade infrastructure, monitoring, or deployments.
- Advanced security hardening or multi-env configurations.

## Background / Context
- The repository is being initialized and needs a standard structure for web, API, and on-chain work.
- Team needs reproducible local setup and baseline CI to keep standards consistent.

## User Stories
- As a developer, I want a predictable repo structure so I can find and run each service quickly.
- As a developer, I want local Docker + Postgres so I can run the API without manual DB setup.
- As a reviewer, I want CI checks to validate builds/tests on each change.

## Requirements
### Functional
- Use pnpm workspaces for monorepo management.
- `apps/web` initialized with Next.js + TypeScript.
- `apps/api` initialized with Fastify + TypeScript and a `/health` endpoint.
- `onchain` initialized with Hardhat + TypeScript and a sample contract/test.
- Provide `.env.example` files for each project with required config placeholders.
- Provide Dockerfiles for web and api and a `docker-compose.yml` including Postgres.
- Provide a GitHub Actions workflow for lint/test/build.
- Update README/docs with setup instructions and commands.

### Non-Functional
- Baseline scripts should be deterministic and runnable on Linux/macOS.
- CI should complete in a reasonable time for a small repo (<10 minutes).
- Avoid committing secrets; `.env.example` files only contain placeholders.

## UX / Flow
- Web app exposes a default Next.js page (or minimal landing).
- API exposes a `/health` route returning a simple status payload.

## API / Interfaces
- `GET /health` → `{ "status": "ok" }`

## Data Model
- No application-specific data models required for initial setup.
- Postgres configuration placeholders defined for API environment.

## On-Chain (if applicable)
- Sample contract and test included.
- Basic Hardhat config with local network defaults.

## Architecture & Components
- Monorepo structure:
  - `apps/web` (Next.js)
  - `apps/api` (Fastify)
  - `onchain` (Hardhat)
  - shared root tooling/configs

## Observability
- API logs basic request/response info using Fastify defaults.

## Security & Privacy
- No secrets committed; `.env.example` only.
- API should validate env presence at startup where applicable.

## Rollout Plan
- No migration or staged rollout required.

## Testing Plan
- Web: default Next.js lint/test/build (if configured).
- API: unit test for `/health` (if test framework included) or basic build check.
- On-chain: run Hardhat sample test.
- CI runs lint/test/build for each workspace.

## Risks & Mitigations
- Risk: misaligned tooling across packages. Mitigation: shared root config and consistent scripts.
- Risk: slow CI or setup. Mitigation: keep baseline configs minimal.

## Open Questions
- None.

## Acceptance Criteria
- Monorepo with pnpm workspaces and shared configs is committed.
- `apps/web`, `apps/api`, and `onchain` all build successfully.
- `docker-compose.yml` starts web, api, and Postgres locally.
- CI workflow runs lint/test/build on PRs.
- `.env.example` files exist for web, api, and on-chain.
- README/docs contain clear setup instructions.
