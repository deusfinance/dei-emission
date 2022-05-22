// Be name Khoda
// SPDX-License-Identifier: GPL-3.0

// =================================================================================================================
//  _|_|_|    _|_|_|_|  _|    _|    _|_|_|      _|_|_|_|  _|                                                       |
//  _|    _|  _|        _|    _|  _|            _|            _|_|_|      _|_|_|  _|_|_|      _|_|_|    _|_|       |
//  _|    _|  _|_|_|    _|    _|    _|_|        _|_|_|    _|  _|    _|  _|    _|  _|    _|  _|        _|_|_|_|     |
//  _|    _|  _|        _|    _|        _|      _|        _|  _|    _|  _|    _|  _|    _|  _|        _|           |
//  _|_|_|    _|_|_|_|    _|_|    _|_|_|        _|        _|  _|    _|    _|_|_|  _|    _|    _|_|_|    _|_|_|     |
// =================================================================================================================
// ================ CapManager ================
// ===============================================
// DEUS Finance: https://github.com/deusfinance

// Primary Author(s)
// Sina: https://github.com/spsina
// Vahid: https://github.com/vahid-dev

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Cap Manager
/// @author DEUS Finance
/// @notice Manages lending's caps in Lender contract
contract CapManager is AccessControl {
    using SafeERC20 for IERC20;

    event SetDailyMaxCap(uint, uint, uint);

    mapping(uint256 => uint256) public dailyMaxCaps; // collateralIndex -> dailyMaxCap

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE"); // Manager role

    constructor(
        address manager,
        address admin
    ) {
        require(
            manager != address(0) && admin != address(0),
            "CapManager: ZERO_ADDRESS_DETECTED"
        );
        _setupRole(MANAGER_ROLE, manager);
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Sets new dailyMaxCap for given lending
    /// @param collateralIndex index of collateral
    /// @param dailyMaxCap_ new dailyMaxCap
    function setDailyMaxCap(uint collateralIndex,uint256 dailyMaxCap_) external onlyRole(MANAGER_ROLE) {
        emit SetDailyMaxCap(collateralIndex, dailyMaxCaps[collateralIndex],  dailyMaxCap_);
        dailyMaxCaps[collateralIndex] = dailyMaxCap_;
    }

    /// @notice Returns maxCap for given lending
    /// @param collateralIndex index of collateral
    /// @return lendingMaxCap maxCap of lending
    function getLendingMaxCap(uint256 collateralIndex)
        external
        view
        returns (uint256)
    {
        // TODO: read votes from voter
    }

    /// @notice Returns dailyMaxCap for given lending
    /// @param collateralIndex index of collateral
    /// @return lendingDailyMaxCap dailyMaxCap of lending
    function getLendingDailayMaxCap(uint256 collateralIndex)
        external
        view
        returns (uint256)
    {
        return dailyMaxCaps[collateralIndex];
    }

    /// @notice Withdraws erc20 tokens from CapManager
    /// @dev It's not expected that tokens will be deposited
    /// @param token address of token
    /// @param to address of reciever
    /// @param amount withdraw amount
    function emergencyWithdrawERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).transfer(to, amount);
    }

    /// @notice Withdraws ETH from CapManager
    /// @param to address of reciever
    /// @param amount withdraw amount
    function emergencyWithdrawETH(address to, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        payable(to).transfer(amount);
    }
}

// Dar panah khoda