// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Tournament is ReentrancyGuard {
    uint256 public nextTournamentId;

    struct TournamentData {
        address organizer;
        uint256 prize;
        uint256 numParticipants; // N
        uint256 bracketLength;   // 2N - 1
        bool isCompleted;
    }

    struct MatchData {
        address winner;
        bool isFinalized;
    }

    mapping(uint256 => TournamentData) public tournaments;
    mapping(uint256 => address[]) public tournamentBrackets;
    mapping(uint256 => mapping(address => bool)) public tournamentJudges;
    mapping(uint256 => uint256) public tournamentJudgeCount;

    // tId => matchIndex => MatchData
    mapping(uint256 => mapping(uint256 => MatchData)) public matchData;
    // tId => matchIndex => current unanimous candidate
    mapping(uint256 => mapping(uint256 => address)) public matchConsensus;
    // tId => matchIndex => judge => voted winner
    mapping(uint256 => mapping(uint256 => mapping(address => address))) public verdicts;
    // tId => matchIndex => winner => vote count
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public verdictCounts;

    event TournamentCreated(uint256 indexed tournamentId, address indexed organizer, uint256 prize);
    event JudgeRegistered(uint256 indexed tournamentId, address indexed judge);
    event VerdictSubmitted(uint256 indexed tournamentId, uint256 indexed matchIndex, address indexed judge, address winner);
    event MatchFinalized(uint256 indexed tournamentId, uint256 indexed matchIndex, address winner);
    event PrizePaid(uint256 indexed tournamentId, address indexed winner, uint256 amount);

    function createTournament(address[] calldata bracket, address[] calldata judges) external payable nonReentrant {
        uint256 bracketLen = bracket.length;
        uint256 n = (bracketLen + 1) / 2;
        
        require(n > 0 && (n & (n - 1)) == 0, "Non-power-of-two participants");
        require(bracketLen == 2 * n - 1, "Invalid bracket length");
        require(judges.length > 0, "No judges");

        uint256 tId = nextTournamentId++;
        TournamentData storage t = tournaments[tId];
        t.organizer = msg.sender;
        t.prize = msg.value;
        t.numParticipants = n;
        t.bracketLength = bracketLen;

        for (uint256 i = 0; i < bracketLen; i++) {
            tournamentBrackets[tId].push(bracket[i]);
        }

        for (uint256 i = 0; i < judges.length; i++) {
            require(!tournamentJudges[tId][judges[i]], "Duplicate judge");
            tournamentJudges[tId][judges[i]] = true;
            emit JudgeRegistered(tId, judges[i]);
        }
        tournamentJudgeCount[tId] = judges.length;

        emit TournamentCreated(tId, msg.sender, msg.value);
    }

    function submitVerdict(uint256 tId, uint256 matchIndex, address winner) external nonReentrant {
        TournamentData storage t = tournaments[tId];
        require(t.organizer != address(0), "Tournament does not exist");
        require(!t.isCompleted, "Tournament completed");
        require(tournamentJudges[tId][msg.sender], "Not a judge");
        require(matchIndex < t.numParticipants - 1, "Not an internal node");
        require(!matchData[tId][matchIndex].isFinalized, "Match already finalized");
        require(verdicts[tId][matchIndex][msg.sender] == address(0), "Already voted");

        uint256 leftChild = 2 * matchIndex + 1;
        uint256 rightChild = 2 * matchIndex + 2;
        address leftWinner = getWinner(tId, leftChild);
        address rightWinner = getWinner(tId, rightChild);
        
        require(leftWinner != address(0) && rightWinner != address(0), "Child matches not resolved");
        require(winner == leftWinner || winner == rightWinner, "Invalid winner");

        address currentConsensus = matchConsensus[tId][matchIndex];
        require(currentConsensus == address(0) || currentConsensus == winner, "Judges disagree");
        if (currentConsensus == address(0)) {
            matchConsensus[tId][matchIndex] = winner;
        }

        verdicts[tId][matchIndex][msg.sender] = winner;
        uint256 count = ++verdictCounts[tId][matchIndex][winner];

        emit VerdictSubmitted(tId, matchIndex, msg.sender, winner);

        uint256 requiredQuorum = (tournamentJudgeCount[tId] / 2) + 1;
        if (count >= requiredQuorum) {
            matchData[tId][matchIndex].isFinalized = true;
            matchData[tId][matchIndex].winner = winner;
            emit MatchFinalized(tId, matchIndex, winner);

            if (matchIndex == 0) {
                t.isCompleted = true;
                uint256 prize = t.prize;
                if (prize > 0) {
                    (bool success, ) = winner.call{value: prize}("");
                    require(success, "Transfer failed");
                }
                emit PrizePaid(tId, winner, prize);
            }
        }
    }

    function getWinner(uint256 tId, uint256 nodeIndex) public view returns (address) {
        TournamentData storage t = tournaments[tId];
        require(t.organizer != address(0), "Tournament does not exist");
        require(nodeIndex < t.bracketLength, "Invalid node index");

        if (nodeIndex >= t.numParticipants - 1) {
            return tournamentBrackets[tId][nodeIndex];
        } else {
            if (!matchData[tId][nodeIndex].isFinalized) return address(0);
            return matchData[tId][nodeIndex].winner;
        }
    }

    function getBracket(uint256 tId) external view returns (address[] memory) {
        return tournamentBrackets[tId];
    }
}
