// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

contract VeTest {
    uint256 public totalSupply = 0;
    address public immutable token;
    address public immutable owner;
    mapping(uint256 => uint256) balances;
    mapping(uint256 => address) public ownerOf;

    constructor(address _token) {
        token = _token;
        owner = msg.sender;
    }

    uint256 tokenId = 0;

    function create_lock(uint256 amount, uint256 duration) external {
        balances[++tokenId] = amount;
        ownerOf[tokenId] = msg.sender;
        totalSupply += amount;
    }

    function balanceOfNFT(uint256 tokenId) external view returns (uint256) {
        return totalSupply;
    }

    function isApprovedOrOwner(address owner, uint256 _tokenId)
        external
        view
        returns (bool)
    {
        return true;
    }
}
