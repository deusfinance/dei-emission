// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "./interfaces/Ive.sol";

contract Voter {
    address minter;
    address ve;

    mapping(uint256 => bool) public proposedLendings; // its true if the lending id is proposed to be whitelisted
    mapping(uint256 => int256) public lendingVotes; // lendingId => totalLendingVotes

    constructor(address minter_, address ve_) {
        minter = minter_;
        ve = ve_;
    }

    function getTotalVotesOfLending(uint256 lendingId)
        public
        view
        returns (int256)
    {
        return lendingVotes[lendingId];
    }

    function submitLending(uint256 lendingId) external {
        require(
            proposedLendings[lendingId] == false,
            "Voter: ALREADY_SUBMITTED"
        );
        proposedLendings[lendingId] = true;
    }

    function _vote(
        uint256 lendingId,
        uint256 tokenId,
        int256 weight
    ) internal {
        require(proposedLendings[lendingId], "Voter: LENDING_NOT_SUBMITTED");
        lendingVotes[lendingId] += weight;
    }

    function vote(
        uint256 lendingId,
        uint256[] memory tokenIds,
        int256[] memory weights
    ) external {
        require(
            tokenIds.length == weights.length,
            "Voter: TOKEN_ID_WEIGHT_MISMATCH"
        );
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _vote(lendingId, tokenIds[i], weights[i]);
        }
    }
    // function distribute(address _gauge) public {}
    // function distribute() external {}
    // function distribute(uint256 start, uint256 finish) public {}
    // function distribute(address[] memory _gauges) external {}
}
