// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "./interfaces/IWhitelistVoting.sol";
import "./interfaces/IMinter.sol";
import "./interfaces/Ive.sol";

contract Voter {
    /* ========== STATE VARIABLES ========== */
    address public ve;
    address public whitelistVoting;
    address public minter;

    mapping(uint256 => mapping(uint256 => uint256)) public powerUsed; // period => (tokenId => powerUsed)
    mapping(uint256 => mapping(uint256 => int256)) public lendingVotes; // period => (lendingId => votes)
    mapping(uint256 => uint256) public caps; // lendingId => confirmed caps
    mapping(uint256 => uint256) public pendingPeriods; // lendingId => pendingPeriod
    mapping(uint256 => uint256) public totalPowers; // period => total powers voted
    uint256 internal constant WEEK = 7 days; // allows minting once per week (reset every Thursday 00:00 UTC)

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address ve_,
        address whitelistVoting_,
        address minter_
    ) {
        ve = ve_;
        whitelistVoting = whitelistVoting_;
        minter = minter_;
    }

    /* ========== PUBLIC VIEWS ========== */

    function getMaxCap(uint256 lendingId) external view returns (uint256) {
        uint256 cap = caps[lendingId];
        uint256 pendingPeriod = pendingPeriods[lendingId];
        if (getActivePeriod() > pendingPeriod) {
            cap += getCapAtPeriod(lendingId, pendingPeriod);
        }
        return cap;
    }

    function getCapAtPeriod(uint256 lendingId, uint256 period)
        public
        view
        returns (uint256)
    {
        uint256 votesAtPeriod = lendingVotes[period][lendingId] < 0
            ? 0
            : uint256(lendingVotes[period][lendingId]);
        if (totalPowers[period] == 0) return 0;
        return
            (votesAtPeriod * IMinter(minter).mintAmount(period)) /
            totalPowers[period];
    }

    function getTotalPowerInActivePeriod() public view returns (uint256) {
        return totalPowers[getActivePeriod()];
    }

    function getLendingVotesInActivePeriod(uint256 lendingId)
        public
        view
        returns (int256)
    {
        return lendingVotes[getActivePeriod()][lendingId];
    }

    function getActivePeriod() public view returns (uint256) {
        return (block.timestamp / WEEK) * WEEK;
    }

    function getPowerUsedInActivePeriod(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return powerUsed[getActivePeriod()][tokenId];
    }

    function getRemainingPowerInActivePeriod(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return _getRemaingPowerAtPeriod(tokenId, getActivePeriod());
    }

    function _getRemaingPowerAtPeriod(uint256 tokenId, uint256 period)
        internal
        view
        returns (uint256)
    {
        uint256 totalPower = Ive(ve).balanceOfNFT(tokenId);
        return totalPower - powerUsed[period][tokenId];
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

        for (uint256 i = 0; i < lendingIds.length; i++) {
            _vote(tokenId, lendingIds[i], weights[i], getActivePeriod());
        }
    }

    function _vote(
        uint256 tokenId,
        uint256 lendingId,
        int256 weight,
        uint256 period
    ) internal {
        require(
            IWhitelistVoting(whitelistVoting).getLendingStatus(lendingId) ==
                Status.APPROVED,
            "Voter: NOT_APPROVED"
        );
        uint256 power = abs(weight);
        require(
            power <= _getRemaingPowerAtPeriod(tokenId, period),
            "Voter: INSUFFICIENT_POWER"
        );
        powerUsed[period][tokenId] += power;
        totalPowers[period] += power;
        lendingVotes[period][lendingId] += weight;

        uint256 pendingPeriod = pendingPeriods[lendingId];
        if (period > pendingPeriod) {
            caps[lendingId] += getCapAtPeriod(lendingId, pendingPeriod);
            pendingPeriods[lendingId] = period;
        }
    }

    function abs(int256 x) private pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
}
