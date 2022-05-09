// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTest is ERC20 {
    constructor() ERC20("Test", "TEST") {}

    function pool_mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
