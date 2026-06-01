# ADR 003: Deferring Stalled Tournament Escape Hatches

## Status
Accepted

## Context
The Traversal Prototype (Referee System) relies on a ≥51% unanimous judge quorum to progress matches and eventually pay out the tournament prize. During the design phase, a risk was identified: if judges fail to reach quorum (due to split votes, going offline, or malice), the tournament could stall indefinitely. This would result in the prize funds being permanently locked in the smart contract.

## Decision
We will **ignore this risk for the prototype phase** and not implement an emergency escape hatch, organizer override, or timeout/refund mechanism.

## Consequences
- **Positive:** Reduces the complexity of the smart contract significantly. Allows us to focus purely on the core "happy path" logic of bracket progression and judge voting.
- **Negative (Tech Debt):** If deployed to a real network with real funds, there is a severe risk of locked capital. 

This is explicitly documented as **technical debt**. Before any production release, a mechanism (such as a timeout function allowing the organizer to refund the prize, or a dispute escalation layer) MUST be implemented to prevent indefinite fund locking.
