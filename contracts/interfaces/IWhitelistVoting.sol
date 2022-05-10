// SPDX-License-Identifier: GPL3.0-or-later

pragma solidity 0.8.13;

enum Status {
    PENDING,
    ACTIVE,
    REJECTED,
    APPROVED
}

interface IWhitelistVoting {
    function getLendingStatus(uint256) external view returns (Status);
}
