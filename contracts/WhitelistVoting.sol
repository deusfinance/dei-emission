// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
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
    mapping(uint256 => uint256) powerUsed;
}

contract WhitelistVoting is AccessControl {
    address public ve;
    uint256 public activeTime = 86400 * 7; // 1 WEEK
    uint256 public minSubmissionPower;
    uint256 public minVotes;
    int256 public minSupportVotes;
    mapping(uint256 => Proposal) public proposals;

    constructor(
        address ve_,
        uint256 minSubmissionPower_,
        uint256 minVotes_,
        int256 minSupportVotes_,
        address admin
    ) {
        ve = ve_;
        minSubmissionPower = minSubmissionPower_;
        minVotes = minVotes_;
        minSupportVotes = minSupportVotes_;
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function getTotalVotesOfLending(uint256 lendingId)
        public
        view
        returns (int256)
    {
        return proposals[lendingId].votes;
    }

    function submitLending(uint256 lendingId, uint256 tokenId) external {
        require(
            proposals[lendingId].status == Status.PENDING,
            "WhitelistVoting: ALREADY_SUBMITTED"
        );
        require(
            Ive(ve).isApprovedOrOwner(msg.sender, tokenId),
            "WhitelistVoting: TOKEN_ID_NOT_APPROVED"
        );
        uint256 power = Ive(ve).balanceOfNFT(tokenId);
        require(
            power > minSubmissionPower,
            "WhitelistVoting: INSUFFICIENT_POWER"
        );

        proposals[lendingId].status = Status.ACTIVE;
        proposals[lendingId].timestamp = block.timestamp;
    }

    function getRemainingVotePower(uint256 lendingId, uint256 tokenId)
        public
        view
        returns (uint256)
    {
        uint256 totalPower = Ive(ve).balanceOfNFT(tokenId);
        return totalPower - proposals[lendingId].powerUsed[tokenId];
    }

    function _vote(
        uint256 lendingId,
        uint256 tokenId,
        int256 weight
    ) internal {
        require(
            proposals[lendingId].status == Status.ACTIVE,
            "WhitelistVoting: LENDING_NOT_SUBMITTED"
        );
        require(
            Ive(ve).isApprovedOrOwner(msg.sender, tokenId),
            "WhitelistVoting: TOKEN_ID_NOT_APPROVED"
        );
        require(
            getRemainingVotePower(lendingId, tokenId) >= abs(weight),
            "WhitelistVoting: INSUFFICIENT_VOTING_POWER"
        );
        proposals[lendingId].powerUsed[tokenId] += abs(weight);
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
            "WhitelistVoting: TOKEN_ID_WEIGHT_MISMATCH"
        );
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _vote(lendingId, tokenIds[i], weights[i]);
        }
    }

    function execute(uint256 lendingId) external {
        require(
            proposals[lendingId].status == Status.ACTIVE,
            "WhitelistVoting: LENDING_NOT_ACTIVE"
        );
        require(
            block.timestamp > proposals[lendingId].timestamp + activeTime,
            "WhitelistVoting: PROPOSAL_STILL_ACTIVE"
        );
        if (
            proposals[lendingId].absVotes >= minVotes &&
            proposals[lendingId].votes >= minSupportVotes
        ) {
            proposals[lendingId].status = Status.APPROVED;
        } else {
            proposals[lendingId].status = Status.REJECTED;
        }
    }

    function abs(int256 x) private pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    function setMinVotes(uint256 minVotes_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        minVotes = minVotes_;
    }

    function setMinSupportVotes(int256 minSupportVotes_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        minSupportVotes = minSupportVotes_;
    }

    function setProposalActiveTime(uint256 activeTime_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        activeTime = activeTime_;
    }

    function getLendingStatus(uint256 lendingId)
        external
        view
        returns (uint256)
    {
        return uint256(proposals[lendingId].status);
    }
}
