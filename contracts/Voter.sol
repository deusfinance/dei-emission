// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "./interfaces/Ive.sol";

contract Voter {
    address minter;
    address ve;

    constructor(address minter_, address ve_) {
        minter = minter_;
        ve = ve_;
    }

    function _vote(
        uint256 tokenId,
        uint256[] memory pools,
        int256[] memory weights
    ) internal {}

    function vote(
        uint256 tokenId,
        uint256[] memory pools,
        int256[] memory weights
    ) external {}
    // function distribute(address _gauge) public {}
    // function distribute() external {}
    // function distribute(uint256 start, uint256 finish) public {}
    // function distribute(address[] memory _gauges) external {}
}
