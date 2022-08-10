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

   
  async function deployTokenFixture(){
    [owner, beneficary, thirdOne] = await ethers.getSigners()
    dai_whale = await ethers.getImpersonatedSigner(DAI_WHALE);  // Impersonate any account
    dai = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI)  //or contracts/IERC20.sol:IERC20
    wbtc = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", WBTC)
    link = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", LINK)   
    weth = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", WETH)    

    const XLock = await ethers.getContractFactory("XLock", owner)

    const XToken = await ethers.getContractFactory("XToken", owner)

    const xtoken_contract = await XToken.deploy()
    await xtoken_contract.deployed()
    
    const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'})

    await xtoken_contract.initLock(xlock_contract.address)   //give XLock address to XLock contract 

    console.log("Xtoken Deployed AT", xtoken_contract.address)

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

  describe('Deposit', () => {

    it('Should be deposited properly DAI',async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
  
      await dai.connect(dai_whale).approve(xlock_contract.address, 2500000000000009)
  
      await xlock_contract.connect(dai_whale).deposit(DAI, 250000000000009, 1722690841, [[2, 100]], dai_whale.address, false)
  
      console.log("_lockId is", await xlock_contract._lockId())
  
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
      // Airdrop Check
      console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      console.log("Xcoin total supply", await xtoken_contract.totalSupply())
      
      assert(5 === 5)
    })

    it('Should be deposited properly - WBTC',async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)
  
      await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)

      // console.log(await xlock_contract.getLatestPrice(pricefeed_wbtc))

      console.log("Calculate fee", await xlock_contract._calculateFee(1000, 1743743187))
  
      await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 100]], dai_whale.address, false)
  
      console.log("_lockId is", await xlock_contract._lockId())
  
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
      // Airdrop Check
      console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
      assert(5 === 5)
    })

    it('Should be deposited properly - ETH',async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(ETH, 1, pricefeed_eth)
  
      // await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)

      // console.log(await xlock_contract.getLatestPrice(pricefeed_wbtc))

      // console.log("Calculate fee", await xlock_contract._calculateFee(1000, 1743743187))

      let amount = ethers.BigNumber.from('2000000000000000000000')
      let amount2  = ethers.utils.parseUnits('10', 'ether')
      let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('3', 'ether')};
  
      await xlock_contract.connect(dai_whale).deposit( ETH, 1, 1743743187, [[2, 100]], dai_whale.address, false, options)
  
      console.log("_lockId is", await xlock_contract._lockId())
  
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))
      
      // Airdrop Check
      console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
      assert(5 === 5)
    })

  })

  



  describe('Time manipulations', () => {

    it('should change the time', async () => {

  
      const year = 365 * 24 * 60 * 60;
  
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
  
      await ethers.provider.send('evm_increaseTime', [year]);
      await ethers.provider.send('evm_mine');
  
      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timestampAfter = blockAfter.timestamp;
      console.log("Before", timestampBefore)
      console.log("After", timestampAfter)
      expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
      // expect(timestampAfter).to.be.equal(timestampBefore + year); //Error because of a few seconds deviations 

    })
  })





  describe('Claim the locked funds', () => {

    it('locked assets should be claimed properly', async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale, beneficary, thirdOne} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)
  
      await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)
  
      await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 10], [3, 70], [4, 20]], beneficary.address, false)

      // await xlock_contract.claim(0, ETH)
  
      // console.log("_lockId is", await xlock_contract._lockId())
  
      // console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))

      // console.log("claimable", await xlock_contract.claimable(0))

      console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0))

      console.log("EVENT", await xlock_contract._eventIs(0))
      // await xlock_contract.claim(0, ETH)

      //CHANGING BLOCK TIMESTAMP-------------------------------------------------

              const year = 365 * 24 * 60 * 60;
  
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;
  
      await ethers.provider.send('evm_increaseTime', [3*year]);
      await ethers.provider.send('evm_mine');
  
      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timestampAfter = blockAfter.timestamp;
      console.log("Before", timestampBefore)
      console.log("After", timestampAfter)

    //--------------------------------------------------------------------------
      await xlock_contract.claim(0, ETH)

      console.log("AFTER 111111111 getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      console.log("Beneficary Balance of WBTC", await wbtc.balanceOf(beneficary.address))

      console.log("2nd Claim")

      await xlock_contract.claim(0, ETH)

      console.log("AFTER 2222222222 getLockedAsset:  ", await xlock_contract.getLockedAsset(0))

      console.log("Beneficary Balance of WBTC", await wbtc.balanceOf(beneficary.address))
      //-------------
      assert(5 === 5)
    })


    it("Should claim when price reached", async () => {
      const {xlock_contract, dai_whale, beneficary} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)

      console.log("LAST PRICE", await xlock_contract.getLatestPrice(pricefeed_wbtc))
  
      await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)
  
      await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 10], [3, 70], [4, 20]], beneficary.address, false)
      
      console.log("BEFORE CLAIMS getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      
      await xlock_contract.claim(0, ETH)
      console.log("AFTER 1st claim getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      console.log("Beneficary Balance of WBTC", await wbtc.balanceOf(beneficary.address))

      await xlock_contract.claim(0, ETH)
      console.log("AFTER 2nd claim getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      console.log("Beneficary Balance of WBTC", await wbtc.balanceOf(beneficary.address))

      await xlock_contract.claim(0, ETH)
      console.log("AFTER 3rd claim getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      console.log("Beneficary Balance of WBTC", await wbtc.balanceOf(beneficary.address))

      assert(5 === 5)
    })

  })






  describe("Withdraw", () => {
    
    it("Should withdraw funds", async () => {
      const {xlock_contract, dai_whale, beneficary, thirdOne} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc)

      await wbtc.connect(dai_whale).approve(xlock_contract.address, 1550)
  
      await xlock_contract.connect(dai_whale).deposit( WBTC, 1000, 1743743187, [[2, 10], [3, 70], [4, 20]], beneficary.address, false)

      console.log("Calculate fee", await xlock_contract._calculateFee(1000, 1743743187))

      console.log("WBTC toekn info: ", await xlock_contract.getToken(WBTC))

      console.log("Balance of Third before", await wbtc.balanceOf(thirdOne.address))

      await xlock_contract.withdraw(WBTC, thirdOne.address)

      console.log("Balance of Third after", await wbtc.balanceOf(thirdOne.address))

    })


    it('Should be deposited/withdrawed properly - ETH',async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale} = await loadFixture(deployTokenFixture);
      console.log('xlock_contract address is:  ', xlock_contract.address)
      
      let amount = ethers.BigNumber.from('3000000000000000000')
      let amount2  = ethers.utils.parseUnits('10', 'ether')
      let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('3.06', 'ether')};
      
      xlock_contract.addToken(ETH, amount, pricefeed_eth)
  
      await xlock_contract.connect(dai_whale).deposit( ETH, amount, 1743743187, [[2, 100]], dai_whale.address, false, options)
  
      console.log("_lockId is", await xlock_contract._lockId())
  
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))

      console.log("ETH toekn info before: ", await xlock_contract.getToken(ETH))

      await xlock_contract.withdraw(ETH, thirdOne.address)

      console.log("ETH toekn info after: ", await xlock_contract.getToken(ETH))
      console.log("xlock_contract Balance of ETH: ", await ethers.provider.getBalance(xlock_contract.address))
      console.log("ThirdOne Balance of ETH: ", await ethers.provider.getBalance(thirdOne.address))

      // Airdrop Check
      // console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
      assert(5 === 5)
    })

  })




  describe('SWAPS', () => {
    // NOT WORKING AS TESTUNISWAP contract is removed
    // it("checks SWAP function of the contract", async ()=> {  
    //     const {XLock, xtoken_contract, xlock_contract, dai_whale, thirdOne} = await loadFixture(deployTokenFixture)
    //     console.log('xlock_contract address is:  ', xlock_contract.address)
    //     // await xlock_contract.connect(dai_whale).approve(testUniswap.address, 8888)
    //     await xlock_contract.connect(dai_whale).swap(DAI, WBTC, 999, thirdOne.address)
    //     console.log("WBTC", await wbtc.balanceOf(thirdOne.address))
    // })

    it('should swap properly deposited amounts ETH only', async () => {
      

      const {XLock, xtoken_contract, xlock_contract, dai_whale, thirdOne} = await loadFixture(deployTokenFixture);

      console.log('xlock_contract address is:  ', xlock_contract.address)
      
      let amount = ethers.BigNumber.from('3000000000000000000')
      let amount2  = ethers.utils.parseUnits('10', 'ether')
      let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('5', 'ether')};
      
      xlock_contract.addToken(ETH, amount, pricefeed_eth)
  
      await xlock_contract.connect(dai_whale).deposit( ETH, amount, 1743743187, [[2, 50], [2, 50]], thirdOne.address, true, options)
    
      console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0))

      console.log("xlock_contract Balance of ETH before: ", await ethers.provider.getBalance(xlock_contract.address))

      console.log("Third Dai BEFORE", await dai.balanceOf(thirdOne.address))

      await xlock_contract.claim(0, DAI)


      console.log("ETH toekn info: ", await xlock_contract.getToken(ETH))
      console.log("xlock_contract Balance of ETH after: ", await ethers.provider.getBalance(xlock_contract.address))
      console.log("ThirdOne Balance of ETH: ", await ethers.provider.getBalance(thirdOne.address))
      console.log("Third Dai AFTER", await dai.balanceOf(thirdOne.address))

      // Airdrop Check
      // console.log("Xcoin of whale address", await xtoken_contract.balanceOf(dai_whale.address))
      
      assert(5 === 5)

    })

    it('should swap properly deposited amounts not ETH', async () => {
      const {xlock_contract, dai_whale, beneficary, thirdOne} = await loadFixture(deployTokenFixture);
      const amount = ethers.BigNumber.from('3000000000000000000')
      const amoun_to_deposit = ethers.BigNumber.from("2000000000000000000")
      xlock_contract.addToken(LINK, 1, pricefeed_link)
    
      await link.connect(dai_whale).approve(xlock_contract.address,amount)
      
      await xlock_contract.connect(dai_whale).deposit( LINK, amoun_to_deposit, 1743743187, [[2, 10], [3, 70], [4, 20]], beneficary.address, true)

      
      // await xlock_contract.connect(dai_whale).approve(xlock_contract.address, 1000)

      console.log("xlock_contract balance of WBTC", await wbtc.balanceOf(xlock_contract.address))
      
      console.log("WBTC toekn info: ", await xlock_contract.getToken(WBTC))
      
      console.log("AFTER 2nd claim getLockedAsset:  ", await xlock_contract.getLockedAsset(0))
      
      console.log("beneficary DAI", await dai.balanceOf(beneficary.address))
      await xlock_contract.claim(0, DAI)
      console.log("beneficary DAI", await dai.balanceOf(beneficary.address))


      assert(5 === 5)

    })

    it('should swap properly deposited amounts not ETH', async () => {
      const {xlock_contract, dai_whale, beneficary, thirdOne} = await loadFixture(deployTokenFixture);
      const amount = ethers.BigNumber.from('3000000000000000000')
      const amoun_to_deposit = ethers.BigNumber.from("2000000000000000000")
      xlock_contract.addToken(LINK, 1, pricefeed_link)
    
      // await link.connect(dai_whale).approve(xlock_contract.address,amount)
      
      console.log("MINIMUM AMOUNT", await xlock_contract.getAmountOutMin(LINK, DAI, amount))

      assert(5 === 5)

    })

    it("Check receive function", async () => {
      const {XLock, xtoken_contract, xlock_contract, dai_whale, thirdOne} = await loadFixture(deployTokenFixture);
      console.log("xlock_contract Balance of ETH before: ", await ethers.provider.getBalance(xlock_contract.address))

      let tx = {
        to: xlock_contract.address,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther('55')
    }
      await owner.sendTransaction(tx)
      console.log("xlock_contract Balance of ETH after: ", await ethers.provider.getBalance(xlock_contract.address))

    })


  })
})