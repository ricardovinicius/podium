# Traversal Prototype (Referee System)

## Summary
Build a traversal prototype spanning all three architectural layers: a smart contract (the Referee System protocol) that acts as Vault, Rule Engine, and Result Solver for bracketed competitions; an SDK for bracket generation and contract interaction helpers; and the Podium application (backend + frontend) that provides tournament management, event indexing, and the user interface.

## Goals
- Implement a bracket-based competition flow using a single contract (the protocol) that validates results, enforces bracket rules, and pays out the prize.
- Provide an SDK with bracket generation and contract interaction utilities.
- Build the Podium application: backend services for tournament management and event indexing, and a frontend for participants, organizers, and judges.
- Cover core flows with unit and integration tests where applicable.

## Non-Goals
- Production-grade security hardening or audit-level guarantees.
- Multi-chain or cross-chain support.
- Advanced dispute resolution beyond trusted judges.

## Background / Context
- The system relies on a binary-tree bracket where each match depends on winners of prior rounds.
- Brackets are generated off-chain by the backend and submitted to the contract to minimize on-chain computation.
- Judges are trusted actors; a match result is finalized when at least 51% of judges validate it with unanimous agreement on the winner.
- Results are immutable once validated.

## User Stories
- As a participant, I want to see the bracket and results so I know who I face next.
- As an organizer, I want to register participants and judges so the tournament can begin.
- As a judge, I want to validate match results to advance winners.
- As a winner, I want the prize to be paid automatically when I win.

## Requirements
### Functional
- **Smart contract**
  - Accept a pre-generated bracket (array-based binary tree), judge addresses, and prize deposit in a single `createTournament(bracket[], judges[])` call from the organizer. All setup is atomic.
  - Reject brackets with non-power-of-two participant counts.
  - Enforce bracket logic (e.g., semifinals only between winners of quarterfinals, etc.).
  - Allow judges to submit their verdict (winner) for a match directly on-chain.
  - Finalize a match result when at least 51% of registered judges have submitted the same winner (quorum with unanimity).
  - Ensure results are immutable once finalized.
  - Automatically transfer the prize to the final winner once the bracket completes.
  - Emit events for tournament creation, judge verdicts, match finalization, and payout.
  - Verify judge identity on-chain via wallet address (`msg.sender`).
- **Backend** (Fastify + Drizzle ORM + Viem)
  - Store and manage tournaments (create, update status, associate bracket, prize, judges).
  - Generate brackets off-chain from the participant list.
  - Register participants and judges.
  - Index on-chain events using Viem and sync state to the database.
  - Provide RESTful API endpoints scoped per tournament for frontend consumption.
  - Note: verdict submission is handled directly by the frontend→contract; the backend only indexes verdict events.
- **Frontend**
  - Display tournament list and details (status, prize, bracket).
  - Display participants, bracket tree, match states, and winner.
  - Allow authorized flows for registering participants and judges.
  - Allow judges to submit verdicts directly to the contract via MetaMask (frontend→contract, no backend relay).
  - Provide contract ABI and address for direct chain interaction.

### Non-Functional
- Deterministic bracket validation and consistent state across backend/UI.
- Maintain audit-friendly logs for submissions and validations.
- Avoid storing secrets in the frontend; sensitive operations routed through backend.

## UX / Flow
1. Organizer creates a tournament and registers participants and judges via the backend API. Tournament status: **Created**.
2. Organizer clicks "Deploy Tournament" in the frontend:
   - Frontend requests the generated bracket and judge list from the backend.
   - Frontend calls `createTournament(bracket[], judges[])` on the contract via MetaMask, attaching the prize as ETH value.
   - Contract validates the bracket (power-of-two), stores bracket + judges, escrows the prize, and emits `TournamentCreated`.
   - Backend indexes the event and updates the tournament status to **InProgress**.
3. Judges submit their verdict for each match by signing transactions directly to the contract via MetaMask; the contract tallies votes and auto-finalizes at quorum.
4. Backend indexes `VerdictSubmitted` and `MatchFinalized` events and updates the database.
5. UI reflects bracket progression in real-time via SSE.
6. When the final match is finalized, the contract pays the winner. Tournament status: **Completed**.

## API / Interfaces
- `GET /tournaments` — list all tournaments.
- `POST /tournaments` — create tournament (backend stores metadata; organizer deploys on-chain separately).
- `GET /tournaments/:id` — tournament details.
- `GET /tournaments/:id/participants` — list participants.
- `POST /tournaments/:id/participants` — register participant.
- `GET /tournaments/:id/judges` — list judges.
- `POST /tournaments/:id/judges` — register judge.
- `GET /tournaments/:id/bracket` — current bracket state.
- `GET /tournaments/:id/matches` — list matches with verdict status.
- SSE `GET /tournaments/:id/events` — real-time on-chain event stream.

> **Note:** Tournament creation and judge verdict submission are direct frontend→contract interactions via MetaMask. The backend does not submit on-chain transactions — it only prepares data (bracket generation) and indexes events.

## Data Model
- **Tournaments**: id, name, status (Created | InProgress | Completed), prize, contractAddress, createdAt.
- **Participants**: id, tournamentId, wallet, seed/order.
- **Judges**: id, tournamentId, wallet, status (Registered | Active | Removed).
- **Matches**: id, tournamentId, round, bracketIndex, participants (array of wallet addresses), winner, status (Pending | Finalized), verdicts (array of `{ judgeWallet, winner, txHash }`).
- Bracket structure is derived from the matches array using array-based binary tree indexing (node `i` has children `2i+1` and `2i+2`).

## On-Chain
- **Contract roles**
  - Vault: holds prize funds deposited by organizer at creation.
  - Rule Engine: enforces bracket correctness on a pre-generated bracket received from the organizer.
  - Result Solver: finalizes results (51% judge quorum with unanimity) and triggers payout.
- **Bracket storage**
  - Array-based binary tree: node `i` has children `2i+1` and `2i+2`.
  - Leaves are participant addresses; internal nodes store match state and winner.
  - Bracket is submitted by the organizer at tournament creation along with the prize deposit.
  - Contract rejects brackets with non-power-of-two participant counts.
- **Access control**
  - Only the organizer (the address that called `createTournament`) is the tournament creator.
  - Bracket, judges, and prize are all set atomically at creation — no post-creation admin functions.
  - Only registered judges can submit verdicts.
- **Judge verdicts**
  - Judges submit their verdict (winner) by signing a transaction directly via MetaMask.
  - Contract verifies `msg.sender` is a registered judge.
  - Each judge can submit one verdict per match.
  - A match is auto-finalized when ≥51% of judges have submitted the same winner.
  - Once finalized, the result is immutable and no further verdicts are accepted.
- **Events**
  - `TournamentCreated(uint256 tournamentId, address organizer, uint256 prize)`
  - `JudgeRegistered(uint256 tournamentId, address judge)`
  - `VerdictSubmitted(uint256 tournamentId, uint256 matchIndex, address judge, address winner)`
  - `MatchFinalized(uint256 tournamentId, uint256 matchIndex, address winner)`
  - `PrizePaid(uint256 tournamentId, address winner, uint256 amount)`
- **Gas considerations**
  - Bracket generated off-chain to avoid on-chain tree construction.
  - Use indexed match nodes; avoid full tree traversal.

## Architecture & Components

The system follows a three-layer architecture (see [architecture overview](../../docs/architecture/overview.md)):

- **Protocol (on-chain)** — Solidity 0.8.24 / Hardhat. The smart contract is the entire protocol: bracket storage, judge verdict tallying, quorum enforcement, and prize payout. It has no off-chain dependencies.
- **SDK (shared tooling)** — TypeScript library. Bracket generation algorithms, Viem-based contract helpers, event parsing, auto-generated ABI types. Used by Podium and available to future applications.
- **Podium (application)**
  - **Backend** (Fastify + Drizzle ORM + PostgreSQL + Viem): REST API for tournament/participant/judge CRUD + on-chain event indexer. The backend never submits on-chain transactions — it only reads.
  - **Frontend** (Next.js + shadcn/ui + Tailwind CSS): bracket visualization, admin/judge actions, MetaMask integration for direct contract calls (tournament creation + verdicts).

## Observability
- Backend logs for judge verdicts, match finalizations, payouts.
- Indexed on-chain events with timestamped status changes.

## Security & Privacy
- Judge authorization is wallet-based: the contract verifies `msg.sender` against the registered judge list. Judges sign transactions via MetaMask — no backend authentication required.
- Prize funds are escrowed in the contract at creation; only the validated final winner can receive the payout.
- Backend must validate inputs before relaying to the chain.
- Results are immutable once the judge quorum (≥51% unanimity) is reached.

## Rollout Plan
- Prototype environment only; deploy to testnet or local chain.

## Testing Plan
- **Contract unit tests** (Hardhat + Chai):
  - Full tournament flow (4 and 8 participants).
  - Bracket submission and validation (including non-power-of-two rejection).
  - Judge quorum enforcement (reject result below 51%, accept at 51%).
  - Unanimity check (reject if judges disagree on winner).
  - Result immutability (reject re-validation of finalized match).
  - Prize payout to final winner.
  - Unauthorized judge rejection.
- **Backend integration tests** (Vitest):
  - CRUD for tournaments, participants, judges, matches.
  - Bracket generation correctness (power-of-two enforcement).
  - Viem chain relay with a local Hardhat node.
- **Frontend**: UI integration tests where feasible.

## Risks & Mitigations
- **Incorrect bracket logic** → exhaustive unit tests and round validation rules.
- **Judge misbehavior** → restrict to trusted list; log all actions.
- **State divergence** → backend event indexing with reconciliation on startup.

## Resolved Decisions
- **Judge verdicts**: Judges submit their verdict (winner) directly on-chain via MetaMask from the frontend. No backend relay. A match is auto-finalized when ≥51% of judges agree on the same winner.
- **No separate result submission**: There is no propose-then-approve flow. Judges are the sole source of truth for match outcomes.
- **Result immutability**: Results are immutable once the judge quorum validates them.
- **Bracket generation**: Off-chain in the backend; organizer submits the pre-generated bracket to the contract at creation.
- **Prize funding**: Organizer deposits the prize into the contract at tournament creation.
- **Tournament creation**: Single atomic `createTournament(bracket[], judges[])` call via MetaMask. Bracket, judges, and prize are all submitted together — no separate `addJudge()` calls.
- **Judge authentication**: Wallet-based via MetaMask (`msg.sender`); no backend auth layer needed.
- **Bracket validation**: Contract rejects non-power-of-two participant counts.
- **Tech stack**: Drizzle ORM for database, Viem for chain interactions, shadcn/ui + Tailwind CSS for frontend components.
- **Frontend → contract**: Both tournament creation and verdict submission are direct frontend→contract calls. The backend never submits on-chain transactions.

## Acceptance Criteria
- Smart contract accepts a pre-generated bracket, enforces 51% judge quorum with unanimity, and pays the prize to the final winner.
- Backend generates brackets off-chain, manages tournaments/participants/judges via Drizzle, and relays chain events via Viem.
- API endpoints are scoped per tournament (`/tournaments/:id/...`) with full CRUD + read support.
- Frontend reflects bracket progression, allows MetaMask-based judge validation, and displays real-time updates.
- Contract unit tests cover quorum logic, immutability, bracket validation, and payout.
- Backend integration tests cover CRUD, bracket generation, and chain relay.
