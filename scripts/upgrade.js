const { ethers, upgrades } = require("hardhat");

const PROXY="0x2Ca0339F8e547D3096DE77689D6516aF0A39131e"

async function main() {
  const boxv2 = await ethers.getContractFactory("BoxV2");

  await upgrades.upgradeProxy(PROXY,boxv2)

}

main();

