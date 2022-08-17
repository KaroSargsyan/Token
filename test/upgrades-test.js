const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { ethers, upgrades } = require("hardhat");
  const hre = require("hardhat");
  const assert = require("assert");
  
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  
  const pricefeed_dai = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9";
  
  const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";  //not a contract
  
  describe("Lock", function () {
    
    let owner;
    let beneficary;
    let thirdOne;
    let xcoin;
    let dai_whale;
    let dai;
     
    async function deployTokenFixture(){
      [owner, beneficary, thirdOne] = await ethers.getSigners();
      dai_whale = await ethers.getImpersonatedSigner(DAI_WHALE);  // Impersonate any account
      dai = await ethers.getContractAt("IERC20", DAI);  
  
      const XLock = await ethers.getContractFactory("XLock", owner);
      const XToken = await ethers.getContractFactory("XToken", owner);
      const xtoken_contract = await XToken.deploy();
      const xlock_contract = await hre.upgrades.deployProxy(XLock, [xtoken_contract.address], {kind: 'uups'});
      await xtoken_contract.deployed();
      
      console.log("Xtoken Deployed AT", xtoken_contract.address);
    
      return {xcoin, owner, beneficary, thirdOne, xtoken_contract, xlock_contract, dai_whale};
    }

    it('Should add a token',async () => {
    const {xlock_contract} = await loadFixture(deployTokenFixture);
    console.log("Should add a token");
    console.log('xlock_contract address is:  ', xlock_contract.address);
    xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai);
    assert(5 === 5);

    describe("Should be updated to", () => {
      it('Should be updated Xother1',async () => {
        const {xlock_contract} = await loadFixture(deployTokenFixture);
        const Other = await ethers.getContractFactory("Xother1");
        const other_contract = await upgrades.upgradeProxy(xlock_contract.address, Other);
        
        console.log("other_contract ADDRESS", other_contract.address);
        console.log("NEW FUNCTIONALITY",await  other_contract.newFunc());

    })   

      it('Should be updated Xother2',async () => {
        const {xlock_contract} = await loadFixture(deployTokenFixture);

        xlock_contract.addToken(DAI, 250000000000000, pricefeed_dai);

        const Other = await ethers.getContractFactory("Xother2");
        const other_contract = await upgrades.upgradeProxy(xlock_contract.address, Other);
        
        console.log("other_contract ADDRESS", other_contract.address);
        console.log("proxy address", xlock_contract.address);
        console.log("NEW FUNCTIONALITY",await  other_contract.newFunc());
        console.log("NEW FUNCTIONALITY addToken",await  other_contract.addToken(DAI, 250000000000000, pricefeed_dai));

      }) 
    })
  })
})