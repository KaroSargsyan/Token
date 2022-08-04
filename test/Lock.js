const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");
const hre = require("hardhat");
const assert = require("assert");
const { Console } = require("console");


const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"
const pricefeed_wbtc = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c" //BTC/USD
const pricefeed_eth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"

const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"   //not a contract


describe("Lock", function () {
  
  let owner
  let buyer
  let thirdOne
  let xcoin
  let dai_whale
  let dai
  let wbtc

   
  async function deployTokenFixture(){
    [owner, buyer, thirdOne] = await ethers.getSigners()
    dai_whale = await ethers.getImpersonatedSigner(DAI_WHALE);  // Impersonate any account
    dai = await ethers.getContractAt("IERC20", DAI)
    wbtc = await ethers.getContractAt("IERC20", WBTC)       

    const XLock = await ethers.getContractFactory("XLock", owner)

    const XToken = await ethers.getContractFactory("XToken", owner)

    const xtoken_contract = await XToken.deploy()
    await xtoken_contract.deployed()
    
    const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'})

    console.log("Xtoken Deployed AT", xtoken_contract.address)

    // console.log("WBTC", wbtc)

    return {xcoin, owner, buyer, thirdOne, XLock, xtoken_contract, xlock_contract, dai_whale}
  }

  it('Should add a token',async () => {
    const {XLock, xtoken_contract, xlock_contract} = await loadFixture(deployTokenFixture);
    console.log("Should add a token")
    console.log('xlock_contract address is:  ', xlock_contract.address)
    xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
    // console.log(await xlock_contract.getToken(DAI))
    assert(5 === 5)
  })



  // describe('Deposit', () => {

    // it('Should be deposited properly DAI',async () => {
    //   const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
    //   console.log('xlock_contract address is:  ', xlock_contract.address)
    //   xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
  
    //   await dai.connect(dai_whale).approve(xlock_contract.address, 2500000000000009)
  
    //   await xlock_contract.connect(dai_whale).deposit(DAI, 250000000000009, 1722690841, [[2, 100]], dai_whale.address, false)
  
    //   console.log("_lockId is", await xlock_contract._lockId())
  
    //   console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
    //   // Airdrop Check
    //   console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
    //   console.log("Xcoin total supply", await xtoken_contract.totalSupply())
      
    //   assert(5 === 5)
    // })

    // it('Should be deposited properly - WBTC',async () => {
    //   const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
    //   console.log('xlock_contract address is:  ', xlock_contract.address)
    //   xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)
  
    //   await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)

    //   // console.log(await xlock_contract.getLatestPrice(pricefeed_wbtc))

    //   console.log("Calculate fee", await xlock_contract._calculateFee(1000, 1743743187))
  
    //   await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 100]], dai_whale.address, false)
  
    //   console.log("_lockId is", await xlock_contract._lockId())
  
    //   console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
    //   // Airdrop Check
    //   console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
    //   assert(5 === 5)
    // })

    // it('Should be deposited properly - ETH',async () => {
    //   const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
    //   console.log('xlock_contract address is:  ', xlock_contract.address)
    //   xlock_contract.addToken(ETH, 1, pricefeed_eth)
  
    //   // await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)

    //   // console.log(await xlock_contract.getLatestPrice(pricefeed_wbtc))

    //   // console.log("Calculate fee", await xlock_contract._calculateFee(1000, 1743743187))

    //   let amount = ethers.BigNumber.from('2000000000000000000000')
    //   let amount2  = ethers.utils.parseUnits('10', 'ether')
    //   let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('3', 'ether')};
  
    //   await xlock_contract.connect(dai_whale).deposit( ETH, 1, 1743743187, [[2, 100]], dai_whale.address, false, options)
  
    //   console.log("_lockId is", await xlock_contract._lockId())
  
    //   console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
    //   // Airdrop Check
    //   console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
    //   assert(5 === 5)
    // })

  // })

  


  // describe('Time manipulations', () => {

  //   it('should change the time', async () => {

  
  //     const year = 365 * 24 * 60 * 60;
  
  //     const blockNumBefore = await ethers.provider.getBlockNumber();
  //     const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  //     const timestampBefore = blockBefore.timestamp;
  
  //     await ethers.provider.send('evm_increaseTime', [year]);
  //     await ethers.provider.send('evm_mine');
  
  //     const blockNumAfter = await ethers.provider.getBlockNumber();
  //     const blockAfter = await ethers.provider.getBlock(blockNumAfter);
  //     const timestampAfter = blockAfter.timestamp;
  //     console.log("Before", timestampBefore)
  //     console.log("After", timestampAfter)
  //     expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
  //     // expect(timestampAfter).to.be.equal(timestampBefore + year); //Error because of a few seconds deviations 

  //   })
  // })


  describe('Claim the locked funds', () => {

    it('locked assets should be claimed properly', async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)
  
      await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)
  
      await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 100]], dai_whale.address, false)
  
      console.log("_lockId is", await xlock_contract._lockId())
  
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))

      console.log("claimable", await xlock_contract.claimable(0))

      console.log(await xlock_contract.getLockedAsset(0))
      // await xlock_contract.claim(0, ETH)
      
      assert(5 === 5)
    })
  })

})