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

  const BarterWithArrays = await deployments.get("BarterWithArrays");

  const contract = await ethers.getContractAt(
    BarterWithArrays.abi,
    BarterWithArrays.address
  );

  await contract.transferOwnership(
    "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd"
  );

  const toAddress = "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd";
  const toAddress2 = "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd";

  const yourCollectible1 = await deployments.get("YourCollectible");

  const yourCollectible = await ethers.getContractAt(
    yourCollectible1.abi,
    yourCollectible1.address
  );

  await yourCollectible.mint(toAddress, 0, 4, []);
  await yourCollectible.mint(toAddress2, 1, 10, []);

  const yourCollectible2 = await deployments.get("YourCollectible721");

  const yourCollectible721 = await ethers.getContractAt(
    yourCollectible2.abi,
    yourCollectible2.address
  );

  const buffalo = {
    description: "It's actually a bison?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://sun9-85.userapi.com/s/v1/if1/sIZa6xkZqOYGxZ9hsBGl7F7ybidrMOJRapgweYYjZWJKBUxl4Ddcw4tubcRXza9rWgsexfSy.jpg?size=450x447&quality=96&type=album",
    name: "Buffalo",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "green",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 42,
      },
    ],
  };
  console.log("Uploading buffalo...");
  const uploaded = await ipfs.add(JSON.stringify(buffalo));

  console.log("Minting buffalo with IPFS hash (" + uploaded.path + ")");
  await yourCollectible721.mintItem(toAddress, uploaded.path);

  const zebra = {
    description: "What is it so worried about?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://sun9-80.userapi.com/s/v1/if1/YkZQogx1oqngegXi8wP2iznpztUiTmforKH5WHwkX6Qmu7O1G3ji2Mpyq-hMvUHP5B7YGQ35.jpg?size=2560x1898&quality=96&type=album",
    name: "Zebra",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "blue",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 38,
      },
    ],
  };
  console.log("Uploading zebra...");
  const uploadedzebra = await ipfs.add(JSON.stringify(zebra));

  console.log("Minting zebra with IPFS hash (" + uploadedzebra.path + ")");
  await yourCollectible721.mintItem(toAddress2, uploadedzebra.path);

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
