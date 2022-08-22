const { ethers, upgrades } = require("hardhat");
const fs = require("fs");


async function main() {
    const LINK = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"
    const pricefeed_link = "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623";

    let link;
    const contractAddress = "0x0708F9097C28fE10f58942b1f1082935e88D19F5";
    const xtokenAddress = "0x677Db3847E672a38a19354813d1f7c494df8831d"
    const xlock_contract = await hre.ethers.getContractAt("XLock", contractAddress);
    
    // console.log(xlock_contract);

    [owner] = await ethers.getSigners();

    // console.log("OWNER", owner)

    link = await ethers.getContractAt("IERC20", LINK);  

    // console.log("LINK", await link.address)
    let options =  { gasLimit: ethers.utils.parseUnits('91000', 'wei')};

    await xlock_contract.addToken(LINK, 1000, pricefeed_link);
    await link.approve(xlock_contract.address, 100000);
    await xlock_contract.deposit( LINK, 10000, 1743743187, [[2, 20], [3, 40], [4, 20], [5, 20]], owner.address, false, options);
    console.log("Approved Token", await xlock_contract.getToken(link.address))
    // console.log("BEFORE CLAIM getLockedAsset:  ", await xlock_contract.getLockedAsset(1));
  }
  
  main();