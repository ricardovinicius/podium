export const TournamentABI = [
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "judge",
        "type": "address"
      }
    ],
    "name": "JudgeRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "matchIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "name": "MatchFinalized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PrizePaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prize",
        "type": "uint256"
      }
    ],
    "name": "TournamentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tournamentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "matchIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "judge",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "name": "VerdictSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "bracket",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "judges",
        "type": "address[]"
      }
    ],
    "name": "createTournament",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tId",
        "type": "uint256"
      }
    ],
    "name": "getBracket",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nodeIndex",
        "type": "uint256"
      }
    ],
    "name": "getWinner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "matchConsensus",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "matchData",
    "outputs": [
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isFinalized",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextTournamentId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "matchIndex",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "name": "submitVerdict",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tournamentBrackets",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tournamentJudgeCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "tournamentJudges",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tournaments",
    "outputs": [
      {
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "prize",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numParticipants",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "bracketLength",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "verdictCounts",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "verdicts",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
