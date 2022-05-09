import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { deployDeiBox } from "../scripts/deployHelpters";
import { DeiBox, Minter, TokenTest } from "../typechain";

describe("Minter", () => {
  let minter: Minter;
  let token: TokenTest;
  let deiBox: DeiBox;
  before(async () => {
    let tokenFactory = await ethers.getContractFactory("TokenTest");
    token = await tokenFactory.deploy();
    await token.deployed();
    deiBox = await deployDeiBox(token);
    await deiBox.deployed();
  });
  it("Should deploy minter", async () => {
    let minterFactory = await ethers.getContractFactory("Minter");
    minter = await minterFactory.deploy(deiBox.address, token.address);
  });
  it("Should mint zero token", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    let tx = await minter.mint();
    await tx.wait();
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(0);
  });
  it("Should set new emission to 10 token", async () => {
    let tx = await minter.setEmission(BigNumber.from("10000000000000000000"));
    await tx.wait();
    expect(await minter.emission()).to.eq(
      BigNumber.from("10000000000000000000")
    );
  });
  it("Should mint 10 token", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    let tx = await minter.mint();
    await tx.wait();
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("10000000000000000000")
    );
  });
});
