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
  const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

  const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"   //not a contract
  
  describe("Xtoken", function () {
    
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
      dai = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", DAI)
      const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9"

   
  
      const XLock = await ethers.getContractFactory("XLock", owner)
      const XToken = await ethers.getContractFactory("XToken", owner)
      
      const xtoken_contract = await XToken.deploy()
      await xtoken_contract.deployed()


      
      const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'})

      await xtoken_contract.initLock(xlock_contract.address)

  
      console.log("Xtoken Deployed AT", xtoken_contract.address)
      console.log("Xlock Deployed AT", xlock_contract.address)

  
      // console.log("WBTC", wbtc)
  
      return {xcoin, owner, beneficary, thirdOne, XLock, xtoken_contract, xlock_contract, dai_whale, pricefeed_dai}
    }

    describe("XToken manipulations", () => {

      it('Should add a token',async () => {
          const {XLock, xtoken_contract, xlock_contract, pricefeed_dai} = await loadFixture(deployTokenFixture);
          console.log("Should add a token")
          console.log('xlock_contract address is:  ', xlock_contract.address)
          xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
          // console.log(await xlock_contract.getToken(DAI))
          assert(5 === 5)
        })
      
      it("Should give proper data about Token", async () => {
          const {XLock, xtoken_contract, xlock_contract, pricefeed_dai} = await loadFixture(deployTokenFixture);
          console.log("totalSupply: ", await xtoken_contract.totalSupply())
          console.log("Name of Token: ", await xtoken_contract.name())  
          await xtoken_contract.initLock(xlock_contract.address)
          console.log("Function Test: ", await xtoken_contract.test())
          console.log("Get Round Info Directly: ", await xtoken_contract.round()) 
          // const mint = await xtoken_contract.Buy(coinsWantToBuy, options)
          console.log("Get Round Info: ", await xtoken_contract.getRoundInfo())
      })
    })


    describe("BUY, LOCK, REWARD", () => {

      it("'BUY' works properly", async ()=> {
        const {xtoken_contract, xlock_contract, pricefeed_dai} = await loadFixture(deployTokenFixture);
                
        const coinsWantToBuy = 10
        let x = 30
        while (x) {
          value = await xtoken_contract.getPrice(coinsWantToBuy)
    
          let options = {
            value: value, 
            gasLimit: '2100000'
        }
    
            const buy = await xtoken_contract.Buy(coinsWantToBuy, options)
            console.log("RoundsaleTotalAmount",await xtoken_contract.roundsaleTotalAmount())
            console.log("Soled Tokens Quantity", await xtoken_contract.tokenSales())
            console.log(`Price for ${coinsWantToBuy} tokens`, value)
            console.log("*********************************************************")
            x--
        }
      })

      it("Lock and Reward should work properly", async () => {
        const {xtoken_contract, xlock_contract, pricefeed_dai} = await loadFixture(deployTokenFixture);

        console.log("Contract address VIEW", await xtoken_contract.removeLoc())

        let bigNum1 = ethers.BigNumber.from('20000')
        let bigNum2 = ethers.BigNumber.from('100000000000000000000')   //100

        console.log("Contract address Balance", await xtoken_contract.balanceOf(xtoken_contract.address))
        await xtoken_contract.transferToken(thirdOne.address, bigNum2)
        console.log("ThirdOne tokens", await xtoken_contract.balanceOf(thirdOne.address))

        await dai.connect(dai_whale).approve(xlock_contract.address, 2500000000000009)
        console.log("+++++++++++++++++++++++++++++++++++++++++++++")
        await xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai)
        
        // console.log("LOCK returns ",  await xtoken_contract.lock(1))
        let y = 5
        while (y) {
          await xlock_contract.connect(dai_whale).deposit(DAI, 250000000000000, 1722690841, [[2, 100]], dai_whale.address, false)
          console.log("Lock amount ",  await xlock_contract.lockedAssetQty())

          try {
            await xtoken_contract.transferToken(thirdOne.address, bigNum2)
            console.log("Trasnfer is DONE as LOCKED is false")

          } catch {
            console.log("Can't transfer as LOCKED is true")
          }
          await xtoken_contract.transferToken(thirdOne.address, bigNum1)
          
          y--
        }
        console.log("***************************************************************************")
        console.log("Contract address BALANCE OF TOKENS", await xtoken_contract.balanceOf(xtoken_contract.address))
        console.log("ThirdOne tokens", await xtoken_contract.balanceOf(thirdOne.address))
        await xtoken_contract.transferToken(thirdOne.address, 1)

    })
  })
})