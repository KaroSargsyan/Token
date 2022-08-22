const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { ethers } = require("hardhat");
  const { expect } = require("chai");
  const hre = require("hardhat");
  
//   const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
//   const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  const LINK = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
//   const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  
  const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
//   const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9";
//   const pricefeed_wbtc = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; //BTC/USD
//   const pricefeed_eth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const pricefeed_link = "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623";
  
  const COIN_WHALE = "0xb114E604972e7D2e510730768226DEB6B0F07363";  //not a contract
  
  
  describe("Lock", function () {
    
    let owner;
    let beneficary;
    let thirdOne;
    let xcoin;
    let coin_whale;
    let dai;
    let wbtc;
    let link;
    let weth;
     
    async function deployTokenFixture(){
      [owner] = await ethers.getSigners();
    //   coin_whale = await ethers.getImpersonatedSigner(COIN_WHALE);  // Impersonate any account
    //   coin_whale = await ethers.getSigner("0xb114E604972e7D2e510730768226DEB6B0F07363")
    //   dai = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI);  //or contracts/IERC20.sol:IERC20
    //   wbtc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", WBTC);
      link = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", LINK);  
    //   weth = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", WETH);    

    //   console.log("OWNER ACCOUNT", owner.address, coin_whale.address)
  
      const XLock = await ethers.getContractFactory("XLock", owner);
      const XToken = await ethers.getContractFactory("XToken", owner);
      const xtoken_contract = await XToken.deploy();
      await xtoken_contract.deployed();
      
      const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'});
  
      await xtoken_contract.initLock(xlock_contract.address);   //give XLock address to XLock contract 
  
      console.log("Xtoken Deployed AT", xtoken_contract.address);

      console.log("OWNER", owner.address)

        xlock_contract.addToken(LINK, 1000, pricefeed_link);
        await link.connect(owner).approve(xlock_contract.address, 100000);
        await xlock_contract.connect(owner).deposit( LINK, 10000, 1743743187, [[2, 20], [3, 40], [4, 20], [5, 20]], owner.address, false);


        console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
        // console.log("EVENT", await xlock_contract._eventIs(0));

        console.log("1111111111111111111111111111 Claim is Done")

  
      return {xcoin, owner, thirdOne, xtoken_contract, xlock_contract};
    }

    describe('Claim the locked funds', () => {

        it('locked assets should be claimed properly', async () => {
    
          const {xlock_contract, owner} = await loadFixture(deployTokenFixture);

        })
    })

})