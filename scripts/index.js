const { ethers } = require("hardhat");

async function main() {
    const MyContract = await ethers.getContractFactory("Box");
    const contract = await MyContract.attach("0xffC0F11c92F4E2e50b3f72Fd32BB3d034Ac77BDc");
    contract.val().then(r=>console.log( parseInt(r._hex,16)))



}   

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });