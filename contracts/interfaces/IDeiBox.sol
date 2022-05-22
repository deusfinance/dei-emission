// SPDX-License-Identifier: GPL3.0-or-later

pragma solidity 0.8.13;

interface IDeiBox {
    function dei() external view returns (address);

    function send(address recv, uint256 amount) external;

    function take(address from, uint256 amount) external;
}
