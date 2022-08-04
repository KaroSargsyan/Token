// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./XLock.sol";
import "./ERC20.sol";
import "./Ownable.sol";

contract XToken is ERC20, Ownable {

    uint public tokenMaxSupply = 1000000 * 10 ** decimals();
    uint lockedTokens = 500000 * 10 ** decimals();
    uint rewardPoolTokens = 200000 * 10 ** decimals();
    uint roundQuantity = 100000 * 10 ** decimals();
    uint tokenSales;
    uint roundEndDate;
    uint rewardSended;
    uint public index;
    uint public tokenPrice = 0.01 ether;
    uint public calculated_amount;
    bool issent;
    uint lockedQty;

    // XLock loc;


    mapping(uint256 => address) public addresses;
    mapping (address => uint) public indicis;

    
    struct Round{
        uint roundNumber;
        uint tokenPrice;
        uint remainTokens;
    }

    Round round;


    constructor() ERC20("Xlock", "XLK") {
        _mint(address(this), tokenMaxSupply );
        addIndex(address(this));
        round = Round(1, 0.01 ether ,roundQuantity);
        roundEndDate=block.timestamp+15;
        // loc=XLock(payable(_addr));
    }


    function getRound() public returns(uint,uint,uint){
        require(roundsisOver() == false, "Round is over");
        if (tokenSales < roundQuantity*round.roundNumber){
            round.roundNumber = 1;
        }
        else if (tokenSales < roundQuantity*round.roundNumber) {
            round.roundNumber = 2;
        }
        else {
            round.roundNumber = 3;
        }
        
        round.tokenPrice=round.roundNumber*0.01 ether;
        round.remainTokens=3000000 - tokenSales;
        
        return (round.roundNumber,round.tokenPrice,round.remainTokens);
    }

    function sendTokensToRewardPool() public {
        require(roundsisOver() == true, "Sale is open");
        require(tokenSales <= 300000, "Tokens are sold");
        require(issent == false,"tokens already sent");
        issent=true;
        rewardPoolTokens+=300000-tokenSales;
    }

    function roundsisOver() public view returns(bool){
            return block.timestamp>roundEndDate || tokenSales>=300000 ;
    } 

    
    function getRoundInfo() public view returns(uint,uint,uint){
        return (round.roundNumber,round.tokenPrice,round.remainTokens);
    }


    function getBalanceOfTokens() public view returns(uint balanceOfContract){
        balanceOfContract = balanceOf(address(this));
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }


    function addIndex(address _addr) public {
        if (indicis[_addr] == 0){
            addresses[index]=_addr; 
            indicis[_addr] = index;
            index++;
        }
    }


    function Buy (uint _amount) public payable {
        require(roundsisOver() == false, "round is over");
        require(tokenSales+_amount<roundQuantity*3,"tokens saled");
        require(msg.value >= _amount * round.tokenPrice, "Your funds are not enough");
        uint amount = _amount * 10 ** decimals();
        tokenSales +=  _amount;
        transferToken(msg.sender,amount);
    }


    function transfer(address to, uint256 amount) public virtual override _lock(amount) returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        addIndex(to);
        return true;
    }


    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override _lock(amount) returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        addIndex(to);
        return true;
    }


    function approve(address spender, uint256 amount) public virtual override _lock(amount) returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }


    function withdraw(address _address) public onlyOwner {
        uint256 balance = address(this).balance;
        payable(_address).transfer(balance);
    }

    function transferToken(address to, uint amount) public {
        IERC20 thisAddress = IERC20(address(this));
        thisAddress.transfer(to, amount);
    }

    function airdrop(address _addr,uint _amount) public {
        // require(msg.sender == owner() || msg.sender == address(loc),"onlyOwner");
        require( rewardPoolTokens>= rewardSended,"rewardPoolTokens is transfered");
        uint amount = _amount * 10 ** decimals();
        rewardSended += amount;
        transferToken(_addr, amount);
    }


    modifier _lock(uint amount) {
        require(lock(amount)==true,"Is locked");
        _;
    }

    function lock(uint amount) internal view returns(bool locked){
      
        // if ((msg.sender == address(this) || tx.origin == address(this)) && loc.lockedAssetQty() == true) {
        if (msg.sender == address(this) || tx.origin == address(this)) {
            if(balanceOf(address(this)) - amount < lockedTokens){
                return false;
            }        
        }
        return true;
    }
}