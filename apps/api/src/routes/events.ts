import { FastifyInstance } from "fastify";
import { EventEmitter } from "node:events";

export const tournamentEvents = new EventEmitter();

export default async function eventRoutes(fastify: FastifyInstance) {
  fastify.get("/:id/events", (request, reply) => {
    const { id } = request.params as { id: string };

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Send an initial ping to establish connection clearly
    reply.raw.write(":\n\n");

    // Keep-alive interval to prevent connections dropping
    const keepAlive = setInterval(() => {
      reply.raw.write(":\n\n");
    }, 15000);

    const onUpdate = (tournamentId: number) => {
      if (tournamentId === Number(id)) {
        reply.raw.write(`data: {"updated": true}\n\n`);
      }
    };

    tournamentEvents.on("update", onUpdate);

    request.raw.on("close", () => {
      clearInterval(keepAlive);
      tournamentEvents.off("update", onUpdate);
    });
  });
}
