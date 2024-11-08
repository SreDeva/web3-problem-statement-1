require("@nomicfoundation/hardhat-toolbox");


const { vars } = require("hardhat/config");

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/`,
      accounts: [""],
    },
    zkEVM: {
      url: `https://rpc.cardona.zkevm-rpc.com`,
      accounts: [""],
      },
    localhost: {
      url: 'http://localhost:8545',
      accounts: ["0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: "",
    },
  },
};
