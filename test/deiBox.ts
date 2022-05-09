import { expect } from "chai";
import { ethers } from "hardhat";
import { deployTokenTest, deployDeiBox } from "../scripts/deployHelpters";
import { DeiBox, TokenTest } from "../typechain";

describe("Dei Box", async () => {
  let deiBox: DeiBox;
  let token: TokenTest;
  before(async () => {
    token = await deployTokenTest();
    deiBox = await deployDeiBox(token);
  });
});
