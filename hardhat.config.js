require('@openzeppelin/hardhat-upgrades');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  networks: {
    ropsten: {
      url: "https://ropsten.infura.io/v3/059d3e91176d43c79354db9156588d70", //Infura url with projectId
      accounts: ["1313fd0ea9d450c6ef53c4a623efab294798eccff2bd77e5ac659da7f31a0400"] // add the account that will deploy the contract (private key)
     },
   },
   etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      ropsten: "QBPG4NSN42M33J8HG3KCWBK35CM1DW1MGK"
    }
  }
};