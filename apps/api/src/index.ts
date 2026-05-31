import Fastify from "fastify";

import { config } from "./config.js";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
