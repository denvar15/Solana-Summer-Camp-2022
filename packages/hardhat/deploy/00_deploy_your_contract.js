// deploy/00_deploy_your_contract.js
const ipfsAPI = require("ipfs-http-client");
const { globSource } = require("ipfs-http-client");
const { ethers } = require("hardhat");

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // First, we upload the metadata to IPFS and get the CID
  const file = await ipfs.add(
    globSource("./erc1155metadata", { recursive: true })
  );
  console.log(file.cid.toString());
  const tokenUri = "https://ipfs.io/ipfs/" + file.cid.toString() + "/{id}.json";

  await deploy("YourCollectible", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [tokenUri],
    log: true,
  });

  await deploy("YourCollectible721", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  await deploy("BarterWithArrays", {
    from: deployer,
    log: true,
  });

  await deploy("WrapperFactory", {
    from: deployer,
    log: true,
  });

  const BarterWithArrays = await ethers.getContract(
    "BarterWithArrays",
    deployer
  );

  await BarterWithArrays.transferOwnership(
    "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd"
  );

};
module.exports.tags = [
  "YourCollectible",
  "YourCollectible721",
  "BarterWithArrays",
];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
