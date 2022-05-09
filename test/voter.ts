import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  deployDeiBox,
  deployMinter,
  deployTokenTest,
  deployVoter,
} from "../scripts/deployHelpters";
import { DeiBox, Minter, TokenTest, VeTest, Voter } from "../typechain";

describe("Voter", () => {
  let minter: Minter;
  let ve: VeTest;
  let token: TokenTest;
  let voter: Voter;
  let me: SignerWithAddress;
  let deiBox: DeiBox;

  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  // test ve token id and pool ids
  let veTokeId1: BigNumber = BigNumber.from(1);
  let veTokeId2: BigNumber = BigNumber.from(2);
  let veTokeId3: BigNumber = BigNumber.from(3);

  let poolId1: BigNumber = BigNumber.from(1);
  let poolId2: BigNumber = BigNumber.from(2);

  async function setupUserVotingPowers() {
    await ve.connect(me).create_lock(
      BigNumber.from("10000000000000000000"), // 10 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user2).create_lock(
      BigNumber.from("15000000000000000000"), // 15 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user3).create_lock(
      BigNumber.from("5000000000000000000"), // 5 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
  }

  async function deployTestVe() {
    let veFactory = await ethers.getContractFactory("VeTest");
    let _ve = await veFactory.deploy(token.address);
    _ve.deployed();
    return _ve;
  }

  before(async () => {
    [me, user2, user3] = await ethers.getSigners();
    token = await deployTokenTest();
    deiBox = await deployDeiBox(token.address);
    minter = await deployMinter(token.address, deiBox.address, me.address);
    ve = await deployTestVe();
    voter = await deployVoter(minter.address, ve.address);

    await setupUserVotingPowers(); // lock veTOKENS
  });
  it("votes on lending #1 should be zero", async () => {
    let totalVotes = await voter.getTotalVotesOfLending(poolId1);
    expect(totalVotes).to.equal(0);
  });
  it("should fail to vote on lending #1 before it's submitted", async () => {
    let voteTx = voter
      .connect(me)
      .vote(poolId1, [veTokeId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith("Voter: LENDING_NOT_SUBMITTED");
  });
  it("should submit lending #1 for voting", async () => {
    await voter.submitLending(poolId1);
    let isProposed = await voter.proposedLendings(poolId1);
    expect(isProposed).to.be.true;
  });
  it("should fail to submit same lending more than once", async () => {
    let submitTx = voter.submitLending(poolId1);
    await expect(submitTx).to.be.revertedWith("Voter: ALREADY_SUBMITTED");
  });
  it("should fail to vote with tokenId that the sender is not owner of has approve of", async () => {
    let voteTx = voter
      .connect(user2)
      .vote(poolId1, [veTokeId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith("Voter: TOKEN_ID_NOT_APPROVED");
  });
  it("should vote 100 power on lending #1", async () => {
    let votingWeight = BigNumber.from(100);
    await voter.connect(me).vote(poolId1, [veTokeId1], [votingWeight]);
    let pool1Votes = await voter.getTotalVotesOfLending(poolId1);
    expect(votingWeight).to.equal(pool1Votes);
  });
  it("should fail to vote on lending #2 ", async () => {
    let voteTx = voter
      .connect(me)
      .vote(poolId2, [veTokeId1], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith("Voter: LENDING_NOT_SUBMITTED");
  });
  it("should alow lending #2 to be submitted", async () => {
    await voter.connect(me).submitLending(poolId2);
    let isProposed = await voter.proposedLendings(poolId2);
    expect(isProposed).to.be.true;
  });
});
