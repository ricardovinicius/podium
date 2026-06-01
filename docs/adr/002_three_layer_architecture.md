# ADR 002 — Three-Layer Architecture Boundary (Protocol, SDK, Applications)

## Status
Accepted

## Context
The Arbiter Protocol (Referee System) was originally conceived as a two-layer system: the "On-Chain Layer" (smart contracts) and the "Off-Chain Layer" (relayer, oracle, database). 

As we refine the design for broader use cases beyond our initial application (Podium), this two-layer model creates a tension: if the backend and relayer are part of the protocol, the protocol is no longer fully trustless, and it forces a specific UX pattern on all applications built on top of it. Some applications might want direct wallet interactions (crypto-native), while others might want a gasless relayer or account abstraction.

We need to define clear boundaries between what constitutes the trustless protocol, what is shared tooling, and what is application-specific infrastructure.

## Decision
We are adopting a **three-layer architecture**:

1. **Protocol Layer (On-Chain Only)**: The Referee System protocol is strictly the set of immutable smart contracts (Factory, Vault, Strategies, Solvers). It is the sole source of truth and has zero off-chain dependencies.
2. **SDK Layer (Shared Tooling)**: An npm package containing bracket generation logic, contract interaction wrappers (via Viem), and event parsing utilities. This reduces boilerplate but is not part of the trusted protocol.
3. **Application Layer (Off-Chain)**: Applications (like Podium) are built on top of the protocol. Each application owns its backend, database, and frontend, and makes its own choices about how to route transactions (e.g., direct MetaMask calls vs. backend relayers).

## Alternatives Considered
- **Protocol = On-Chain + Standard Relayer**: We considered shipping a standard backend relayer as part of the protocol to ensure gasless transactions out-of-the-box. We rejected this because it introduces centralization (who runs the relayer?) and compromises the "trustless finality" guarantee if the system depends on off-chain components to function.

## Consequences
### Positive
- **Guaranteed Trustless Finality**: By keeping the protocol fully on-chain, we ensure that no single entity can alter results or freeze funds. The protocol works even if all application backends go down.
- **Application Flexibility**: Different apps can choose different UX models. Podium uses direct MetaMask interactions, while future apps could use relayers or account abstraction without needing protocol changes.
- **Clearer Mental Model**: Developers integrating with the system know exactly where the trust boundary lies (the contracts).

### Negative
- **More Work for App Builders**: Applications that want gasless UX must build or integrate their own relayers, rather than getting one for free from the protocol.
- **Duplicated Infrastructure**: Multiple applications might end up building similar event indexers and databases (though the SDK mitigates this somewhat).

### Neutral
- For our first application (Podium), the backend acts as a read-only indexer and API server, while the frontend handles all on-chain transactions directly via MetaMask.

## References
- [Architecture Overview](../architecture/overview.md)
- [README.md](../../README.md)
- [Spec 002 — Traversal Prototype](../../specs/002_traversal_prototype.md)
