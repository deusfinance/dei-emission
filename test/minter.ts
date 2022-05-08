import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeiBox, Minter, TokenTest } from "../typechain";

describe("Minter", () => {
  let minter: Minter;
  let token: TokenTest;
  let deiBox: DeiBox;
  before(async () => {
    let tokenFactory = await ethers.getContractFactory("TokenTest");
    token = await tokenFactory.deploy();
    await token.deployed();
    let deiBoxFactory = await ethers.getContractFactory("DeiBox");
    deiBox = await deiBoxFactory.deploy();
    await deiBox.deployed();
  });
  it("Should deploy minter", async () => {
    let minterFactory = await ethers.getContractFactory("Minter");
    minter = await minterFactory.deploy(deiBox.address);
  });
  it("Should mint DEI", async () => {
    let beforeBalance = await token.balanceOf(await minter.deiBox());
    let tx = await minter.mint();
    let receipt = await tx.wait();
    let emittedAddress = BigNumber.from(receipt.logs[0].data.slice(0, 66));
    let emittedAmount = BigNumber.from(receipt.logs[0].data.slice(66));
    let afterBalance = await token.balanceOf(await minter.deiBox());
    expect(deiBox.address).to.eq(emittedAddress);
    expect(afterBalance.sub(beforeBalance)).to.eq(emittedAmount);
  });
});
