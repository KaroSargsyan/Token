const { ethers, upgrades } = require("hardhat");
const fs = require("fs");


async function main() {
    // const DAI = "0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658"
    // const WETH = "0xc778417E063141139Fce010982780140Aa0cD5Ab"
    // const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    // const LINK = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"  //GOERLI token
    // const pricefeed_link = "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623";

    // let link;
    // let weth;
    const xLock = "0x5fea9C39b3b662B69607cd83817F72d4F5468175";  
    const xtokenAddress = "0x4d8013567bc151B427ADaBDa7A71c615BBDD2abB"  //SEPOLIA

    const xlock_contract = await hre.ethers.getContractAt("XLock", xLock);
    const xtoken_contract =  await hre.ethers.getContractAt("XToken", xtokenAddress)
    // console.log(await xtoken_contract);
    // const tx = await xtoken_contract.initLock(xLock)

    // const tx = await xlock_contract.getToken("0x326C977E6efc84E512bB9C30f76E30c160eD06FB")

    // console.log(await tx)

    // const tx_allowance = await xtoken_contract.allowance("0xb114E604972e7D2e510730768226DEB6B0F07363", xlock_contract.address)
   
    // console.log(await xlock_contract)

    const tx_addToken = await xlock_contract.addToken('0xc778417E063141139Fce010982780140Aa0cD5Ab', 1, "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623")
    console.log(await tx_addToken)

    options = {gasLimit: 29000000}

    
    const tx_deposit = await xlock_contract.deposit(xtokenAddress, '0xb114E604972e7D2e510730768226DEB6B0F07363', xtokenAddress,  10000, 1722690841, [[200, 100]], false, false, options)
    // await tx_deposit.wait()
    console.log("Deposit is done")

    // await xtoken_contract.initLock(contractAddress);   //OPEN when first deployed
    // console.log("Xlock from Xtoken", await xtoken_contract.loc());
    
    // console.log(xlock_contract);

    // [owner] = await ethers.getSigners();

    // console.log("OWNER", owner)

    // link = await ethers.getContractAt("IERC20", LINK);  
    // weth = await ethers.getContractAt("IERC20", WETH)

    // console.log("LINK", await link.address)
    // let options =  { gasLimit: ethers.utils.parseUnits('91000', 'wei')};

    // let options =  { 
    //   gasLimit: ethers.BigNumber.from(1100000),
    //   value: ethers.utils.parseEther("0.01")
    // };

    // await xlock_contract.addToken(LINK, 2999, pricefeed_link);
    // await xlock_contract.addToken(WETH, 100, pricefeed_link);

    // await link.approve(xlock_contract.address, 100000);
    // await weth.approve(xlock_contract.address, 100000);
    // await xlock_contract.deposit( WETH, 5555, 1743743187, [[2, 20], [3, 40], [4, 20], [5, 20]], owner.address, true, options);
    // await xlock_contract.claim(5, WETH, options);
    // await xlock_contract.claim(, WETH, options);

    // console.log("DONE")
    // console.log("Approved Token", await xlock_contract.getToken(link.address));
    // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
  }
  
  main();