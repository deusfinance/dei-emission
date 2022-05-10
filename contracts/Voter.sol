// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

interface IWhitelistVoting {
    function getLendingStatus(uint256 lendingId)
        external
        view
        returns (uint256);
}

contract Voter {
    address public ve;
    address public whitelistVoting;

    constructor(address ve_, address whitelistVoting_) {
        ve = ve_;
        whitelistVoting = whitelistVoting_;
    }

    function getLendingStatus(uint256 lendingId) public view returns (uint256) {
        return IWhitelistVoting(ve).getLendingStatus(lendingId);
    }
}
