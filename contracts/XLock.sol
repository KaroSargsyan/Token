// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "./ERC20Upgradeable.sol";
import "./OwnableUpgradeable.sol";
import "./Initializable.sol";
import "./UUPSUpgradeable.sol";
import "./IUniswapV2Router01.sol";
import "./AggregatorV3Interface.sol";
import "./XToken.sol";
import "hardhat/console.sol";

contract XLock is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    
    address private  UNISWAP_V2_ROUTER ;
    address private  ETH ;
    address private  WETH;
    address private  DAI ;
    address private  Wallet;

    uint256 private minLockDate;
    uint256 public _lockId;
    
    enum Status {x,CLOSED,OPEN}

    mapping(address => uint256)  _tokenVsIndex;
    mapping(address => uint256[])  _userVsLockIds;
    mapping(uint256 => LockedAsset) public  _idVsLockedAsset;    //CHANGE: remove public

    XToken xtoken;

    struct Token {
        address tokenAddress;
        uint256 minAmount;
        uint256 balance;
        address priceFeedAddress;
    }

    struct LockedAsset {
        address token;
        uint amount;
        uint startDate;
        uint endDate;
        uint lastLocked;
        uint[][] option;
        address payable beneficiary;
        bool isExchangable;
        Status status;
        int priceInUSD;
    }

    Token[] private _tokens;
    
    
    function initialize(address addr) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
        minLockDate = 1 ;
        UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
        ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        WETH = 0xc778417E063141139Fce010982780140Aa0cD5Ab;
        DAI = 0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658;
        Wallet = 0x0aB61E7C46C6C682C8fC72E110Edf69699DAA8D2;
        xtoken = XToken(addr);
    }
    

    receive() payable external {
    }    


    function getToken(address _tokenAddress) public view returns(
        address tokenAddress, 
        uint256 minAmount, 
        uint balance, 
        address priceFeedAddress 
    )
    {
        uint256 index = _tokenVsIndex[_tokenAddress];
        Token memory token = _tokens[index];
        return (token.tokenAddress, token.minAmount,token.balance,token.priceFeedAddress);
    }


    function getLockedAsset(uint256 id) external view returns(
        address token,
        address beneficiary,
        uint256 amount,
        uint256 startDate,
        uint256 endDate,
        uint256 lastLocked,
        bool isExchangable,
        Status status,
        uint[][] memory option,
        int priceInUSD
    )
    {
        LockedAsset memory asset = _idVsLockedAsset[id];
        token = asset.token;
        amount = asset.amount;
        startDate = asset.startDate;
        endDate = asset.endDate;
        beneficiary = asset.beneficiary;
        lastLocked = asset.lastLocked;
        status=asset.status;
        isExchangable=asset.isExchangable;
        option  = asset.option;

        return(
            token,
            beneficiary,
            amount,
            startDate,
            endDate,
            lastLocked,
            isExchangable,
            status,
            option,
            priceInUSD
        );
    }


    function addToken(address token, uint256 minAmount, address priceFeedAddress) public onlyOwner {
        _tokens.push(Token({tokenAddress: token, minAmount: minAmount, 
            balance:0,priceFeedAddress:priceFeedAddress}));
        _tokenVsIndex[token] = _tokens.length-1;
    }


    function deposit(
        address _token,
        uint amount, 
        uint endDate, 
        uint[][] memory option ,    
        address payable beneficiary , 
        bool isExchangable
    ) 
        public payable 
    {
        
        require(beneficiary != address(0),"Send valid beneficiary address");
        require(_token != address(0),"Send valid token address");
        require(endDate>=minLockDate,"Send correct endDate");
        Token storage token = _tokens[_tokenVsIndex[_token]];
        require(amount >= token.minAmount,"Minimum amount of tokens");
        uint _totalprocent;

        for (uint i =0; i< option.length  ; i++){
            if (_totalprocent + option[i][1] > 100) {
                revert("Ops must be equal to 100"); 
            } 
            _totalprocent +=  option[i][1];
        }
        uint newAmount=_calculateFee(amount,endDate);
        token.balance+=newAmount-amount;
        
        if(ETH == _token) {
            require( msg.value >= newAmount,"Insufficient funds");
            token.balance += msg.value - newAmount;
        } else {
            // console.log("Aaaaaaaaaaaaaa", msg.sender, address(this), newAmount);
            ERC20Upgradeable(_token).transferFrom(msg.sender, address(this), newAmount);

        }
        // endDate += block.timestamp;
        int priceInUSD = getLatestPrice(token.priceFeedAddress);

        _idVsLockedAsset[_lockId]= LockedAsset({ token: _token, amount: amount, startDate: block.timestamp, 
            endDate: endDate, lastLocked: block.timestamp, option: option, 
            beneficiary: beneficiary, isExchangable:isExchangable,status:Status.OPEN,priceInUSD:priceInUSD});
        _userVsLockIds[beneficiary].push(_lockId);
        xtoken.airdrop(msg.sender,1);
        _lockId++;

    }


    function swapTokenBalance(
        address tokenIn, 
        address tokenOut
    ) 
        public payable onlyOwner 
    {
        uint256 index = _tokenVsIndex[tokenIn]; 
        Token storage token = _tokens[index];
        uint swapingAmount=token.balance;
        token.balance = 0;
        swap(tokenIn, tokenOut, swapingAmount, Wallet);
    }


    function withdraw(address tokenAddress, address _receiver) public payable onlyOwner {  //CHANGE remove: address _receiver
        uint256 index = _tokenVsIndex[tokenAddress];
        Token storage token = _tokens[index];
        uint transferingAmount=token.balance;
        token.balance = 0;
        if (tokenAddress==ETH){
            payable(Wallet).transfer(transferingAmount);
        } else { 
            ERC20Upgradeable(tokenAddress).transfer(_receiver, transferingAmount);
        }

    }


    function claim(uint256 id, address SWAPTOKEN ) public payable canClaim(id) {
        LockedAsset storage asset = _idVsLockedAsset[id];
        uint newAmount=((asset.amount*asset.option[0][1])/100);
        console.log("1111111111111111111111111111");
        for(uint i = 0; i < asset.option.length-1; i++){
            asset.option[i] = asset.option[i+1];      
        }
        asset.option.pop();
        if (asset.option.length==0){
            asset.status = Status.CLOSED;
        }
        
        if(ETH == asset.token) {
            if (asset.isExchangable){
                swap(asset.token, SWAPTOKEN, newAmount, asset.beneficiary);
            } else {
                payable(asset.beneficiary).transfer(newAmount);
            }
        } else {
            if (asset.isExchangable){
                swap(asset.token, SWAPTOKEN, newAmount, asset.beneficiary);
            } else {
                console.log("22222222222222222222");
                ERC20Upgradeable(asset.token).transfer(asset.beneficiary, newAmount);
            }
        }

    }


    modifier canClaim(uint256 id) {
        require(msg.sender == owner() , "Only owner can claim" ); 
        require(claimable(id), "Can't claim asset");
        _;
    }


    function claimable(uint256 id) public view returns(bool _claimable){   //CHANGE: internal
        LockedAsset memory asset = _idVsLockedAsset[id];
        require(asset.status == Status.OPEN,"Asset is closed");
        if( (asset.endDate <= block.timestamp) || _eventIs(id)) {        //CHANGE: uncomment
            return true;
        }
    }


    function _eventIs(uint id) public view returns(bool success ) { //CHANGE: internal
        LockedAsset memory asset = _idVsLockedAsset[id];
        int newAmount = asset.priceInUSD*int(asset.option[0][0]);
        (
            /*address tokenAddress*/,
            /*uint256 minAmount*/,
            /*uint balance*/,
            address _priceFeedAddress
        ) = getToken(asset.token); 
        int oraclePrice = getLatestPrice(_priceFeedAddress);  

        if (3*oraclePrice >= newAmount){           //  CHANGE: remove 3*

            return true;
        } else {
            return false;
        }
    } 


    //     function _eventIs(uint id) public view returns(int){ //CHANGE: internal
    //     LockedAsset memory asset = _idVsLockedAsset[id];
    //     int newAmount = asset.priceInUSD*int(asset.option[0][0]);
    //     (
    //         /*address tokenAddress*/,
    //         /*uint256 minAmount*/,
    //         /*uint balance*/,
    //         address _priceFeedAddress
    //     ) = getToken(asset.token); 
    //     // int oraclePrice = getLatestPrice(_priceFeedAddress);
    //     return newAmount;
    // }


    function _calculateFee(uint _amount, uint endDate) public view returns(uint256) { //CHANGE: internal
        uint fee;
        if ((endDate - block.timestamp)/31536000<=1){
            fee=1;
        } else {
            fee=(endDate - block.timestamp)/31556926;
        }

        //2629743

        uint  calculatedAmount=_amount+(_amount*fee/100);
        return calculatedAmount;
    }


    function swap (
        address _tokenIn, 
        address _tokenOut, 
        uint _amountIn, 
        address _to
    ) 
        internal onlyOwner      
    {                                                       
        if (_tokenIn == ETH){
            address[] memory path = new address[](2);
            path[0] = WETH;
            path[1] = _tokenOut;

            IUniswapV2Router01(UNISWAP_V2_ROUTER).swapETHForExactTokens{value:msg.value} (
                _amountIn,
                path,
                _to,
                block.timestamp
            );
        } else {
    
            ERC20Upgradeable(_tokenIn).approve(UNISWAP_V2_ROUTER, _amountIn);
            uint amountOutMin = getAmountOutMin(_tokenIn, _tokenOut, _amountIn);
            address[] memory path;

            if (_tokenIn == WETH || _tokenOut == WETH) {
                path = new address[](2);
                path[0] = _tokenIn;
                path[1] = _tokenOut;
            } else {
                path = new address[](3);
                path[0] = _tokenIn;
                path[1] = WETH;
                path[2] = _tokenOut;
            }        
            
            IUniswapV2Router01(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
                _amountIn,
                amountOutMin,
                path,
                _to,
                block.timestamp
            );
        }
    }


    function getAmountOutMin(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) 
        internal view returns (uint256) 
    {
        address[] memory path;
        if (_tokenIn == WETH || _tokenOut == WETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = WETH;
            path[2] = _tokenOut;
        }

        uint256[] memory amountOutMins = IUniswapV2Router01(UNISWAP_V2_ROUTER).getAmountsOut(_amountIn,path);
        return amountOutMins[path.length -1]; 
    }


    function getLatestPrice(address _priceFeedAddress) public view returns (int) {    //CHANGE: internal
        AggregatorV3Interface priceFeed;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }


    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // function royality(address balanceAddress) public returns(uint calculated_amount) {
    //     uint256 index = _tokenVsIndex[balanceAddress];
    //     Token storage token = _tokens[index];
    //     calculated_amount = token.balance +xtoken.tokenMaxSupply();
    //     for(uint i;i<index;i++){
    //         xtoken.transferToken(xtoken.addresses(i),(xtoken.balanceOf(xtoken.addresses(i))*calculated_amount));
    //     }
    // }


    function lockedAssetQty() public view returns(bool){
        return _lockId<100000;
    }

}