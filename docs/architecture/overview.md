# Overview

The project is designed to separate the concerns of Referee System, which is the Web3 protocol, responsible for the core logic of the tournament including the rules, the prize management, and the result verification, on the chain - and the off-chain components, which are responsible for centralized services such as the Relayer Service, Oracle, the API Backend, and the Database. This separation allows for a more modular and scalable architecture, where the on-chain protocol can be developed and maintained independently of the off-chain services.

Regarding the final user platform, we have two options: a Web3 Crypto-based UI and a Web2 Final User Platform. The Web3 Crypto-based UI would be a decentralized application (dApp) that interacts directly with the on-chain protocol, allowing users to participate in tournaments using their crypto wallets. The Web2 Final User Platform, on the other hand, would be a more traditional web application that abstracts away the complexities of blockchain interactions, providing a more user-friendly experience for non-crypto users. This platform would interact with the off-chain services to facilitate tournament participation and management without requiring users to have direct blockchain knowledge or access.

## Diagram

```mermaid
flowchart TD
    subgraph Protocol["Arbiter (Praetor, Referee) Protocol"]
        
        subgraph OnChain["On-Chain Layer"]
            direction TB
            Vault["Vault.sol<br>(Contract that manages the Prize and send it to the winner based on the result of tournament)"]
            Brackets["BracketsEngine.sol<br>(Contract for brackets-based tournament)"]
            RoundRobin["RoundRobinEngine.sol<br>(Contract for round-robin-based tournament)"]
            GenericEngine["<>Engine.sol<br>(Contract for <>-based tournament)"]
            Strategy["EngineStrategy.sol<br>(Contract Interface for different tournament rules engine)"]
            Factory["TournamentFactory.sol<br>(Contract Factory that instantiate all Tournament Engine Contracts)"]
            Solver["IResultSolver.sol<br>(Contract Interface for result solver)"]

            Factory --> Vault
            Factory --> Strategy
            Factory --> Solver
            
            Strategy --> Vault
            Strategy --> Brackets
            Strategy --> RoundRobin
            Strategy --> GenericEngine
            Strategy --> Solver
        end

        subgraph OffChain["Off-Chain Layer"]
            direction LR
            Relayer["RelayerService<br>(communicates with contracts)"]
            OffBackend["Backend<br>(Oracle, CRUD)"]
            OffDB["Database<br>(Postgresql)"]

            Relayer <--> OffBackend
            OffBackend <--> OffDB
        end

        subgraph Web3["Web3 Crypto-based UI Layer"]
            Web3Front["Frontend<br>(Next.js, BFF)"]
        end

        subgraph Web2["Web2 Final User Platform Layer"]
            direction LR
            subgraph Web2Col1[" "]
                style Web2Col1 fill:none,stroke:none
                W2Front["Frontend"]
                W2Back["Backend"]
            end
            subgraph Web2Col2[" "]
                style Web2Col2 fill:none,stroke:none
                W2Adapters["User Friendly Chain Adapters<br>(Embedded Wallets, Account Abstraction, Social Log-in)"]
                W2DB["DB"]
            end
        end

        %% Cross-Layer Connections representing the boundary arrows
        Relayer <-->| | Factory
        Web3Front <-->| | Relayer
        W2Adapters <-->| | OffDB
    end
    
    %% Layer Styling to match diagram colors
    style OnChain stroke:#9042b3,stroke-width:2px,stroke-dasharray: 5 5,fill:none
    style OffChain stroke:#0071c5,stroke-width:2px,stroke-dasharray: 5 5,fill:none
    style Web3 stroke:#d62828,stroke-width:2px,stroke-dasharray: 5 5,fill:none
    style Web2 stroke:#2a9d8f,stroke-width:2px,stroke-dasharray: 5 5,fill:none
    style Protocol stroke:#333,stroke-width:1px,stroke-dasharray: 2 2,fill:none
    
    %% Node Styling (Rounded rectangles matching the image)
    classDef default fill:#fff,stroke:#0071c5,stroke-width:1px,color:#0071c5,rx:10,ry:10
    class Vault,Brackets,RoundRobin,GenericEngine,Strategy,Factory,Solver onchainNode
    classDef onchainNode fill:#fff,stroke:#9042b3,stroke-width:1px,color:#9042b3
    
    class Web3Front web3Node
    classDef web3Node fill:#fff,stroke:#d62828,stroke-width:1px,color:#d62828
    
    class W2Front,W2Back,W2Adapters,W2DB web2Node
    classDef web2Node fill:#fff,stroke:#2a9d8f,stroke-width:1px,color:#2a9d8f
```