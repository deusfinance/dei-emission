// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DeiBox {
    using SafeERC20 for IERC20;

    event Sent(address reciever, uint256 amount);
    event Took(address from, uint256 amount);

    IERC20 public token;

    constructor(address token_) {
        token = IERC20(token_);
    }

    function send(address recv, uint256 amount) external {
        token.safeTransfer(recv, amount);
        emit Sent(recv, amount);
    }

    function take(address from, uint256 amount) external {
        token.safeTransferFrom(from, address(this), amount);
        emit Took(from, amount);
    }
}
