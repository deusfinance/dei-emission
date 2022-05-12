import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import {
  deployTestVe,
  deployTokenTest,
  deployVoter,
} from "../scripts/deployHelpters";
import {
  DeiBox,
  Minter__factory,
  TokenTest,
  VeTest,
  Voter,
  WhitelistVoting__factory,
} from "../typechain";
import { expect } from "chai";
import {
  getCurrentTimeStamp,
  increaseTime,
  setTimeToNextThursdayMidnight,
} from "./timeUtils";
import { deployMockContract, MockContract } from "ethereum-waffle";

describe("Voter", async () => {
  let me: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let ve: VeTest;
  let token: TokenTest;
  let voter: Voter;

  let mockMinter: MockContract;
  let mockWhitelistVoting: MockContract;

  let poolId1 = BigNumber.from(1);
  let poolId2 = BigNumber.from(2);
  let poolId3 = BigNumber.from(3);

  let day = 86400;
  let week = day * 7;

  let veTokenId1 = BigNumber.from(1);
  let veTokenId2 = BigNumber.from(2);
  let veTokenId1TotalPower = BigNumber.from("1000000000000000000000"); // 1000 tokens
  let vetTokenId2TotalPower = BigNumber.from("500000000000000000000"); // 500 tokens

  async function setupUserVotingPowers() {
    await ve.connect(me).create_lock(
      veTokenId1TotalPower, // 1000 token #tokenId1
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user1).create_lock(
      vetTokenId2TotalPower, // 500 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
  }
  async function setupWhitelist() {
    await mockWhitelistVoting.mock.getLendingStatus
      .withArgs(poolId1)
      .returns(3); // approve poolId1
    await mockWhitelistVoting.mock.getLendingStatus
      .withArgs(poolId2)
      .returns(2); // reject poolId2
    await mockWhitelistVoting.mock.getLendingStatus
      .withArgs(poolId3)
      .returns(3); // approve poolId3
  }

  async function setupFreshEnvironment() {
    [me, user1, user2] = await ethers.getSigners();

    token = await deployTokenTest();
    ve = await deployTestVe(token.address);

    mockMinter = await deployMockContract(me, Minter__factory.abi);
    mockWhitelistVoting = await deployMockContract(
      me,
      WhitelistVoting__factory.abi
    );

    await setupUserVotingPowers(); // lock veTOKENS
    await setupWhitelist(); // approve pool1, reject pool2

    voter = await deployVoter(
      ve.address,
      mockWhitelistVoting.address,
      mockMinter.address
    );

    await setTimeToNextThursdayMidnight();
  }

  describe("Test Voting Mechanism", async () => {
    before(async () => {
      await setupFreshEnvironment();
    });
    it("should fail to vote if lending is not approved", async () => {
      let voteTx = voter.vote(veTokenId1, [poolId2], ["200"]);
      await expect(voteTx).to.be.revertedWith("Voter: NOT_APPROVED");
    });
    it("should return correct active period in the beginning of the week", async () => {
      await setTimeToNextThursdayMidnight();
      let now = await getCurrentTimeStamp();
      let activePeriod = await voter.getActivePeriod();
      expect(activePeriod).to.equal(now);
    });
    it("should return same active period after five days", async () => {
      let beforePeriod = await voter.getActivePeriod();
      await increaseTime(day * 5);
      let afterPeriod = await voter.getActivePeriod();
      expect(beforePeriod).to.equal(afterPeriod);
    });
    it("should return next active period after 1 week", async () => {
      await setTimeToNextThursdayMidnight();
      let beforePeriod = await voter.getActivePeriod();
      await increaseTime(week);
      let afterPeriod = await voter.getActivePeriod();
      expect(afterPeriod.sub(beforePeriod)).to.equal(week);
    });
    it("should return 0 power used in active period if tokenId not yet voted", async () => {
      let powerUsed = await voter.getPowerUsedInActivePeriod(veTokenId1);
      expect(powerUsed).to.eq(0);
    });
    it("should return used power after vote", async () => {
      let weight = BigNumber.from(10);
      await voter.vote(veTokenId1, [poolId1], [weight]);
      let powerUsed = await voter.getPowerUsedInActivePeriod(veTokenId1);
      expect(weight).to.eq(powerUsed);
    });
    it("should return correct remaining power in active period", async () => {
      let powerUsed = BigNumber.from(10);
      let trueRemainingPower = veTokenId1TotalPower.sub(powerUsed);
      let remainingPower = await voter.getRemainingPowerInActivePeriod(
        veTokenId1
      );
      expect(remainingPower).to.eq(trueRemainingPower);
    });
    it("should return correct power used for negative weights", async () => {
      let weight = BigNumber.from(-10);
      await voter.vote(veTokenId1, [poolId1], [weight]);
      let powerUsed = await voter.getPowerUsedInActivePeriod(veTokenId1);
      expect(BigNumber.from(20)).to.eq(powerUsed); // 10 power used in previous power test + 10 power in this test = 20 power total
    });
    it("vote of one tokenId should not effect powers of other tokens", async () => {
      let powerUsed = await voter.getPowerUsedInActivePeriod(veTokenId2);
      expect(powerUsed).to.eq(0);
    });
    it("vote this period should not effect next week votes", async () => {
      await setTimeToNextThursdayMidnight();
      let powerUsed = await voter.getPowerUsedInActivePeriod(veTokenId1);
      expect(powerUsed).to.eq(0);
    });
    it("should fail to vote with weights exceeding max vote power of user in active period", async () => {
      let weight = vetTokenId2TotalPower.add(1);
      let vote = voter.connect(user1).vote(veTokenId2, [poolId1], [weight]);
      await expect(vote).to.be.revertedWith("Voter: INSUFFICIENT_POWER");
    });
    it("should able to vote if lending is approved", async () => {
      let weight = BigNumber.from(100);
      await voter.connect(user1).vote(veTokenId2, [poolId1], [weight]);
      let lendingVotes = await voter.getLendingVotesInActivePeriod(poolId1);
      expect(lendingVotes).to.eq(weight);
    });
    it("should update total votes correctly", async () => {
      let u1w1 = BigNumber.from(1000);
      let u1w2 = BigNumber.from(-2000);
      let beforeTotalPower = await voter.getTotalPowerInActivePeriod();
      await voter
        .connect(me)
        .vote(veTokenId1, [poolId1, poolId3], [u1w1, u1w2]);

      let totalWeights = await voter.getTotalPowerInActivePeriod();
      expect(totalWeights.sub(beforeTotalPower)).to.eq(u1w1.sub(u1w2));
    });
  });

  describe("Test cap manager", async () => {
    before(async () => {
      await setupFreshEnvironment();
    });
    it("should update total votes correctly");
  });
});
