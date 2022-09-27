const { ethers, upgrades } = require("hardhat");
const fs = require("fs");


async function main() {
    const DAI = "0x95b58a6Bff3D14B7DB2f5cb5F0Ad413DC2940658"
    const WETH = "0xc778417E063141139Fce010982780140Aa0cD5Ab"
    const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const LINK = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"
    const pricefeed_link = "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623";

    let link;
    let weth;
    const contractAddress = "0xdeF0e82834e770bAde33fD97542197836DF81786";
    const xtokenAddress = "0x39089bA8838b7CfcA012fC1afdA56E9b6b127877"

    const xlock_contract = await hre.ethers.getContractAt("XLock", contractAddress);
    const xtoken_contract =  await hre.ethers.getContractAt("XToken", xtokenAddress)
    console.log(xtoken_contract.address);

    // await xtoken_contract.initLock(contractAddress);   //OPEN when first deployed
    // console.log("Xlock from Xtoken", await xtoken_contract.loc());
    
    // console.log(xlock_contract);

    [owner] = await ethers.getSigners();

    // console.log("OWNER", owner)

    link = await ethers.getContractAt("IERC20", LINK);  
    weth = await ethers.getContractAt("IERC20", WETH)

    // console.log("LINK", await link.address)
    // let options =  { gasLimit: ethers.utils.parseUnits('91000', 'wei')};

    let options =  { 
      gasLimit: ethers.BigNumber.from(1100000),
      value: ethers.utils.parseEther("0.01")
    };

    // await xlock_contract.addToken(LINK, 2999, pricefeed_link);
    // await xlock_contract.addToken(WETH, 100, pricefeed_link);

    // await link.approve(xlock_contract.address, 100000);
    // await weth.approve(xlock_contract.address, 100000);
    await xlock_contract.deposit( WETH, 5555, 1743743187, [[2, 20], [3, 40], [4, 20], [5, 20]], owner.address, true, options);
    // await xlock_contract.claim(5, WETH, options);
    // await xlock_contract.claim(, WETH, options);

    console.log("DONE")
    // console.log("Approved Token", await xlock_contract.getToken(link.address));
    // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(0));
  }
  
  main();