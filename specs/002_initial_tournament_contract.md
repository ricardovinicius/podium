# Initial Tournament Smart Contract

## Summary
Define the basic requirements for the initial tournament smart contract. It establishes a bracket-style tournament with a prize, players, and judges to determine match winners.

## Goals
- Create a smart contract to manage a bracket tournament.
- Accept a validated list of player addresses and a list of judges on startup.
- Fund a prize (in ETH for now) by the deployer at initialization.
- Distribute the prize to the final winner once all matches are concluded.

## Non-Goals
- Support for non-power-of-2 number of players (only power of 2 for now).

## Requirements
### Functional
- **Initialization & Validation**: 
  - The player array length must be exactly a power of 2 (e.g., 2, 4, 8, 16).
  - Player and judge addresses must not be the zero address (`0x0`), and duplicate addresses must be rejected.
- **Bracket Creation**: Based on the initial order of players introduced (e.g., [A, B, C, D] means A vs B, and C vs D).
- **Match Voting & Progression**:
  - Match winners are decided by a **majority vote** of the judges (i.e., `(total judges / 2) + 1` votes).
  - No ties allowed; the number of judges must be odd and at least 1.
  - As soon as a player reaches a majority of votes, the match immediately concludes and the contract automatically advances the winner to the appropriate parent match's slot for the next round.
- **Tournament Completion**: The tournament ends and the prize is automatically sent to the winner when the final match is concluded.
- **Rules Enforcement**:
  - Only authorized judges (from the initialization list) are permitted to vote; unauthorized votes must revert.
  - The vote of a judge on a match must be for one of the two players actively in that specific match.
  - The match being voted on must have two players determined and ready to play.
  - A match that has already concluded (reached a majority) cannot accept further votes.

### Non-Functional
- Gas efficiency: Use an optimized data structure, such as an array-based binary tree, to store the state of the matches and minimize gas usage.

## On-Chain (if applicable)
- The contract will hold ETH for the prize and transfer it to the winner upon tournament completion.
- Optimized storage data structures for matches.

## Testing Plan
- **Unit Tests**: Minimum 95% code coverage for the contract code.
- **Integration Tests**: End-to-end flow coverage from deployment to the winner being decided and the prize being sent.
