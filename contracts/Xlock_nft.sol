// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "hardhat/console.sol";


contract XNft is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {

    address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint256 private minLockDate;
    uint256 public _lockId;
    enum Status {x,CLOSED,OPEN}

    mapping(address => uint256)  _tokenVsIndex;
    mapping(address => uint256[])  _userVsLockIds;
    mapping(uint256 => LockedAsset) public  _idVsLockedAsset;
 
    struct Token {
        address tokenAddress;
        uint256 balance;
    }

    Token[] _tokens;

    struct LockedAsset {
        address contractAddress;
        address payable beneficiary;
        uint256 tokenId;
        uint256 startDate;
        uint256 endDate;
        Status status;
    }

    function initialize() initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
        minLockDate=1;
    }

    function getToken(address _tokenAddress) public view returns(
        address tokenAddress, 
        uint256 balance
    )
    {
        uint256 index = _tokenVsIndex[_tokenAddress];
        Token memory token = _tokens[index];
        return (token.tokenAddress,token.balance);
    }

    function getLockedAsset(uint256 id) external view returns(
        address contractAddress,
        address beneficiary,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate,
        uint256 lastLocked,
        Status status
    )
    {
        LockedAsset memory asset = _idVsLockedAsset[id];
        contractAddress = asset.contractAddress;
        beneficiary = asset.beneficiary;
        tokenId=asset.tokenId;
        startDate = asset.startDate;
        endDate = asset.endDate;
        status=asset.status;

        return(
            contractAddress,
            beneficiary,
            tokenId,
            startDate,
            endDate,
            lastLocked,
            status
        );
    }

    function addToken(address token) public onlyOwner {
        _tokens.push(Token({tokenAddress: token, balance:0}));
        _tokenVsIndex[token] = _tokens.length-1;
    }

    function deposit(
        address contractAddress,
        address payable beneficiary,
        address feeContractAddress,
        uint256 tokenId, 
        uint256 endDate 
    ) 
        public payable 
    {
        
        uint256 newAmount=_calculateFee(endDate);
        
        require(contractAddress != address(0),"Send valid contract address");
        require(beneficiary != address(0),"Send valid beneficiary address");
        require(endDate>=minLockDate,"Send correct endDate");

        if (feeContractAddress == ETH){
            require(msg.value >= newAmount);
        }
        else {
            IERC20Upgradeable(feeContractAddress).transferFrom(msg.sender, address(this), newAmount);
        }
        ERC721Upgradeable(contractAddress).transferFrom(msg.sender, address(this), tokenId);
        require(ERC721Upgradeable(contractAddress).ownerOf(tokenId) == address(this), "Wrong token ID");
        Token storage token = _tokens[_tokenVsIndex[feeContractAddress]];
        token.balance += newAmount;

        _idVsLockedAsset[_lockId]= LockedAsset({ contractAddress: contractAddress,beneficiary: beneficiary, tokenId:tokenId, 
                                                startDate: block.timestamp, endDate: endDate, status:Status.OPEN});
        _userVsLockIds[beneficiary].push(_lockId);
        _lockId++;

    }

    function _calculateFee(uint256 endDate) public view returns(uint256) { 
        uint256 fee;
        if ((endDate - block.timestamp)/31536000<=1){
            fee=1;
        } else {
            fee=(endDate - block.timestamp)/31556926;
        }
        return fee;
    }


    function claim(uint256 id) public payable canClaim(id) {
        LockedAsset storage asset = _idVsLockedAsset[id];
        console.log('11111111111111', asset.beneficiary, asset.tokenId, asset.contractAddress);
        ERC721Upgradeable(asset.contractAddress).transferFrom(address(this), asset.beneficiary, asset.tokenId);
        asset.status = Status.CLOSED;
    }

    modifier canClaim(uint256 id) {
        require(msg.sender == owner() , "Only owner can claim"); 
        LockedAsset memory asset = _idVsLockedAsset[id];
        require(asset.status == Status.OPEN,"Asset is closed");
        require(asset.endDate <= block.timestamp);
        _;
    }


    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}