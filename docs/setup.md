# Local Setup

## Workspaces

This repo uses pnpm workspaces. Install all dependencies from the root:

```bash
pnpm install
```

## Environment Configuration

Copy each `.env.example` to `.env` and adjust values as needed.

### Web (`apps/web/.env.example`)

- `NEXT_PUBLIC_API_URL` - Base URL for the API.

### API (`apps/api/.env.example`)

- `PORT` - API port (default 3001)
- `HOST` - Bind host (default 0.0.0.0)
- `DATABASE_URL` - Postgres connection string

### On-chain (`onchain/.env.example`)

- `RPC_URL` - JSON-RPC endpoint (local or remote)
- `PRIVATE_KEY` - Deployer key for configured network

## Running Locally

```bash
pnpm --filter ./apps/web... dev
pnpm --filter ./apps/api... dev
pnpm --filter ./onchain... test
```

## Docker Compose

```bash
docker compose up --build
```
