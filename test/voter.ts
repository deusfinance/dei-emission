import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  deployTestVe,
  deployTokenTest,
  deployVoter,
} from "../scripts/deployHelpters";
import { TokenTest, VeTest, Voter, WhitelistVoting } from "../typechain";
import { FakeContract, smock } from "@defi-wonderland/smock";
import { expect } from "chai";

describe("Voter", async () => {
  let me: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let ve: VeTest;
  let token: TokenTest;
  let voter: Voter;

  let fakeWhitelistVoting: FakeContract<WhitelistVoting>;

  let poolId1 = BigNumber.from(1);
  async function setupUserVotingPowers() {
    await ve.connect(me).create_lock(
      BigNumber.from("1000000000000000000000"), // 1000 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );

    await ve.connect(user2).create_lock(
      BigNumber.from("500000000000000000000"), // 500 token
      BigNumber.from(4 * 365 * 24 * 60 * 60)
    );
  }
  before(async () => {
    [me, user1, user2] = await ethers.getSigners();
    token = await deployTokenTest();
    ve = await deployTestVe(token.address);
    await setupUserVotingPowers(); // lock veTOKENS
    fakeWhitelistVoting = await smock.fake<WhitelistVoting>("WhitelistVoting");
  });

  it("Should deploy voter", async () => {
    voter = await deployVoter(ve.address, fakeWhitelistVoting.address);
    expect(voter.address).to.not.be.null;
  });
  it("should fail to vote if lending is not approved", async () => {
    // fakeWhitelistVoting.getLendingStatus.whenCalledWith(0).returns(43);
    fakeWhitelistVoting.getLendingStatus.whenCalledWith(0).returns(3);
    fakeWhitelistVoting.getLendingStatus.whenCalledWith(1).returns(2);
    console.log("here ", await fakeWhitelistVoting.getLendingStatus(0));
    console.log("here ", await fakeWhitelistVoting.getLendingStatus(1));
  });
});
