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

      //NFT deploy

      const Nft = await ethers.getContractFactory("MyToken", owner);
      const nft_contract = await Nft.deploy();
      await nft_contract.deployed();
      console.log("Nft contract deployesd at   ", nft_contract.address);

      //
      
      const xlock_contract = await upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'});
  
      await xtoken_contract.initLock(xlock_contract.address);   //give XLock address to XLock contract 
  
      console.log("Xtoken Deployed AT", xtoken_contract.address);
  
      return {xcoin, owner, beneficary, thirdOne, xtoken_contract, xlock_contract, nft_contract, coin_whale};
    }
  
  
    describe('Deposit', () => {
  
    //   it('Should be deposited properly DAI',async () => {
    //     const {xtoken_contract, xlock_contract, coin_whale, thirdOne} = await loadFixture(deployTokenFixture);
    //     console.log('xlock_contract address is:  ', xlock_contract.address);
    //     xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai);
    
    //     await dai.connect(coin_whale).approve(xlock_contract.address, 2500000000000009);
    
    //     await xlock_contract.connect(coin_whale).deposit(DAI, 250000000000009, 1722690841, [[200, 100]], coin_whale.address, false, false, coin_whale.address)

    //     console.log("_lockId is", await xlock_contract._lockId());
    //     console.log("_idVsLockedAsset", await xlock_contract._idVsLockedAsset(0));
        
    //     // Airdrop Check
    //     console.log("Xcoin of whale address", await xtoken_contract.balanceOf(coin_whale.address));
    //     console.log("Xcoin total supply", await xtoken_contract.totalSupply());
  
    //     //Whale sends his token to other account to trigger transfer
  
    //     await xtoken_contract.connect(coin_whale).transfer(thirdOne.address, 999999);
    //     console.log("thirdOne Balance", await xtoken_contract.balanceOf(thirdOne.address));
    //     let addr = await xlock_contract.getAddress(1);
    //     console.log("From Xtoken addresses", addr);
    //     })

    it("Checks NFT deposit",async ()=> {
        const {xtoken_contract, xlock_contract,nft_contract, coin_whale, thirdOne} = await loadFixture(deployTokenFixture);
        
        // console.log(nft_contract)
        await nft_contract.safeMint(owner.address)

        console.log("Balance of owner BEFORE:  ", await nft_contract.balanceOf(owner.address))

        await nft_contract.approve(xlock_contract.address, 0);
        await xlock_contract.depositNft(1722690841, 0, nft_contract.address, thirdOne.address);

        console.log("Balance of owner:  AFTER", await nft_contract.balanceOf(owner.address))
        console.log("Balance of Xlock contractr:  ", await nft_contract.balanceOf(xlock_contract.address))
    })


    it("Checks NFT claim when the date comes", async () => {
      
    })
      })
    })