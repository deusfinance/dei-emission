import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { deployDeiBox } from "../scripts/deployHelpters";
import { DeiBox, Minter, TokenTest } from "../typechain";
import {
  getActivePeriod,
  increaseTime,
  setTimeToNextThursdayMidnight,
} from "./timeUtils";

describe("Minter", () => {
  let minter: Minter;
  let token: TokenTest;
  let deiBox: DeiBox;
  let me: SignerWithAddress;
  before(async () => {
    [me] = await ethers.getSigners();
    let tokenFactory = await ethers.getContractFactory("TokenTest");
    token = await tokenFactory.deploy();
    await token.deployed();
    deiBox = await deployDeiBox(token.address, me.address);
    await deiBox.deployed();
  });
  it("Should deploy minter", async () => {
    let minterFactory = await ethers.getContractFactory("Minter");
    minter = await minterFactory.deploy(
      deiBox.address,
      token.address,
      me.address
    );
  });
  it("Should mint zero token", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    await minter.mint();
    await increaseTime(86400 * 7); // 1 week
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(0);
  });
  it("Should set new emission to 10 token", async () => {
    await minter.setEmission(BigNumber.from("10000000000000000000"));
    expect(await minter.emission()).to.eq(
      BigNumber.from("10000000000000000000")
    );
  });
  it("Should mint 10 tokens", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    await minter.mint();
    await increaseTime(86400 * 7); // 1 week
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("10000000000000000000")
    );
  });
  it("Should let mint 20 tokens after 1 week", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    await minter.mint();
    await increaseTime(86400 * 7); // 1 week
    await minter.mint();
    await increaseTime(86400 * 7); // 1 week
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("20000000000000000000")
    );
  });
  it("Shouldn't let mint 20 tokens after 5 days", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    await minter.mint();
    await increaseTime(3600); // 1 week
    await minter.mint();
    await increaseTime(86400 * 7); // 1 week
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("10000000000000000000")
    );
  });
  it("Should let mint 20 tokens after 9 days", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    await minter.mint();
    await increaseTime(86400 * 9); // 1 week
    await minter.mint();
    await increaseTime(86400 * 5); // 1 week
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("20000000000000000000")
    );
  });
  it("should track mint amounts", async () => {
    let p1MintAmount = BigNumber.from(10000);
    let p2MintAmount = BigNumber.from(20000);

    // mint p1MintAmount in period p1
    await setTimeToNextThursdayMidnight();
    await minter.setEmission(p1MintAmount);
    let p1 = await getActivePeriod();
    await minter.mint();

    // mint p2MintAmount in period p2
    await setTimeToNextThursdayMidnight();
    await minter.setEmission(p2MintAmount);
    let p2 = await getActivePeriod();
    await minter.mint();

    let p1Amount = await minter.mintAmount(p1);
    let p2Amount = await minter.mintAmount(p2);

    expect(p1Amount).to.eq(p1MintAmount);
    expect(p2Amount).to.eq(p2MintAmount);
  });
});
