import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DeiBox, ERC20, Minter, TokenTest } from "../typechain";

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

async function deployMinter(
  token: ERC20,
  deiBox: DeiBox,
  admin: SignerWithAddress
): Promise<Minter> {
  let minterFactory = await ethers.getContractFactory("Minter");
  let minter = await minterFactory.deploy(
    deiBox.address,
    token.address,
    admin.address
  );
  return minter;
}

export { deployTokenTest, deployDeiBox, deployMinter };
