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
    expect(await ve.ownerOf(BigNumber.from(1))).to.eq(me.address);
  });
  it("Voter should be able to vote", async () => {
    let pools = [BigNumber.from(0), BigNumber.from(1), BigNumber.from(4)];
    let weights = [BigNumber.from(-50), BigNumber.from(0), BigNumber.from(100)];
    await voter.vote(1, pools, weights);
  });
});
