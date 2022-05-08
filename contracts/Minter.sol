// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

interface IDEI {
    function pool_mint(address to, uint256 amount) external;
}

/// @title Minter Contract
/// @author DEUS Finance
/// @notice Static Emission Rate
contract Minter {
    event Minted(address to, uint256 amount);

    address public dei;
    address public deiBox;
    uint256 public emission;

    constructor(address deiBox_, address dei_) {
        deiBox = deiBox_;
        dei = dei_;
    }

    function mint() external {
        IDEI(dei).pool_mint(deiBox, emission);
        emit Minted(deiBox, emission);
    }

    function setEmission(uint256 emission_) external {
        emission = emission_;
    }
}
