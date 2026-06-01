import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { tournaments, participants, judges, matches } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { generateBracket } from "@podium/sdk";

export default async function tournamentRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    const all = await db.select().from(tournaments);
    return all;
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const t = await db.select().from(tournaments).where(eq(tournaments.id, Number(id)));
    if (t.length === 0) return reply.status(404).send({ error: "Not found" });
    return t[0];
  });

  fastify.post("/", async (request, reply) => {
    const { name, prize } = request.body as { name: string; prize?: string };
    const newTournament = await db.insert(tournaments).values({ name, prize: prize ?? "0" }).returning();
    return newTournament[0];
  });

  fastify.post("/:id/participants", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { wallet } = request.body as { wallet: string };
    
    const existing = await db.select().from(participants).where(eq(participants.tournamentId, Number(id)));
    const newP = await db.insert(participants).values({
      tournamentId: Number(id),
      wallet,
      seed: existing.length + 1
    }).returning();
    return newP[0];
  });

  fastify.get("/:id/participants", async (request, reply) => {
    const { id } = request.params as { id: string };
    const all = await db.select().from(participants).where(eq(participants.tournamentId, Number(id)));
    return all;
  });

  fastify.post("/:id/judges", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { wallet } = request.body as { wallet: string };
    
    const newJ = await db.insert(judges).values({
      tournamentId: Number(id),
      wallet
    }).returning();
    return newJ[0];
  });

  fastify.get("/:id/judges", async (request, reply) => {
    const { id } = request.params as { id: string };
    const all = await db.select().from(judges).where(eq(judges.tournamentId, Number(id)));
    return all;
  });

  fastify.get("/:id/bracket", async (request, reply) => {
    const { id } = request.params as { id: string };
    const p = await db.select().from(participants).where(eq(participants.tournamentId, Number(id)));
    const wallets = p.map(x => x.wallet);
    try {
      const bracketArray = generateBracket(wallets);
      return { bracket: bracketArray };
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.post("/:id/link", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { onchainId, contractAddress } = request.body as { onchainId: number, contractAddress: string };
    await db.update(tournaments).set({ onchainId, contractAddress, status: "InProgress" }).where(eq(tournaments.id, Number(id)));
    
    const p = await db.select().from(participants).where(eq(participants.tournamentId, Number(id)));
    const matchCount = p.length - 1;
    
    // Check if matches already exist to avoid duplicates if linked twice
    const existingMatches = await db.select().from(matches).where(eq(matches.tournamentId, Number(id)));
    if (existingMatches.length === 0 && matchCount > 0) {
      const matchInserts = [];
      for (let i = 0; i < matchCount; i++) {
        matchInserts.push({
          tournamentId: Number(id),
          matchIndex: i,
          isFinalized: false
        });
      }
      await db.insert(matches).values(matchInserts);
    }
    
    return { success: true };
  });

  fastify.get("/:id/matches", async (request, reply) => {
    const { id } = request.params as { id: string };
    const all = await db.select().from(matches).where(eq(matches.tournamentId, Number(id)));
    return all;
  });
}
