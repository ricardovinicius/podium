import { createPublicClient, http } from "viem";
import { config } from "./config.js";
import { TournamentABI } from "@podium/sdk";
import { db } from "./db/index.js";
import { matches, tournaments, verdicts } from "./db/schema.js";
import { eq, and } from "drizzle-orm";
import { tournamentEvents } from "./routes/events.js";

export const publicClient = createPublicClient({
  transport: http(config.rpcUrl),
});

export function startIndexer() {
  console.log("Starting indexer for contract:", config.contractAddress);

  publicClient.watchContractEvent({
    address: config.contractAddress,
    abi: TournamentABI,
    eventName: "VerdictSubmitted",
    onLogs: async (logs) => {
      for (const log of logs) {
        const { tournamentId, matchIndex, judge, winner } = log.args;
        if (tournamentId === undefined || matchIndex === undefined || !judge || !winner) continue;

        // Find the local tournament id mapping
        const tRows = await db.select().from(tournaments).where(eq(tournaments.onchainId, Number(tournamentId)));
        if (tRows.length === 0) continue; // Tournament not linked yet or not ours
        const t = tRows[0];

        // Find or create the match record
        let mRows = await db.select().from(matches).where(
          and(eq(matches.tournamentId, t.id), eq(matches.matchIndex, Number(matchIndex)))
        );
        let matchId: number;
        if (mRows.length === 0) {
          const inserted = await db.insert(matches).values({
            tournamentId: t.id,
            matchIndex: Number(matchIndex),
          }).returning();
          matchId = inserted[0].id;
        } else {
          matchId = mRows[0].id;
        }

        // Insert the verdict
        await db.insert(verdicts).values({
          matchId,
          judgeWallet: judge,
          winnerWallet: winner,
          txHash: log.transactionHash || "",
        });
        console.log(`Indexed Verdict: T${t.id} M${matchIndex} J${judge} W${winner}`);
        tournamentEvents.emit("update", t.id);
      }
    },
  });

  publicClient.watchContractEvent({
    address: config.contractAddress,
    abi: TournamentABI,
    eventName: "MatchFinalized",
    onLogs: async (logs) => {
      for (const log of logs) {
        const { tournamentId, matchIndex, winner } = log.args;
        if (tournamentId === undefined || matchIndex === undefined || !winner) continue;

        const tRows = await db.select().from(tournaments).where(eq(tournaments.onchainId, Number(tournamentId)));
        if (tRows.length === 0) continue;
        const t = tRows[0];

        let mRows = await db.select().from(matches).where(
          and(eq(matches.tournamentId, t.id), eq(matches.matchIndex, Number(matchIndex)))
        );
        if (mRows.length > 0) {
          await db.update(matches).set({
            winner,
            isFinalized: true
          }).where(eq(matches.id, mRows[0].id));
          console.log(`Indexed MatchFinalized: T${t.id} M${matchIndex} W${winner}`);
          tournamentEvents.emit("update", t.id);
        }
      }
    },
  });

  publicClient.watchContractEvent({
    address: config.contractAddress,
    abi: TournamentABI,
    eventName: "PrizePaid",
    onLogs: async (logs) => {
      for (const log of logs) {
        const { tournamentId } = log.args;
        if (tournamentId === undefined) continue;

        await db.update(tournaments)
          .set({ status: "Completed" })
          .where(eq(tournaments.onchainId, Number(tournamentId)));
        console.log(`Indexed PrizePaid: T onchain ${tournamentId} completed`);
        
        const tRows = await db.select().from(tournaments).where(eq(tournaments.onchainId, Number(tournamentId)));
        if (tRows.length > 0) {
          tournamentEvents.emit("update", tRows[0].id);
        }
      }
    },
  });
}
