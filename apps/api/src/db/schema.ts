import { pgTable, serial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  onchainId: integer('onchain_id'), // Set when deployed
  contractAddress: varchar('contract_address', { length: 42 }), // Set when deployed
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('Created'), // Created, InProgress, Completed
  prize: varchar('prize', { length: 255 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id).notNull(),
  wallet: varchar('wallet', { length: 42 }).notNull(),
  seed: integer('seed').notNull(),
});

export const judges = pgTable('judges', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id).notNull(),
  wallet: varchar('wallet', { length: 42 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('Registered'),
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id).notNull(),
  matchIndex: integer('match_index').notNull(),
  winner: varchar('winner', { length: 42 }),
  isFinalized: boolean('is_finalized').notNull().default(false),
});

export const verdicts = pgTable('verdicts', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  judgeWallet: varchar('judge_wallet', { length: 42 }).notNull(),
  winnerWallet: varchar('winner_wallet', { length: 42 }).notNull(),
  txHash: varchar('tx_hash', { length: 66 }).notNull(),
});
