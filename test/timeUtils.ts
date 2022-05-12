import { ethers, network } from "hardhat";

let week = 86400 * 7;

async function getCurrentTimeStamp(): Promise<number> {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  return blockBefore.timestamp;
}

async function getActivePeriod(): Promise<number> {
  return Math.floor((await getCurrentTimeStamp()) / week) * week;
}

async function setTimeToNextThursdayMidnight() {
  let currentTimeStamp = await getCurrentTimeStamp();
  let remainingToNextWeek = week - (currentTimeStamp % week);
  await network.provider.send("evm_mine", [
    currentTimeStamp + remainingToNextWeek,
  ]); // Thursday 00:00 UTC
}

async function increaseTime(increaseAmount: number) {
  let before = await getCurrentTimeStamp();
  await network.provider.send("evm_mine", [before + increaseAmount]);
}

export {
  getCurrentTimeStamp,
  setTimeToNextThursdayMidnight,
  increaseTime,
  getActivePeriod,
};
