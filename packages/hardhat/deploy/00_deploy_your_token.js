// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("PENT", {
    from: deployer,
    log: true,
  });

  // Getting a previously deployed contract
  // const YourToken = await ethers.getContract("PENT", deployer);
  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  // if (chainId !== localChainId) {
  //   await run("verify:verify", {
  //     address: YourToken.address,
  //     contract: "contracts/PENT.sol:PENT",
  //     contractArguments: [],
  //   });
  // }
};
module.exports.tags = ["PGF"];
