import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeiBox, Minter, TokenTest, WhitelistVoting } from "../typechain";
import { Voter } from "../typechain/Voter";

async function deployTokenTest(): Promise<TokenTest> {
  let tokenFactory = await ethers.getContractFactory("TokenTest");
  let token = await tokenFactory.deploy();
  await token.deployed();
  return token;
}

async function deployDeiBox(tokenAddress: string, adminAddress: string): Promise<DeiBox> {
  let deiBoxFactory = await ethers.getContractFactory("DeiBox");
  let deiBox = await deiBoxFactory.deploy(tokenAddress, adminAddress);
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

async function deployWhitelistVoting(
  veAddress: string,
  minSubmissionPower: BigNumber,
  minVotes: BigNumber,
  minSupportVotes: BigNumber,
  admin: string
): Promise<WhitelistVoting> {
  let whitelistVotingFactory = await ethers.getContractFactory(
    "WhitelistVoting"
  );
  let whitelistVoting = await whitelistVotingFactory.deploy(
    veAddress,
    minSubmissionPower,
    minVotes,
    minSupportVotes,
    admin
  );
  await whitelistVoting.deployed();
  return whitelistVoting;
}

async function deployTestVe(tokenAddress: string) {
  let veFactory = await ethers.getContractFactory("VeTest");
  let _ve = await veFactory.deploy(tokenAddress);
  _ve.deployed();
  return _ve;
}

async function deployVoter(
  veAddress: string,
  whitelistVotingAddress: string,
  minterAddress: string
): Promise<Voter> {
  let voterFactory = await ethers.getContractFactory("Voter");
  let voter = await voterFactory.deploy(
    veAddress,
    whitelistVotingAddress,
    minterAddress
  );
  voter.deployed();
  return voter;
}

export {
  deployTokenTest,
  deployDeiBox,
  deployMinter,
  deployWhitelistVoting,
  deployTestVe,
  deployVoter,
};
