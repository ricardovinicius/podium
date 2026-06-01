CREATE TABLE "judges" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"wallet" varchar(42) NOT NULL,
	"status" varchar(50) DEFAULT 'Registered' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"match_index" integer NOT NULL,
	"winner" varchar(42),
	"is_finalized" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"wallet" varchar(42) NOT NULL,
	"seed" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"onchain_id" integer,
	"contract_address" varchar(42),
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Created' NOT NULL,
	"prize" varchar(255) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verdicts" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"judge_wallet" varchar(42) NOT NULL,
	"winner_wallet" varchar(42) NOT NULL,
	"tx_hash" varchar(66) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "judges" ADD CONSTRAINT "judges_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verdicts" ADD CONSTRAINT "verdicts_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;