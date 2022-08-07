/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const delayMS = 1000; // sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {
  // ADDRESS TO MINT TO:
  const toAddress = "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd";
  const toAddress2 = "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd";

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = "0xa5B49719612954fa7bE1616B27Aff95eBBcdDfcd";

  const yourCollectible = await ethers.getContract("YourCollectible", deployer);

  await yourCollectible.mint(toAddress, 0, 4, []);
  await yourCollectible.mint(toAddress2, 1, 10, []);
  // await yourCollectible.mint(toAddress, 2, 2, [], { gasLimit: 400000 });
  // await yourCollectible.mint(toAddress, 3, 5, [], { gasLimit: 400000 });
  // await yourCollectible.mint(toAddress, 4, 6, [], { gasLimit: 400000 });
  // await yourCollectible.mint(toAddress, 5, 1, [], { gasLimit: 400000 });

  //await sleep(delayMS);

  const yourCollectible721 = await ethers.getContract(
    "YourCollectible721",
    deployer
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

  await sleep(delayMS);

  // console.log("Transferring Ownership of YourCollectible to "+toAddress+"...")

  // await yourCollectible.transferOwnership(toAddress)

  // await sleep(delayMS)
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
