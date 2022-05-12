// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IDei.sol";

/// @title Minter Contract
/// @author DEUS Finance
/// @notice Static Emission Rate
contract Minter is AccessControl {
    using SafeERC20 for IERC20;

    event Minted(
        address to,
        uint256 emissionAmount,
        uint256 mintAmount,
        uint256 period
    );

    address public dei;
    address public deiBox;
    uint256 public emission;
    uint256 internal constant WEEK = 86400 * 7; // allows minting once per week (reset every Thursday 00:00 UTC)
    uint256 public lastPeriod;

    mapping(uint256 => uint256) public mintAmount; // period => max cap

    constructor(
        address deiBox_,
        address dei_,
        address admin
    ) {
        deiBox = deiBox_;
        dei = dei_;
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function weeklyEmission() public view returns (uint256) {
        return emission;
    }

    function getActivePeriod() public view returns (uint256) {
        return (block.timestamp / WEEK) * WEEK;
    }

    function mint() external {
        uint256 _activePeriod = getActivePeriod();
        if (_activePeriod > lastPeriod) {
            lastPeriod = _activePeriod;
            uint256 _required = weeklyEmission();
            uint256 _balanceOf = IERC20(dei).balanceOf(address(this));
            uint256 _difference;
            if (_balanceOf < _required) {
                _difference = _required - _balanceOf;
                IDEI(dei).pool_mint(address(this), _difference);
            }
            IERC20(dei).safeTransfer(deiBox, _required);
            mintAmount[_activePeriod] = _required;
            emit Minted(deiBox, _required, _difference, _activePeriod);
        }
    }

    function setEmission(uint256 emission_)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        emission = emission_;
    }
}
