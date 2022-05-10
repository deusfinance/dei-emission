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
  let veTokenId1 = BigNumber.from(1);
  let veTokenId2 = BigNumber.from(2);

  async function setupUserVotingPowers() {
    await ve.connect(me).create_lock(
      BigNumber.from("1000000000000000000000"), // 1000 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user1).create_lock(
      BigNumber.from("500000000000000000000"), // 500 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
  }
  async function setupWhitelist() {
    await whitelistVoting.submitLending(poolId1, veTokenId1);
    await whitelistVoting.connect(user1).submitLending(poolId2, veTokenId2);
    await whitelistVoting.vote(poolId1, [veTokenId1], ["2"]);
    await network.provider.send("evm_increaseTime", [86400 * 7]); // 1 week
    await whitelistVoting.execute(poolId1);
    await whitelistVoting.execute(poolId2);
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
    await setupWhitelist();
  });

  it("Should deploy voter", async () => {
    voter = await deployVoter(ve.address, whitelistVoting.address);
    expect(voter.address).to.not.be.null;
  });
  it("should fail to vote if lending is not approved", async () => {
    let voteTx = voter.vote(veTokenId1, [poolId2], ["200"]);
    await expect(voteTx).to.be.revertedWith("Voter: NOT_APPROVED");
  });
  it("should able to vote if lending is approved", async () => {
    await voter.vote(veTokenId1, [poolId1], ["200"]);
    // todo: check apply amount
  });
});
