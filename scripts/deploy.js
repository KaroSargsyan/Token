const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
  const XLock = await ethers.getContractFactory("XLock");
  let lastHistory = fs.readFileSync("history.txt", 'utf8', (err, prev) => {

    if (err) {
      console.error(err);
      return;
    }
    prev=prev.split("\n");
    const lastHistoryId=Object.values(prev);
    console.log(lastHistoryId);
    return lastHistoryId=lastHistoryId.slice(-1);
  });

  console.log(lastHistory);
  const contract = await upgrades.deployProxy(XLock,[String(lastHistory)], {
    kind:"uups",
    initializer:"initialize" });
  await contract.deployed();
  console.log("MyContract deployed to:", contract.address);
}

main();

