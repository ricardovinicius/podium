## How to Run the API

### Local Development
1. Ensure you have Node.js and pnpm installed.
2. Navigate to the `apps/api` directory:
   ```bash
   cd apps/api
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the API server:
   ```bash
   pnpm start
   ```
5. The API will be running at `http://localhost:3001`. You can test the health endpoint by visiting `http://localhost:3001/health` in your browser or using a tool like curl or Postman.

## Env Vars Setup

```bash
cp .env.example .env
```

Then fill in the required values in the `.env` file based on the placeholders provided in `.env.example`.