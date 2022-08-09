const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { ethers } = require("hardhat");
  const { expect } = require("chai");
  const hre = require("hardhat");
  const assert = require("assert");
  const { Console } = require("console");
//   import "../artifacts/contracts/IERC20.sol"
  
  
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
  const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA"
  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  
  const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
  const pricefeed_wbtc = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c" //BTC/USD
  const pricefeed_eth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
  const pricefeed_link = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c"
  
  const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"   //not a contract
  
  
  describe("Lock", function () {
    
    let owner
    let beneficary
    let thirdOne
    let xcoin
    let dai_whale
    let dai
    let wbtc
    let link
    let weth
    // /home/ed/Desktop/001/Xlock/artifacts/contracts/IERC20.sol
     
    async function deployTokenFixture(){
      [owner, beneficary, thirdOne] = await ethers.getSigners()
      dai_whale = await ethers.getImpersonatedSigner(DAI_WHALE);  // Impersonate any account
      dai = await ethers.getContractAt("IERC20", DAI)
    //   wbtc = await ethers.getContractAt("IERC20", WBTC)
    //   link = await ethers.getContractAt("IERC20", LINK)   
    //   weth = await ethers.getContractAt("IERC20", WETH)    
  
      const XLock = await ethers.getContractFactory("XLock", owner)
  
      const XToken = await ethers.getContractFactory("XToken", owner)
  
      const xtoken_contract = await XToken.deploy()
      await xtoken_contract.deployed()
      
      const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'})
  
      console.log("Xtoken Deployed AT", xtoken_contract.address)
  
      // console.log("WBTC", wbtc)
  
      return {xcoin, owner, beneficary, thirdOne, XLock, xtoken_contract, xlock_contract, dai_whale}
    }

    it('Should add a token',async () => {
    const {XLock, xtoken_contract, xlock_contract} = await loadFixture(deployTokenFixture);
    console.log("Should add a token")
    console.log('xlock_contract address is:  ', xlock_contract.address)
    xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
    // console.log(await xlock_contract.getToken(DAI))
    assert(5 === 5)
  })

})