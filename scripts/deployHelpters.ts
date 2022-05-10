import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeiBox, ERC20, Minter, TokenTest, Voter } from "../typechain";

async function deployTokenTest(): Promise<TokenTest> {
  let tokenFactory = await ethers.getContractFactory("TokenTest");
  let token = await tokenFactory.deploy();
  await token.deployed();
  return token;
}

async function deployDeiBox(tokenAddress: string): Promise<DeiBox> {
  let deiBoxFactory = await ethers.getContractFactory("DeiBox");
  let deiBox = await deiBoxFactory.deploy(tokenAddress);
  await deiBox.deployed();
  return deiBox;
}

async function deployMinter(
  tokenAddress: string,
  deiBoxAddress: string,
  admin: string
): Promise<Minter> {
  let minterFactory = await ethers.getContractFactory("Minter");
  let minter = await minterFactory.deploy(deiBoxAddress, tokenAddress, admin);
  await minter.deployed();
  return minter;
}

async function deployVoter(
  minterAddress: string,
  veAddress: string,
  minSubmitionPower: BigNumber,
  minVotes: BigNumber,
  minSupportVotes: BigNumber,
  admin: string
): Promise<Voter> {
  let voterFactory = await ethers.getContractFactory("Voter");
  let voter = await voterFactory.deploy(
    minterAddress,
    veAddress,
    minSubmitionPower,
    minVotes,
    minSupportVotes,
    admin
  );
  await voter.deployed();
  return voter;
}

export { deployTokenTest, deployDeiBox, deployMinter, deployVoter };
