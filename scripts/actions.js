const { ethers, upgrades } = require("hardhat");
const fs = require("fs");


async function main() {
    const DAI = "0xE68104D83e647b7c1C15a91a8D8aAD21a51B3B3E" //GOERLI
    const WETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6" //GOERLI token
    const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const LINK = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"  //GOERLI token
    const WBTC = "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05" //Goerli
    const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"   //Goerli
    const pricefeed_link = "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623";


    let link;
    let weth;
    const xLock = "0xfF3A02b02F1E840700B3946e7497268fb4D3bC0D";  
    const xtokenAddress = "0x8D92a5B06507232e338a771388617047f14A69cE"  //GOERLI

    const xlock_contract = await hre.ethers.getContractAt("XLock", xLock);
    const xtoken_contract =  await hre.ethers.getContractAt("XToken", xtokenAddress)
    console.log(await xlock_contract.address);
    // const tx = await xtoken_contract.initLock(xLock)

    
    const tx_addToken = await xlock_contract.addToken('0x326C977E6efc84E512bB9C30f76E30c160eD06FB', 1, "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623")
    tx_addToken.wait()
    console.log("TTTTTTTT",await tx_addToken)
    const token = await xlock_contract._idVsLockedAsset(0)
    console.log("Token", await token)
    // const tx = await xlock_contract.getToken("0x326C977E6efc84E512bB9C30f76E30c160eD06FB")

    // console.log(await tx)

    // const tx_allowance = await xtoken_contract.allowance("0xb114E604972e7D2e510730768226DEB6B0F07363", xlock_contract.address)
   
    // console.log(await xlock_contract)

    // console.log(await tx_addToken)
    const amount = ethers.BigNumber.from('1000000000000');
    // console.log("MINIMUM AMOUNT", await xlock_contract.getAmountOutMin(WETH, UNI, amount));
    
    // options = {gasLimit: 21000000}
    // const tx_deposit = await xlock_contract.deposit(LINK, '0xb114E604972e7D2e510730768226DEB6B0F07363', LINK,  1000000000000000, 1722690841, [[200, 100]], false, false, options)
    // // await tx_deposit.wait()
    // console.log("Deposit is done")

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