import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import {
  deployTokenTest,
  deployWhitelistVoting,
  deployTestVe,
} from "../scripts/deployHelpters";
import { TokenTest, VeTest, WhitelistVoting } from "../typechain";

describe("Whitelist", () => {
  let ve: VeTest;
  let token: TokenTest;
  let whitelistVoting: WhitelistVoting;
  let me: SignerWithAddress;

  let minVotes = BigNumber.from("1000000000000000000000");
  let minSupportVotes = BigNumber.from("500000000000000000000");
  let minSubmissionPower = BigNumber.from("500000000000000000000");

  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;

  // test ve token id and pool ids
  let veTokenId1: BigNumber = BigNumber.from(1);
  let veTokenId2: BigNumber = BigNumber.from(2);
  let veTokenId3: BigNumber = BigNumber.from(3);
  let veTokenId4: BigNumber = BigNumber.from(4);

  let poolId1: BigNumber = BigNumber.from(1);
  let poolId2: BigNumber = BigNumber.from(2);
  let poolId3: BigNumber = BigNumber.from(3);

  async function setupUserVotingPowers() {
    await ve.connect(me).create_lock(
      BigNumber.from("1000000000000000000000"), // 1000 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user2).create_lock(
      BigNumber.from("500000000000000000000"), // 500 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user3).create_lock(
      BigNumber.from("5000000000000000000"), // 5 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user4).create_lock(
      BigNumber.from("0"), // 0 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
  }

  before(async () => {
    [me, user2, user3, user4] = await ethers.getSigners();
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
  });
  it("votes on lending #1 should be zero", async () => {
    let totalVotes = await (await whitelistVoting.proposals(poolId1)).votes;
    expect(totalVotes).to.equal(0);
  });
  it("should fail to vote on lending #1 before it's submitted", async () => {
    let voteTx = whitelistVoting
      .connect(me)
      .vote(poolId1, [veTokenId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith(
      "WhitelistVoting: LENDING_NOT_SUBMITTED"
    );
  });
  it("should submit lending #1 for voting", async () => {
    await whitelistVoting.submitLending(poolId1, veTokenId1);
    let status = await (await whitelistVoting.proposals(poolId1)).status;
    expect(status).to.equal(BigNumber.from(1)); // ACTIVE
  });
  it("should fail to submit same lending more than once", async () => {
    let submitTx = whitelistVoting.submitLending(poolId1, veTokenId1);
    await expect(submitTx).to.be.revertedWith(
      "WhitelistVoting: ALREADY_SUBMITTED"
    );
  });
  it("should fail to vote with tokenId that the sender is not owner of has approve of", async () => {
    let voteTx = whitelistVoting
      .connect(user2)
      .vote(poolId1, [veTokenId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith(
      "WhitelistVoting: TOKEN_ID_NOT_APPROVED"
    );
  });
  it("should vote 100 power on lending #1", async () => {
    let votingWeight = BigNumber.from(100);
    await whitelistVoting
      .connect(me)
      .vote(poolId1, [veTokenId1], [votingWeight]);
    let pool1Votes = await whitelistVoting.getTotalVotesOfLending(poolId1);
    expect(votingWeight).to.equal(pool1Votes);
  });
  it("should vote -10 power on lending #2", async () => {
    await whitelistVoting
      .connect(user2)
      .vote(poolId1, [veTokenId2], [BigNumber.from(-10)]);

    let pool1Votes = await whitelistVoting.getTotalVotesOfLending(poolId1);
    expect(pool1Votes).to.be.equal(BigNumber.from(90));
  });
  it("should fail to vote on lending #2 ", async () => {
    let voteTx = whitelistVoting
      .connect(me)
      .vote(poolId2, [veTokenId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith(
      "WhitelistVoting: LENDING_NOT_SUBMITTED"
    );
  });
  it("should alow lending #2 to be submitted", async () => {
    await whitelistVoting.connect(me).submitLending(poolId2, veTokenId1);
    let status = await (await whitelistVoting.proposals(poolId2)).status;
    expect(status).to.equal(BigNumber.from(1)); // ACTIVE
  });
  it("should decrease tokenId voting power after successful vote", async () => {
    let weight = BigNumber.from(10);
    let beforeVotePower = await whitelistVoting
      .connect(user2)
      .getRemainingVotePower(poolId2, veTokenId2);
    await whitelistVoting.connect(user2).vote(poolId2, [veTokenId2], [weight]);
    let afterVotePower = await whitelistVoting
      .connect(user2)
      .getRemainingVotePower(poolId2, veTokenId2);
    let diff = beforeVotePower.sub(afterVotePower);
    expect(diff.gte(weight)).to.be.true; // at least weight amount must be the diff
  });
  it("should fail to use vote weight more than actual vote power", async () => {
    let weight = BigNumber.from("5000000000000000001");
    let voteTx = whitelistVoting
      .connect(user3)
      .vote(poolId1, [veTokenId3], [weight]);
    await expect(voteTx).to.be.revertedWith(
      "WhitelistVoting: INSUFFICIENT_VOTING_POWER"
    );
  });
  it("Should reject lending#1 after 1 week", async () => {
    await network.provider.send("evm_increaseTime", [86400 * 7]); // 1 week
    await whitelistVoting.execute(poolId1);
    let status = await (await whitelistVoting.proposals(poolId1)).status;
    expect(status).to.equal(BigNumber.from(2)); // REJECTED
  });
  it("Should set variables", async () => {
    await whitelistVoting.setMinVotes(BigNumber.from("1000000000000000000000"));
    await whitelistVoting.setMinSupportVotes(
      BigNumber.from("500000000000000000000")
    );
    await whitelistVoting.setProposalActiveTime(BigNumber.from(5 * 60 * 60));
    expect(await whitelistVoting.connect(me).minVotes()).to.equal(
      BigNumber.from("1000000000000000000000") // 1000
    );
    expect(await whitelistVoting.connect(me).minSupportVotes()).to.equal(
      BigNumber.from("500000000000000000000") // 500
    );
    expect(await whitelistVoting.activeTime()).to.equal(
      BigNumber.from(5 * 60 * 60)
    );
  });
  it("Should pass lending#2 after 1 week", async () => {
    await whitelistVoting
      .connect(me)
      .vote(poolId2, [veTokenId1], ["1000000000000000000000"]);
    await whitelistVoting
      .connect(user2)
      .vote(poolId2, [veTokenId2], ["-200000000000000000000"]);
    await whitelistVoting.execute(poolId2);
    let status = await (await whitelistVoting.proposals(poolId2)).status;
    expect(status).to.equal(BigNumber.from(3));
  });
  it("Shouldn't let submit proposal without veDEUS balance", async () => {
    let submitTx = whitelistVoting
      .connect(user4)
      .submitLending(poolId3, veTokenId4);
    await expect(submitTx).to.be.revertedWith(
      "WhitelistVoting: INSUFFICIENT_POWER"
    );
  });
});
