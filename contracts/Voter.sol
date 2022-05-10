// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "./interfaces/Ive.sol";

enum Status {
    PENDING,
    ACTIVE,
    REJECTED,
    APPROVED
}

struct Proposal {
    uint256 id;
    uint256 timestamp;
    int256 votes;
    uint256 absVotes;
    Status status;
}

contract Voter {
    address public minter;
    address public ve;
    uint256 internal constant WEEK = 86400 * 7;
    uint256 public minVotes = 5000e18;
    int256 public minSupportVotes = 2500e18;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256) public powerUsed; // tokenId => amount of voting power used

    constructor(address minter_, address ve_) {
        minter = minter_;
        ve = ve_;
    }

    function getTotalVotesOfLending(uint256 lendingId)
        public
        view
        returns (int256)
    {
        return proposals[lendingId].votes;
    }

    function submitLending(uint256 lendingId) external {
        require(
            proposals[lendingId].status == Status.PENDING,
            "Voter: ALREADY_SUBMITTED"
        );
        // todo: check min veDeus balance
        // todo: receive min fee amount
        proposals[lendingId].status = Status.ACTIVE;
        proposals[lendingId].timestamp = block.timestamp;
    }

    function getRemainingVotePower(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        uint256 totalPower = Ive(ve).balanceOfNFT(tokenId);
        return totalPower - powerUsed[tokenId];
    }

    function _vote(
        uint256 lendingId,
        uint256 tokenId,
        int256 weight
    ) internal {
        require(
            proposals[lendingId].status == Status.ACTIVE,
            "Voter: LENDING_NOT_SUBMITTED"
        );
        require(
            Ive(ve).isApprovedOrOwner(msg.sender, tokenId),
            "Voter: TOKEN_ID_NOT_APPROVED"
        );
        require(
            getRemainingVotePower(tokenId) >= abs(weight),
            "Voter: INSUFFICIENT_VOTING_POWER"
        );
        powerUsed[tokenId] += abs(weight);
        proposals[lendingId].votes += weight;
        proposals[lendingId].absVotes += abs(weight);
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

    function execute(uint256 lendingId) external {
        require(
            proposals[lendingId].status == Status.ACTIVE,
            "Voter: LENDING_NOT_APPROVED"
        );
        require(
            block.timestamp > proposals[lendingId].timestamp + WEEK,
            "Voter: PROPOSAL_STILL_PENDING"
        );
        if (
            proposals[lendingId].absVotes > minVotes &&
            proposals[lendingId].votes > minSupportVotes
        ) {
            proposals[lendingId].status = Status.APPROVED;
        } else {
            proposals[lendingId].status = Status.REJECTED;
        }
    }

    function abs(int256 x) private pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
}
