//Last change in 06.09.2022

const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { ethers, upgrades } = require("hardhat");
  const { expect } = require("chai");
  const hre = require("hardhat");
  
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  
  const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9";
  const pricefeed_wbtc = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"; //BTC/USD
  const pricefeed_eth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const pricefeed_link = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c";
  
  const COIN_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";  //not a contract
  
  
  describe("Lock", function () {
    let path = "IERC20"
  
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
      [owner, beneficary, thirdOne] = await ethers.getSigners();
      coin_whale = await ethers.getImpersonatedSigner(COIN_WHALE);  // Impersonate any account
      dai = await ethers.getContractAt(path, DAI);  //or contracts/IERC20.sol:IERC20
      wbtc = await ethers.getContractAt(path, WBTC);
      link = await ethers.getContractAt(path, LINK);
      weth = await ethers.getContractAt(path, WETH);    
  
      const XLock = await ethers.getContractFactory("XLock", owner);
      const XToken = await ethers.getContractFactory("XToken", owner);
      const xtoken_contract = await XToken.deploy();
      await xtoken_contract.deployed();
      
      const xlock_contract = await upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'});
  
      await xtoken_contract.initLock(xlock_contract.address);   //give XLock address to XLock contract 
  
      console.log("Xtoken Deployed AT", xtoken_contract.address);
  
      return {xcoin, owner, beneficary, thirdOne, xtoken_contract, xlock_contract, coin_whale};
    }
  
    
  
  
    // describe('Claim the locked funds', () => {

    //   // it("locked assets should be claimed properly", async () => {
    //   //   const {xlock_contract, coin_whale, beneficary} = await loadFixture(deployTokenFixture);
  
    //   //   xlock_contract.addToken(WBTC, 1, pricefeed_wbtc);
    //   //   await wbtc.connect(coin_whale).approve(xlock_contract.address, 100000);
    //   //   await xlock_contract.connect(coin_whale).deposit( WBTC, 10, 1743743187, [[25, 100]], beneficary.address, true, true, beneficary.address);
  
    //   //   // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
    //   //   console.log("EVENT", await xlock_contract._eventIs(0));
    //   //   console.log("LAST PRICE", await xlock_contract.getLatestPrice(pricefeed_wbtc))
    //   //   console.log("Beneficary Balance  of WBTC BEFORE", await wbtc.balanceOf(beneficary.address));
    
    //   //   console.log("Beneficary Balance  of DAI BEFORE 1111111111111111 Claim", await dai.balanceOf(beneficary.address));


    //   //   await xlock_contract.claim(0, DAI);
    //   //   // await xlock_contract.claim(0, ETH);
    //   //   // await xlock_contract.claim(0, ETH);
  
    //   //   console.log("Beneficary Balance  of DAI After 1111111111111111 Claim", await dai.balanceOf(beneficary.address));
    //   // })

  
    //   it('locked assets should be claimed properly when the EXPIRES', async () => {
  
    //     const {xlock_contract, coin_whale, beneficary} = await loadFixture(deployTokenFixture);
  
    //     xlock_contract.addToken(WBTC, 1000, pricefeed_wbtc);
    //     await wbtc.connect(coin_whale).approve(xlock_contract.address, 100000);
    //     await xlock_contract.connect(coin_whale).deposit( WBTC, 10000, 1743743187, [[25, 20], [20, 80]], beneficary.address, true, true, beneficary.address);
       
    //     console.log("_idVsLockedAsset ********", await xlock_contract._idVsLockedAsset(0));

    //     // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
    //     console.log("EVENT", await xlock_contract._eventIs(0));
    //     console.log("LAST PRICE", await xlock_contract.getLatestPrice(pricefeed_wbtc))    
  
    //     //CHANGING BLOCK TIMESTAMP-------------------------------------------------
  
    //     const year = 365 * 24 * 60 * 60;
    
    //     const blockNumBefore = await ethers.provider.getBlockNumber();
    //     const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    //     const timestampBefore = blockBefore.timestamp;
    //     await ethers.provider.send('evm_increaseTime', [5*year]);
    //     await ethers.provider.send('evm_mine');
    //     const blockNumAfter = await ethers.provider.getBlockNumber();
    //     const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    //     const timestampAfter = blockAfter.timestamp;
    //     console.log("Before", timestampBefore);
    //     console.log("After", timestampAfter);
  
    //   //--------------------------------------------------------------------------
          
    //     console.log("Beneficary Balance of WBTC BEFORE", await wbtc.balanceOf(beneficary.address));
  
    //     console.log("1st Claim");
    //     await xlock_contract.claim(0, WETH);   //Returns all amount as the date hits

    //     // console.log("2nd Claim");
    //     // await xlock_contract.claim(0, WETH);
        
    //     console.log("_idVsLockedAsset ********", await xlock_contract._idVsLockedAsset(0));

    //     console.log("Beneficary Balance of WETH", await weth.balanceOf(beneficary.address));
    //   })
  
    // })
  
  

  
    describe('SWAPS', () => {
  
      it('should swap properly deposited amounts ETH only', async () => {
  
        const {xlock_contract, coin_whale, thirdOne} = await loadFixture(deployTokenFixture);
        
        let amount = ethers.BigNumber.from('3000000000000000000');
        let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('5', 'ether')};
        
        xlock_contract.addToken(ETH, amount, pricefeed_eth);
    
        await xlock_contract.connect(coin_whale).deposit( ETH, amount, 1743743187, [[30, 50], [25, 50]], thirdOne.address, true, true, thirdOne.address, options)
      
        console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0));
        // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
  
        console.log("xlock_contract Balance of ETH before: ", await ethers.provider.getBalance(xlock_contract.address));
        console.log("Third Dai BEFORE", await dai.balanceOf(thirdOne.address));
  
        await xlock_contract.claim(0, DAI);
        await xlock_contract.claim(0, DAI);
        console.log("After Claim ------------------------------------------------------------");
        // console.log("AFTER CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
        console.log("ETH toekn info: ", await xlock_contract.getToken(ETH))
        console.log("xlock_contract Balance of ETH after: ", await ethers.provider.getBalance(xlock_contract.address));
        console.log("ThirdOne Balance of ETH: ", await ethers.provider.getBalance(thirdOne.address));
        console.log("Third Dai AFTER", await dai.balanceOf(thirdOne.address));
  
        
  
      })
  
      it('should swap properly deposited amounts not ETH', async () => {
        const {xlock_contract, coin_whale, beneficary} = await loadFixture(deployTokenFixture);
        const amount = ethers.BigNumber.from('3000000000000000000');
        const amoun_to_deposit = ethers.BigNumber.from("2000000000000000000");
        xlock_contract.addToken(LINK, 1, pricefeed_link);
      
        await link.connect(coin_whale).approve(xlock_contract.address,amount);
        await xlock_contract.connect(coin_whale).deposit( LINK, amoun_to_deposit, 1743743187, [[40, 10], [30, 70], [20, 20]], beneficary.address, true, true, beneficary.address)
  
        console.log("xlock_contract balance of WBTC", await wbtc.balanceOf(xlock_contract.address));
        console.log("WBTC toekn info: ", await xlock_contract.getToken(WBTC));
        // console.log("AFTER 2nd claim getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
        console.log("beneficary DAI", await dai.balanceOf(beneficary.address));
  
        await xlock_contract.claim(0, DAI);
  
        console.log("beneficary DAI", await dai.balanceOf(beneficary.address));
  
      })
    })
  })