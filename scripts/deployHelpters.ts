import { ethers } from "hardhat";
import { DeiBox, ERC20, TokenTest } from "../typechain";

async function deployTokenTest(): Promise<TokenTest> {
  let tokenFactory = await ethers.getContractFactory("TokenTest");
  let token = await tokenFactory.deploy();
  await token.deployed();
  return token;
}

async function deployDeiBox(token: ERC20): Promise<DeiBox> {
  let deiBoxFactory = await ethers.getContractFactory("DeiBox");
  let deiBox = await deiBoxFactory.deploy(token.address);
  await deiBox.deployed();
  return deiBox;
}

export { deployTokenTest, deployDeiBox };
