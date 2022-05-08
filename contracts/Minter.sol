// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

contract Minter {
    address public deiBox;

    constructor(address deiBox_) {
        deiBox = deiBox_;
    }

    event Minted(address to, uint256 amount);

    function mint() external {
        uint256 emission;
        emit Minted(deiBox, emission);
    }
}
