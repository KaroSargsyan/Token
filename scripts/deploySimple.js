const { ethers, upgrades } = require("hardhat");
// const fs = require("fs");
const fs= require("fs");



async function main() {

  const XToken = await ethers.getContractFactory("XToken");
  const contract = await XToken.deploy()

  await contract.deployed();
  console.log("MyContract deployed to:", contract.address);
  fs.writeFile('history.txt', String(contract.address), function (err) {
    if (err) return console.log(err);
    console.log(contract.address);
  });  
}

main();


