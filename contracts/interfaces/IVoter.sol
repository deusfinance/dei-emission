// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

interface IVoter {
    function getMaxCap(uint256) external view returns (uint256);
}
