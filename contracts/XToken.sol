// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./XLock.sol";
import "./ERC20.sol";
import "./Ownable.sol";

contract XToken is ERC20, Ownable {

    uint public tokenMaxSupply = 1000 * 10 ** decimals();
    uint lockedTokens = 500 * 10 ** decimals();
    uint rewardPoolTokens = 200 * 10 ** decimals();
    uint roundQuantity = 100;
    uint public tokenSales;
    uint roundEndDate;
    uint rewardSended;
    uint public index;
    uint public calculated_amount;
    bool issent;

    uint public roundsaleTotalAmount = 300;

    XLock loc;

    mapping(uint256 => address) public addresses;
    mapping (address => uint) public indicis;

//REMOVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
    address public sss = address(loc);
    function removeLoc() view public returns(address){
        return sss;
    }
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    struct Round{
        uint roundNumber;
        uint tokenPrice;
        uint remainTokens;
    }

    Round public round;    //change to internal

    constructor() ERC20("XToken", "XTK") {
        _mint(address(this), tokenMaxSupply);
        addIndex(address(this));
        round = Round(1, 1 ether , roundsaleTotalAmount);
        roundEndDate=block.timestamp+15555;
        // loc=XLock(payable(_addr));
    }

    function initLock(address _addr) public onlyOwner {
        loc=XLock(payable(_addr));
    }


    function setRound() public {
        require(roundsisOver() == false, "Round is over");
        if (tokenSales < roundQuantity){
            round.roundNumber = 1;
        }
        else if (tokenSales < roundQuantity*2) {
            round.roundNumber = 2;
        }
        else {
            round.roundNumber = 3;
        }
        
        round.tokenPrice=round.roundNumber*0.00025 ether;
        round.remainTokens= roundsaleTotalAmount - tokenSales;
    }

    function getRoundInfo() public view returns(uint,uint,uint){
        return (round.roundNumber,round.tokenPrice,round.remainTokens);
    }

    function sendTokensToRewardPool() public {
        require(roundsisOver() == true, "Sale is open");
        require(tokenSales <= roundsaleTotalAmount, "Tokens are sold or exceed maximum selling limits");
        require(issent == false,"tokens already sent");
        issent=true;
        rewardPoolTokens += roundsaleTotalAmount-tokenSales;
    }

    function roundsisOver() public view returns(bool){
            return block.timestamp>roundEndDate || tokenSales > roundsaleTotalAmount ;
    } 

    function getBalanceOfTokens() public view returns(uint balanceOfContract){
        balanceOfContract = balanceOf(address(this));
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }


    function addIndex(address _addr) private {
        if (indicis[_addr] == 0){
            addresses[index]=_addr; 
            indicis[_addr] = index;
            index++;
        }
    }


    function Buy (uint _amount) public payable {
        require(roundsisOver() == false, "round is over");
        require(tokenSales+_amount<=roundQuantity*3,"tokens are sold or amount exceeds maximum");
        require(msg.value >= getPrice(_amount), "Your funds are not enough");
        uint amount = _amount * 10 ** decimals();
        tokenSales +=  _amount;

        IERC20 thisAddress = IERC20(address(this));
        thisAddress.transfer(msg.sender, amount);

        setRound();
    }

// GET Price--------------------------------------------------------------------------------------

 function getPrice(uint amount) public view returns(uint){
     require (roundsaleTotalAmount - tokenSales >= amount, "Insert Valid Amount");
        uint dynamicPrice = 0.000000000000000001 ether;
        if (tokenSales < roundQuantity){
            if(amount + tokenSales < roundQuantity){
                dynamicPrice = amount * dynamicPrice;
            } else if (amount + tokenSales < roundQuantity*2){
                dynamicPrice = ((roundQuantity - tokenSales) * dynamicPrice) + 
                ((tokenSales + amount - roundQuantity) * dynamicPrice*2);
            } else{
                dynamicPrice = ((roundQuantity - tokenSales) * dynamicPrice) + 
                (roundQuantity * dynamicPrice*2) + ((amount-2*roundQuantity + 
                tokenSales)*dynamicPrice*3);
            }
        } else if(tokenSales < roundQuantity*2){
            if (amount + tokenSales < roundQuantity*2){
                dynamicPrice = amount * dynamicPrice*2;
            } else{
                dynamicPrice = (roundQuantity*2 - tokenSales) * dynamicPrice*2 + 
                (tokenSales + amount - roundQuantity*2) * dynamicPrice*3;
            }
        } else{
            dynamicPrice = amount * dynamicPrice*3;
            }
        return dynamicPrice;
    }

    //---------------------------------------------------------


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

    function transferToken(address to, uint amount) public{
        require(msg.sender == owner() || msg.sender == address(loc),"onlyOwner");
        IERC20 thisAddress = IERC20(address(this));
        thisAddress.transfer(to, amount);
    }

    function airdrop(address _addr,uint _amount) public {
        require(msg.sender == owner() || msg.sender == address(loc),"onlyOwner XXXXX");  //CHANGE: 
        require( rewardPoolTokens >= rewardSended,"rewardPoolTokens is transfered");
        uint amount = _amount * 10 ** decimals();
        rewardSended += amount;
        transferToken(_addr, amount);
    }

    modifier _lock(uint amount) {
        require(lock(amount)==true,"Is locked");
        _;
    }

    function lock(uint amount) public view returns(bool locked){     //CHANGE: internal
        // if ((msg.sender == address(this) || tx.origin == address(this)) && loc.lockedAssetQty() == true) {
        if (msg.sender == address(this) || tx.origin == address(this)) {
            if((balanceOf(address(this)) - amount < lockedTokens) && (loc.lockedAssetQty() == true)) {    //add timestamp
                return false;
            }     
        } 
        return true;
    }

    function test() public view returns(bool){
       return loc.lockedAssetQty();
    }
}