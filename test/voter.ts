import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import {
  deployTestVe,
  deployTokenTest,
  deployVoter,
  deployWhitelistVoting,
} from "../scripts/deployHelpters";
import { TokenTest, VeTest, Voter, WhitelistVoting } from "../typechain";
import { expect } from "chai";

describe("Voter", async () => {
  let me: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let ve: VeTest;
  let token: TokenTest;
  let voter: Voter;
  let whitelistVoting: WhitelistVoting;

  let minSubmissionPower = BigNumber.from(1);
  let minVotes = BigNumber.from(1);
  let minSupportVotes = BigNumber.from(1);

  let poolId1 = BigNumber.from(1);
  let poolId2 = BigNumber.from(2);

  let day = 86400;
  let week = day * 7;

  let veTokenId1 = BigNumber.from(1);
  let veTokenId2 = BigNumber.from(2);
  let veTokenId1TotalPower = BigNumber.from("1000000000000000000000");
  let vetTokenId2TotalPower = BigNumber.from("500000000000000000000");

  async function getCurrentTimeStamp(): Promise<number> {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    return blockBefore.timestamp;
  }

  async function setTimeToNextThursdayMidnight() {
    let currentTimeStamp = await getCurrentTimeStamp();
    let remainingToNextWeek = week - (currentTimeStamp % week);
    await network.provider.send("evm_mine", [
      currentTimeStamp + remainingToNextWeek,
    ]); // Thursday 00:00 UTC
  }

  async function increaseTime(increaseAmount: number) {
    let before = await getCurrentTimeStamp();
    await network.provider.send("evm_mine", [before + increaseAmount]);
  }

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
    await whitelistVoting.submitLending(poolId1, veTokenId1);
    await whitelistVoting.connect(user1).submitLending(poolId2, veTokenId2);
    await whitelistVoting.vote(poolId1, [veTokenId1], ["2"]);
    await network.provider.send("evm_increaseTime", [86400 * 7]); // 1 week
    await whitelistVoting.execute(poolId1); // pool 1 will be approved
    await whitelistVoting.execute(poolId2); // pool 2 will be rejected
  }
  before(async () => {
    [me, user1, user2] = await ethers.getSigners();
    token = await deployTokenTest();
    ve = await deployTestVe(token.address);
    whitelistVoting = await deployWhitelistVoting(
      ve.address,
      minSubmissionPower,
      minVotes,
      minSupportVotes,
      me.address
    );
    await setupUserVotingPowers(); // lock veTOKENS
    await setupWhitelist(); // approve lending #1, reject lending #2
    voter = await deployVoter(ve.address, whitelistVoting.address);
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
  it("should return 0 power used in active period if tokenId not yet vote", async () => {
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
});
