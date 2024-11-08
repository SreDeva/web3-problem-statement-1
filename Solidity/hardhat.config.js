require("@nomicfoundation/hardhat-toolbox");


const { vars } = require("hardhat/config");

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/34595ba8d5054540908cf0ed72b6d25b`,
      accounts: ["2b3ad6396415696369a9b2a77981e9d85645f7b0504361a5cb22a2178e3543a1"],
    },
    zkEVM: {
      url: `https://rpc.cardona.zkevm-rpc.com`,
      accounts: ["2b3ad6396415696369a9b2a77981e9d85645f7b0504361a5cb22a2178e3543a1"],
      },
    localhost: {
      url: 'http://localhost:8545',
      accounts: ["0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: "DZKDEU2FRXMY5NS4WWFQGCD8UQINYZAV2Z",
    },
  },
};
