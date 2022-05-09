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

  // test ve token id and pool ids
  let veTokeId: BigNumber = BigNumber.from(1);
  let poolId1: BigNumber = BigNumber.from(1);
  let poolId2: BigNumber = BigNumber.from(2);

  before(async () => {
    [me] = await ethers.getSigners();
    token = await deployTokenTest();
    deiBox = await deployDeiBox(token.address);
    minter = await deployMinter(token.address, deiBox.address, me.address);

    let veFactory = await ethers.getContractFactory("VeTest");
    ve = await veFactory.deploy(token.address);
    await ve.deployed();

    voter = await deployVoter(minter.address, ve.address);
  });
  it("Should create lock", async () => {
    let tx = await ve.connect(me).create_lock(
      BigNumber.from("10000000000000000000"), // 10 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
    await tx.wait();
    expect(await ve.ownerOf(veTokeId)).to.eq(me.address);
  });
  it("votes on lending #1 should be zero", async () => {
    let totalVotes = await voter.getTotalVotesOfLending(poolId1);
    expect(totalVotes).to.equal(0);
  });
  it("should fail to vote on lending #1 before it's submitted", async () => {
    let voteTx = voter
      .connect(me)
      .vote(poolId1, [veTokeId], [BigNumber.from(100)]);
    await expect(voteTx).to.be.revertedWith("Voter: LENDING_NOT_SUBMITTED");
  });
  it("should submit lending #1 for votings", async () => {
    await voter.submitLending(poolId1);
    let isProposed = await voter.proposedLendings(poolId1);
    expect(isProposed).to.be.true;
  });
  it("should fail to submit same lending more than once", async () => {
    let submitTx = voter.submitLending(poolId1);
    await expect(submitTx).to.be.revertedWith("Voter: ALREADY_SUBMITTED");
  });
  it("should vote 100 power on lending #1", async () => {
    let votingWeight = BigNumber.from(100);
    await voter.vote(poolId1, [veTokeId], [votingWeight]);
    let pool1Votes = await voter.getTotalVotesOfLending(poolId1);
    expect(votingWeight).to.equal(pool1Votes);
  });
});
