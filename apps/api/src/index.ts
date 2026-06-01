import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import tournamentRoutes from "./routes/tournaments.js";
import eventRoutes from "./routes/events.js";
import { startIndexer } from "./indexer.js";

const app = Fastify({ logger: true });

app.register(cors, { origin: "*" });

app.get("/health", async () => ({ status: "ok" }));
app.register(tournamentRoutes, { prefix: "/tournaments" });
app.register(eventRoutes, { prefix: "/tournaments" });

const start = async () => {
  try {
    startIndexer();
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
