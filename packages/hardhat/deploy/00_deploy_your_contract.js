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

  await deploy("ERC1155Lending", {
    from: deployer,
    log: true,
  });

  const ERC1155Lending = await ethers.getContract("ERC1155Lending", deployer);

  await ERC1155Lending.transferOwnership(
    "0xe45Ba4475C256d713B6A20C7d2552D3793e37854"
  );

  await deploy("ERC721Lending", {
    from: deployer,
    log: true,
  });

  const ERC721Lending = await ethers.getContract("ERC721Lending", deployer);

  await ERC721Lending.transferOwnership(
    "0xe45Ba4475C256d713B6A20C7d2552D3793e37854"
  );

  await deploy("Barter", {
    from: deployer,
    log: true,
  });

  const Barter = await ethers.getContract("Barter", deployer);

  await Barter.transferOwnership("0xe45Ba4475C256d713B6A20C7d2552D3793e37854");
  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
    
    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
module.exports.tags = [
  "YourCollectible",
  "YourCollectible721",
  "ERC1155Lending",
  "ERC721Lending",
  "Barter"
];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
