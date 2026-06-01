import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Tournament", function () {
  async function deployTournamentFixture() {
    const [owner, organizer, judge1, judge2, judge3, p1, p2, p3, p4] = await ethers.getSigners();
    
    const Tournament = await ethers.getContractFactory("Tournament");
    const tournament = await Tournament.deploy();

    return { tournament, owner, organizer, judge1, judge2, judge3, p1, p2, p3, p4 };
  }

  describe("Creation", function () {
    it("Should create a tournament with a valid bracket", async function () {
      const { tournament, organizer, judge1, judge2, judge3, p1, p2, p3, p4 } = await loadFixture(deployTournamentFixture);
      
      const bracket = [
        ethers.ZeroAddress, // 0 (Final)
        ethers.ZeroAddress, // 1 (Semi 1)
        ethers.ZeroAddress, // 2 (Semi 2)
        p1.address,         // 3
        p2.address,         // 4
        p3.address,         // 5
        p4.address          // 6
      ];
      const judges = [judge1.address, judge2.address, judge3.address];
      const prize = ethers.parseEther("1.0");

      await expect(tournament.connect(organizer).createTournament(bracket, judges, { value: prize }))
        .to.emit(tournament, "TournamentCreated")
        .withArgs(0, organizer.address, prize)
        .and.to.emit(tournament, "JudgeRegistered")
        .withArgs(0, judge1.address);

      const tData = await tournament.tournaments(0);
      expect(tData.organizer).to.equal(organizer.address);
      expect(tData.prize).to.equal(prize);
      expect(tData.numParticipants).to.equal(4);
      expect(tData.bracketLength).to.equal(7);
      expect(tData.isCompleted).to.be.false;
      expect(await tournament.tournamentJudgeCount(0)).to.equal(3);
    });

    it("Should reject a bracket with non-power-of-two participants", async function () {
      const { tournament, organizer, judge1, p1, p2, p3 } = await loadFixture(deployTournamentFixture);
      // 3 participants = length 5 (indices 0,1,2,3,4). (5+1)/2 = 3. Not power of 2.
      const bracket = [
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        p1.address,
        p2.address,
        p3.address
      ];
      await expect(
        tournament.connect(organizer).createTournament(bracket, [judge1.address])
      ).to.be.revertedWith("Non-power-of-two participants");
    });
  });

  describe("Match Progression & Verdicts", function () {
    async function deployAndCreate() {
      const fixture = await loadFixture(deployTournamentFixture);
      const { tournament, organizer, judge1, judge2, judge3, p1, p2, p3, p4 } = fixture;
      const bracket = [
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        p1.address,
        p2.address,
        p3.address,
        p4.address
      ];
      const judges = [judge1.address, judge2.address, judge3.address];
      const prize = ethers.parseEther("1.0");
      await tournament.connect(organizer).createTournament(bracket, judges, { value: prize });
      return { ...fixture, prize };
    }

    it("Should allow a judge to submit a verdict and finalize a match at quorum", async function () {
      const { tournament, judge1, judge2, p1 } = await deployAndCreate();

      // Match 1 (Semi 1) has children 3 (p1) and 4 (p2)
      await expect(tournament.connect(judge1).submitVerdict(0, 1, p1.address))
        .to.emit(tournament, "VerdictSubmitted")
        .withArgs(0, 1, judge1.address, p1.address);

      // Match should not be finalized yet
      expect(await tournament.getWinner(0, 1)).to.equal(ethers.ZeroAddress);

      // Judge 2 votes p1 -> Quorum reached (2/3)
      await expect(tournament.connect(judge2).submitVerdict(0, 1, p1.address))
        .to.emit(tournament, "MatchFinalized")
        .withArgs(0, 1, p1.address);

      expect(await tournament.getWinner(0, 1)).to.equal(p1.address);
    });

    it("Should revert if judge votes for an invalid candidate", async function () {
      const { tournament, judge1, p3 } = await deployAndCreate();
      // Match 1 candidates are p1 and p2. p3 is invalid.
      await expect(
        tournament.connect(judge1).submitVerdict(0, 1, p3.address)
      ).to.be.revertedWith("Invalid winner");
    });

    it("Should revert if judges disagree", async function () {
      const { tournament, judge1, judge2, p1, p2 } = await deployAndCreate();
      await tournament.connect(judge1).submitVerdict(0, 1, p1.address);
      await expect(
        tournament.connect(judge2).submitVerdict(0, 1, p2.address)
      ).to.be.revertedWith("Judges disagree");
    });

    it("Should revert if a match is voted out of order", async function () {
      const { tournament, judge1, p1 } = await deployAndCreate();
      // Match 0 (Final) depends on Match 1 and Match 2, which are not resolved yet.
      await expect(
        tournament.connect(judge1).submitVerdict(0, 0, p1.address)
      ).to.be.revertedWith("Child matches not resolved");
    });

    it("Should complete the tournament and payout prize on the final match", async function () {
      const { tournament, judge1, judge2, p1, p3, prize } = await deployAndCreate();

      // Semi 1 (Index 1) -> p1 wins
      await tournament.connect(judge1).submitVerdict(0, 1, p1.address);
      await tournament.connect(judge2).submitVerdict(0, 1, p1.address);

      // Semi 2 (Index 2) -> p3 wins
      await tournament.connect(judge1).submitVerdict(0, 2, p3.address);
      await tournament.connect(judge2).submitVerdict(0, 2, p3.address);

      // Final (Index 0) -> p1 vs p3. p1 wins.
      await tournament.connect(judge1).submitVerdict(0, 0, p1.address);
      
      const p1BalanceBefore = await ethers.provider.getBalance(p1.address);
      const tx = await tournament.connect(judge2).submitVerdict(0, 0, p1.address);
      await expect(tx).to.emit(tournament, "PrizePaid").withArgs(0, p1.address, prize);

      const p1BalanceAfter = await ethers.provider.getBalance(p1.address);
      expect(p1BalanceAfter - p1BalanceBefore).to.equal(prize);

      const tData = await tournament.tournaments(0);
      expect(tData.isCompleted).to.be.true;
    });
  });
});
