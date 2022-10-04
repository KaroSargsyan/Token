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

      const NftSample = await ethers.getContractFactory("MyToken", owner);
      const nftSample = await NftSample.deploy();
      await nftSample.deployed();


      const XNft = await ethers.getContractFactory("XNft", owner);
      const xlock_nft = await upgrades.deployProxy(XNft, {kind: 'uups'});
      await xlock_nft.deployed();
      console.log("Nft contract deployesd at   ", xlock_nft.address);

      //
          
      return {xcoin, owner, beneficary, thirdOne, xlock_nft, coin_whale, nftSample};
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
        const {owner, beneficary, thirdOne, xlock_nft, coin_whale, nftSample} = await loadFixture(deployTokenFixture);
        
        xlock_nft.addToken(dai.address);
        console.log("*/*/*/*/*/*/*/*/*/*/*/*/*/*",await nftSample.owner())
        await nftSample.safeMint(coin_whale.address)

        console.log("Balance of owner AFTER nft minting:  ", await nftSample.balanceOf(owner.address))

        await nftSample.connect(coin_whale).approve(xlock_nft.address, 0);
        console.log("Approval is given to ", await nftSample.getApproved(0))

        await dai.connect(coin_whale).approve(xlock_nft.address, 250000000000000);

        console.log("Whale NFT balance BEFORE", await nftSample.balanceOf(coin_whale.address))
        console.log("Whale approved amount: ", await dai.allowance(coin_whale.address, xlock_nft.address))

        console.log("Whale's balance of DAI  ",await dai.balanceOf(coin_whale.address))
        await xlock_nft.connect(coin_whale).deposit(nftSample.address, thirdOne.address, dai.address, 0, 1722690841);
        console.log("Whale NFT balance AFTER", await nftSample.balanceOf(coin_whale.address))
    })


    it("Checks NFT claim when the date comes", async () => {
        const {owner, beneficary, thirdOne, xlock_nft, coin_whale, nftSample} = await loadFixture(deployTokenFixture);
        xlock_nft.addToken(dai.address);
        console.log("*/*/*/*/*/*/*/*/*/*/*/*/*/*", nftSample.address)
        await nftSample.safeMint(coin_whale.address)

        console.log("Balance of owner AFTER nft minting:  ", await nftSample.balanceOf(owner.address))

        await nftSample.connect(coin_whale).approve(xlock_nft.address, 0);
        console.log("Approval is given to ", await nftSample.getApproved(0))

        await dai.connect(coin_whale).approve(xlock_nft.address, 250000000000000);

        console.log("Whale NFT balance BEFORE", await nftSample.balanceOf(coin_whale.address))
        console.log("Our contract NFT balance BEFORE  ",await nftSample.balanceOf(xlock_nft.address))
        console.log("Whale approved amount: ", await dai.allowance(coin_whale.address, xlock_nft.address))

        await xlock_nft.connect(coin_whale).deposit(nftSample.address, thirdOne.address, dai.address, 0, 1722690841);
        console.log("Whale NFT balance AFTER", await nftSample.balanceOf(coin_whale.address))
        console.log("Our contract NFT balance AFTER  ",await nftSample.balanceOf(xlock_nft.address))


        //Change Time

        const year = 365 * 24 * 60 * 60;
  
        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;
    
        await ethers.provider.send('evm_increaseTime', [3*year]);
        await ethers.provider.send('evm_mine');

        const blockNumAfter = await ethers.provider.getBlockNumber();
        const blockAfter = await ethers.provider.getBlock(blockNumAfter);
        const timestampAfter = blockAfter.timestamp;
        console.log("Before", timestampBefore);
        console.log("After", timestampAfter);
        console.log("Owner of nft: ",await nftSample.ownerOf(0))
        await xlock_nft.claim(0);
        console.log("Beneficary NFT balance AFTER CLAIM", await nftSample.balanceOf(thirdOne.address))
        console.log("Our contract NFT balance AFTER CLAIM ",await nftSample.balanceOf(xlock_nft.address))
    })

    it ("Checks the service fee after deposit NOT eth", async () => {
      const {owner, beneficary, thirdOne, xlock_nft, coin_whale, nftSample} = await loadFixture(deployTokenFixture);
      xlock_nft.addToken(dai.address);
      console.log("*/*/*/*/*/*/*/*/*/*/*/*/*/*", nftSample.address)
      await nftSample.safeMint(coin_whale.address)

      console.log("Balance of owner AFTER nft minting:  ", await nftSample.balanceOf(owner.address))

      await nftSample.connect(coin_whale).approve(xlock_nft.address, 0);
      console.log("Approval is given to ", await nftSample.getApproved(0))

      await dai.connect(coin_whale).approve(xlock_nft.address, 250000000000000);

      // console.log("Whale NFT balance BEFORE", await nftSample.balanceOf(coin_whale.address))
      // console.log("Our contract NFT balance BEFORE  ",await nftSample.balanceOf(xlock_nft.address))
      // console.log("Whale approved amount: ", await dai.allowance(coin_whale.address, xlock_nft.address))

      console.log("Our contract balance BEFORE client's deposit",await  dai.balanceOf(xlock_nft.address))

      await xlock_nft.connect(coin_whale).deposit(nftSample.address, thirdOne.address, dai.address, 0, 1722690841);
      // console.log("Whale NFT balance AFTER", await nftSample.balanceOf(coin_whale.address))
      // console.log("Our contract NFT balance AFTER  ",await nftSample.balanceOf(xlock_nft.address))

      console.log("Our contract balance AFTER client's deposit",await  dai.balanceOf(xlock_nft.address))
    })


    it ("Checks the service fee after deposit ETH", async () => {
      const {owner, beneficary, thirdOne, xlock_nft, coin_whale, nftSample} = await loadFixture(deployTokenFixture);
      xlock_nft.addToken(dai.address);
      console.log("*/*/*/*/*/*/*/*/*/*/*/*/*/*", nftSample.address)
      await nftSample.safeMint(coin_whale.address)

      console.log("Balance of owner AFTER nft minting:  ", await nftSample.balanceOf(owner.address))

      await nftSample.connect(coin_whale).approve(xlock_nft.address, 0);
      console.log("Approval is given to ", await nftSample.getApproved(0))

      // console.log("Whale NFT balance BEFORE", await nftSample.balanceOf(coin_whale.address))
      // console.log("Our contract NFT balance BEFORE  ",await nftSample.balanceOf(xlock_nft.address))
      // console.log("Whale approved amount: ", await dai.allowance(coin_whale.address, xlock_nft.address))


      let amount = ethers.BigNumber.from('2000000000000000000000');
      let amount2  = ethers.utils.parseUnits('10', 'ether');

      console.log("Our contract ETH Balance BEFORE deposit", await ethers.provider.getBalance(xlock_nft.address))

      let options =  {gasPrice: ethers.utils.parseUnits('50', 'gwei'), value: ethers.utils.parseUnits('3', 'ether')};

      await xlock_nft.connect(coin_whale).deposit(nftSample.address, thirdOne.address, ETH, 0, 1722690841,options );

      console.log("Our contract ETH Balance AFTER deposit", await ethers.provider.getBalance(xlock_nft.address))

      // console.log("Whale NFT balance AFTER", await nftSample.balanceOf(coin_whale.address))
      // console.log("Our contract NFT balance AFTER  ",await nftSample.balanceOf(xlock_nft.address))

    })


   })
})