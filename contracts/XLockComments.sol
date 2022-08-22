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
    mapping(uint256 => LockedAsset) _idVsLockedAsset; 

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
        WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        DAI = 0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658;
        Wallet = 0x0aB61E7C46C6C682C8fC72E110Edf69699DAA8D2;
        xtoken = XToken(addr);
    }
    
    receive() payable external {
    }    


    /**
    * @dev Returns information about token
    * @param _tokenAddress token address
    */
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


    /**
    * @dev Returns information about a locked asset
    * @param id Asset id
    */
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
        priceInUSD = asset.priceInUSD;


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


    /**
    * @dev Allows owner to add new token to the list
    * @param token Address of the token
    * @param minAmount Minimum amount of tokens to lock for this token
    * @param priceFeedAddress Price feed address of tokens pair 
    */
    function addToken(address token, uint256 minAmount, address priceFeedAddress) public onlyOwner {
        _tokens.push(Token({tokenAddress: token, minAmount: minAmount, 
            balance:0,priceFeedAddress:priceFeedAddress}));
        _tokenVsIndex[token] = _tokens.length-1;
    }


    /**
    * @dev Allows user to lock asset. In case of ERC-20 token the user will
    * first have to approve the contract to spend on his/her behalf
    * @param _token Address of the token to be locked
    * @param amount List of amount of tokens to lock
    * @param endDate Duration of locked asset
    * @param option Nasted list of asset options x and procent
    * @param beneficiary Beneficiarie of locked asset
    * @param isExchangable Bool to check if locked token to be swapped or not
    */
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
            ERC20Upgradeable(_token).transferFrom(msg.sender, address(this), newAmount);
        }
        endDate += block.timestamp;
        int priceInUSD = getLatestPrice(token.priceFeedAddress);

        _idVsLockedAsset[_lockId]= LockedAsset({ token: _token, amount: amount, startDate: block.timestamp, 
            endDate: endDate, lastLocked: block.timestamp, option: option, 
            beneficiary: beneficiary, isExchangable:isExchangable,status:Status.OPEN,priceInUSD:priceInUSD});
        _userVsLockIds[beneficiary].push(_lockId);
        xtoken.airdrop(msg.sender,1);
        _lockId++;

    }


    /**
    * @dev Allows owner to swap token fee from token balance
    */
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


    /**
    * @dev Allows owner withdraw token fee balance from token balance
    */
    function withdraw(address tokenAddress, address _receiver) public payable onlyOwner { 
        uint256 index = _tokenVsIndex[tokenAddress];
        Token storage token = _tokens[index];
        uint transferingAmount=token.balance;
        token.balance = 0;
        if (tokenAddress==ETH){
            payable(_receiver).transfer(transferingAmount);
        } else { 
            ERC20Upgradeable(tokenAddress).transfer(_receiver, transferingAmount);
        }
    }


    /**
    * @dev Allows beneficiary of locked asset to claim asset after lock-up period ends or event confirmation 
    * @param id Id of the locked asset
    */
    function claim(uint256 id, address SWAPTOKEN ) public payable canClaim(id) {
        LockedAsset storage asset = _idVsLockedAsset[id];
        uint newAmount;
        if (asset.endDate <= block.timestamp) {
            for(uint i = 0; i < asset.option.length-1; i++) {
                newAmount+=asset.option[0][1];
                delete asset.option;
            }            
        } else {
            newAmount=((asset.amount*asset.option[0][1])/100);
            for(uint i = 0; i < asset.option.length-1; i++){
                asset.option[i] = asset.option[i+1];
            }
            asset.option.pop();
        }
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
                ERC20Upgradeable(asset.token).transfer(asset.beneficiary, newAmount);
            }
        }
    }

    
    /**
    @dev Modifier for claim 
    @param id Locked asset id
    */
    modifier canClaim(uint256 id) {
        require(msg.sender == owner() , "Only owner can claim" ); 
        require(claimable(id), "Can't claim asset");
        _;
    }


    /**
    * @dev Returns whether given asset can be claimed or not
    * @param id id of an asset
    */
    function claimable(uint256 id) internal view returns(bool _claimable){  
        LockedAsset memory asset = _idVsLockedAsset[id];
        require(asset.status == Status.OPEN,"Asset is closed");
        if( (asset.endDate <= block.timestamp) || _eventIs(id)) {        
            return true;
        }
    }


    /**
    * @dev Helper for locked asset option event happened or not 
    * @param id locked asset id
    */
    function _eventIs(uint id) internal view returns(bool success ) { 
        LockedAsset memory asset = _idVsLockedAsset[id];
        int newAmount = asset.priceInUSD*int(asset.option[0][0]);
        (
            /*address tokenAddress*/,
            /*uint256 minAmount*/,
            /*uint balance*/,
            address _priceFeedAddress
        ) = getToken(asset.token); 
        int oraclePrice = getLatestPrice(_priceFeedAddress);  

        if (oraclePrice >= newAmount){           
            return true;
        } else {
            return false;
        }
    } 


    /** 
    @dev Helper method to calculate fee
    */
    function _calculateFee(uint _amount, uint endDate) internal view returns(uint256) {
        uint fee;
        if ((endDate - block.timestamp)/31536000<=1){
            fee=1;
        } else {
            fee=(endDate - block.timestamp)/31536000;
        }

        uint  calculatedAmount=_amount+(_amount*fee/100);
        return calculatedAmount;
    }


    /**
    * @dev Swaps an exact amount of input tokens or ETH for as many output tokens as possible
    * @param _tokenIn Token address to swap in
    * @param _tokenOut Token address to swap out
    * @param _amountIn The amount of input tokens to send.
    * @param _to Recipient of the output tokens.
    */
    function swap (
        address _tokenIn, 
        address _tokenOut, 
        uint _amountIn, 
        address _to
    ) 
        internal onlyOwner      
    {                                                       
        if (_tokenIn == ETH){
            uint amount_in = _amountIn;
            address[] memory path = new address[](2);
            path[0] = WETH;
            path[1] = _tokenOut;

            IUniswapV2Router01(UNISWAP_V2_ROUTER).swapExactETHForTokens{value: amount_in} (
                amount_in,
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


    /**
    * @dev Calculates all subsequent maximum output token amounts 
    * by calling getReserves for each pair of token addresses 
    */
    function getAmountOutMin(        
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) 
        public view returns (uint256) 
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


    /**
    * @dev Returnes last oracle price from given price feed address
    */
    function getLatestPrice(address _priceFeedAddress) internal view returns (int) {  
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


    /**
    * @dev Returnes locked asset quantity is greather then const number or not 
    */
    function lockedAssetQty() public view returns(bool){  
        return _lockId<100000;
    }


    /**
    *@dev Upgrade the implementation of the proxy to newImplementation
    */
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

    


}
