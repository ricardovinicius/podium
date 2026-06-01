import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "RPC_URL", "CONTRACT_ADDRESS"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = Number.parseInt(process.env.PORT ?? "3001", 10);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number");
}

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port,
  databaseUrl: process.env.DATABASE_URL!,
  rpcUrl: process.env.RPC_URL!,
  contractAddress: process.env.CONTRACT_ADDRESS! as `0x${string}`,
};
