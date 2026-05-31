# Traversal Prototype (Referee System)

## Summary
Build a traversal prototype for a referee system that uses a single smart contract to act as Vault, Rule Engine, and Result Solver for bracketed competitions, while the backend registers participants/judges, relays chain events, and the UI reflects these operations.

## Goals
- Implement a bracket-based competition flow using a single contract that validates results, enforces bracket rules, and pays out the prize.
- Provide backend services to register participants/judges and relay on-chain events to the UI.
- Deliver a UI that reflects state from the backend for participants, brackets, judges, and results.
- Cover core flows with unit and integration tests where applicable.

## Non-Goals
- Production-grade security hardening or audit-level guarantees.
- Multi-chain or cross-chain support.
- Advanced dispute resolution beyond trusted judges.

## Background / Context
- The system relies on a binary-tree bracket where each match depends on winners of prior rounds.
- Judges are trusted actors whose validation is required for results to be finalized.

## User Stories
- As a participant, I want to see the bracket and results so I know who I face next.
- As an organizer, I want to register participants and judges so the tournament can begin.
- As a judge, I want to validate match results to advance winners.
- As a winner, I want the prize to be paid automatically when I win.

## Requirements
### Functional
- **Smart contract**
  - Accept a list of participants that form the leaves of a binary tree bracket.
  - Store and escrow the prize funds.
  - Enforce bracket logic (e.g., semifinals only between winners of quarterfinals, etc.).
  - Support submitting match results for bracket nodes.
  - Require validation from trusted judges before a result is finalized.
  - Automatically transfer the prize to the final winner once the bracket completes.
  - Emit events for participant registration, result submission/validation, and payout.
- **Backend**
  - Store and manage tournaments (create, update status, associate bracket, prize, judges).
  - Register participants and judges.
  - Serve as a relay for on-chain events (index and expose state).
  - Provide API endpoints for frontend consumption (bracket state, participants, judges, results).
  - Mediate chain interactions (submit results, validate results).
- **Frontend**
  - Display tournament list and details (status, prize, bracket).
  - Display participants, bracket tree, match states, and winner.
  - Allow authorized flows for registering participants and judges.
  - Allow judges to validate results via backend relay.

### Non-Functional
- Deterministic bracket validation and consistent state across backend/UI.
- Maintain audit-friendly logs for submissions and validations.
- Avoid storing secrets in the frontend; sensitive operations routed through backend.

## UX / Flow
- Organizer creates a tournament, registers participants and judges.
- Bracket is generated from participants list.
- Judges validate each match result; backend relays updates.
- UI updates bracket progression and announces winner.

## API / Interfaces
- `POST /tournaments` — create tournament.
- `GET /tournaments/:id` — tournament details.
- `POST /participants` — register participant.
- `POST /judges` — register judge.
- `GET /bracket` — current bracket state.
- `POST /matches/:id/result` — submit match result.
- `POST /matches/:id/validate` — judge validation.
- Webhooks or SSE for on-chain event updates (optional).

## Data Model
- Tournaments: id, name, status, prize, bracketId, createdAt.
- Participants: id, wallet, seed/order.
- Judges: id, wallet, status.
- Matches: id, round, participants, winner, status, validations.
- Bracket: root, nodes, completion state.

## On-Chain (if applicable)
- **Contract roles**
  - Vault: holds prize funds.
  - Rule Engine: enforces bracket correctness.
  - Result Solver: finalizes results and payout.
- **Events**
  - `ParticipantRegistered`
  - `JudgeRegistered`
  - `MatchResultSubmitted`
  - `MatchResultValidated`
  - `PrizePaid`
- **Gas considerations**
  - Avoid full tree traversal on-chain; use indexed match nodes.

## Architecture & Components
- Smart contract: bracket + validation + payout.
- Backend: API + event indexer + chain relay.
- Frontend: bracket visualization + admin/judge actions.

## Observability
- Backend logs for match submissions, validations, payouts.
- Indexed on-chain events with timestamped status changes.

## Security & Privacy
- Judges are trusted; ensure only authorized judges can validate.
- Prize funds escrowed; contract must prevent unauthorized withdrawals.
- Backend must validate inputs before relay.

## Rollout Plan
- Prototype environment only; deploy to testnet or local chain.

## Testing Plan
- Unit tests for contract bracket logic and payout.
- Integration tests for backend + chain relay.
- UI integration tests where feasible.

## Risks & Mitigations
- **Incorrect bracket logic** → exhaustive unit tests and round validation rules.
- **Judge misbehavior** → restrict to trusted list; log all actions.
- **State divergence** → backend event indexing with reconciliation on startup.

## Open Questions
- How many judges are required to validate a result (1, quorum, majority)?
- Are participants allowed to submit results or only the backend?
- Should results be immutable once validated or can they be reverted?

## Acceptance Criteria
- Smart contract handles participant list, bracket validation, and prize payout.
- Backend registers participants/judges and exposes bracket state.
- Frontend reflects bracket progression and result validations.
- Unit and integration tests exist for core flows.
