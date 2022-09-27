require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('solidity-coverage')        //npx hardhat coverage
// require("hardhat-gas-reporter");
require('hardhat-contract-sizer');



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
      accounts: ["b78330805132f471817bc7db07168d1d26c8c162c0e96dfdf4a8b2016082101f"] // add the account that will deploy the contract (private key)
     },

    rinkeby: {
      url: "https://rinkeby.infura.io/v3/059d3e91176d43c79354db9156588d70", //Infura url with projectId
      accounts: ["b78330805132f471817bc7db07168d1d26c8c162c0e96dfdf4a8b2016082101f"] // add the account that will deploy the contract (private key)
     },


     hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/zSLEylkSYyz9hEvQcJBbdDq7Hk35HqAG",
      },
    }
   },
   etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "QBPG4NSN42M33J8HG3KCWBK35CM1DW1MGK"
  }
};
