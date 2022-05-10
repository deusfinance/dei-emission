// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "./interfaces/IWhitelistVoting.sol";
import "./interfaces/Ive.sol";

contract Voter {
    address public ve;
    address public whitelistVoting;

    constructor(address ve_, address whitelistVoting_) {
        ve = ve_;
        whitelistVoting = whitelistVoting_;
    }

    function _vote(
        uint256 tokenId,
        uint256[] memory lendingIds,
        int256[] memory weights
    ) internal {
        for (uint256 i = 0; i < lendingIds.length; i++) {
            require(
                IWhitelistVoting(whitelistVoting).getLendingStatus(
                    lendingIds[i]
                ) == Status.APPROVED,
                "Voter: NOT_APPROVED"
            );
        }
    }

    function vote(
        uint256 tokenId,
        uint256[] memory lendingIds,
        int256[] memory weights
    ) external {
        require(
            Ive(ve).isApprovedOrOwner(msg.sender, tokenId),
            "Voter: TOKEN_ID_NOT_APPROVED"
        );
        require(
            lendingIds.length == weights.length,
            "Voter: LENDING_WEIGHT_MISMATCH"
        );
        _vote(tokenId, lendingIds, weights);
    }
}
