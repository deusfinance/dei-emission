import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
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
    let deiBoxFactory = await ethers.getContractFactory("DeiBox");
    deiBox = await deiBoxFactory.deploy();
    await deiBox.deployed();
    let minterFactory = await ethers.getContractFactory("Minter");
    minter = await minterFactory.deploy(deiBox.address);
    await minter.deployed();
    let tokenFactory = await ethers.getContractFactory("TokenTest");
    token = await tokenFactory.deploy();
    await token.deployed();
    let veFactory = await ethers.getContractFactory("VeTest");
    ve = await veFactory.deploy(token.address);
    await ve.deployed();
  });
  it("Should deploy voter", async () => {
    let voterFactory = await ethers.getContractFactory("Voter");
    voter = await voterFactory.deploy(minter.address, ve.address);
    await voter.deployed();
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
