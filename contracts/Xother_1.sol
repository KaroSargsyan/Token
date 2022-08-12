// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "./ERC20Upgradeable.sol";
import "./OwnableUpgradeable.sol";
// import "./Initializable.sol";
// import "./UUPSUpgradeable.sol";
import "./IUniswapV2Router01.sol";
import "./AggregatorV3Interface.sol";
import "./XToken.sol";
import "hardhat/console.sol";
import "./XLock.sol";


contract Xother1 is XLock {
    function newFunc() pure public returns(uint){
        return 55555555555555;
    }
}