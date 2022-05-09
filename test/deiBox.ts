import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  deployTokenTest,
  deployDeiBox,
  deployMinter,
} from "../scripts/deployHelpters";
import { DeiBox, Minter, TokenTest } from "../typechain";

describe("Dei Box", async () => {
  let deiBox: DeiBox;
  let token: TokenTest;
  let minter: Minter;
  let me: SignerWithAddress;
  let user1: SignerWithAddress;
  before(async () => {
    [me, user1] = await ethers.getSigners();
    token = await deployTokenTest();
    deiBox = await deployDeiBox(token);
    minter = await deployMinter(token, deiBox, me);
    await minter.setEmission(BigNumber.from("10000000000000000000"));
  });
  it("Should have balance 10 tokens after first mint", async () => {
    await minter.mint();
    let balance = await token.balanceOf(await minter.deiBox());
    expect(balance).to.eq(BigNumber.from("10000000000000000000"));
  });
  it("Should send 5 tokens to user", async () => {
    let beforeBalance = await token.balanceOf(user1.address);
    await deiBox.send(user1.address, BigNumber.from("5000000000000000000"));
    let afterBalance = await token.balanceOf(user1.address);
    expect(afterBalance.sub(beforeBalance)).to.eq(
      BigNumber.from("5000000000000000000")
    );
  });
  it("Should take 5 tokens from user", async () => {
    let beforeBalance = await token.balanceOf(user1.address)
    let beforeBlanaceDeiBox = await token.balanceOf(deiBox.address);
    let approveTx = await token.connect(user1).approve(deiBox.address, BigNumber.from("5000000000000000000"));
    await approveTx.wait()
    await deiBox.take(user1.address, BigNumber.from("5000000000000000000"));
    let afterBalance = await token.balanceOf(user1.address);
    let afterBalanceDeiBox = await token.balanceOf(deiBox.address);
    let diff = beforeBalance.sub(afterBalance);
    let diffDeiBox = afterBalanceDeiBox.sub(beforeBlanaceDeiBox);
    expect(diff).to.equal(BigNumber.from("5000000000000000000"));
    expect(diff).to.equal(diffDeiBox);
  });
});
