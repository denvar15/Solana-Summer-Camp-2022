import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, Input, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "../bootstrap-utilites.css";
import { NodeExpandOutlined } from "@ant-design/icons";
import { base58_to_binary, binary_to_base58 } from "base58-js";
import { web3 } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram,
  Connection,
  PublicKey,
  SYSVAR_RENT_PUBKEY, TransactionInstruction, AccountMeta
} from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import axie from "../img/axie.jpg";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

import { AddressInput, Sidebar } from "./index";

const { Header, Content, Sider } = Layout;
const { Meta } = Card;
const { BufferList } = require("bl");
const axios = require('axios')
//const ipfsAPI = require("ipfs-http-client");
const {create} = require('ipfs-http-client')
const auth = 'Basic ' + Buffer.from("2DAF3VlkmCD9NtqMk2hIxxawzak" + ':' + "f3c411643318af9767a14a1a7c4ca6b9").toString('base64');
const ipfs = create({ url: "https://denvar15.infura-ipfs.io/ipfs", headers: { Authorization: auth } });

const contractName = "RentContract";
const tokenName = "YourCollectible";
const tokenName721 = "YourCollectible721";

const targetNetwork = localStorage.getItem("targetNetwork");

const getFromIPFS = async hashToGet => {
  let response = await  axios.get("https://denvar15.infura-ipfs.io/ipfs/" + hashToGet)
  return JSON.stringify(response.data);
};

function hexStringToByteArray(hexString) {
  if (hexString.length % 2 !== 0) {
    throw "Must have an even number of hex digits to convert to bytes";
  } /* w w w.  jav  a2 s .  c o  m */
  const numBytes = hexString.length / 2;
  const byteArray = new Uint8Array(numBytes);
  for (let i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return byteArray;
}

const gridStyle = {
  width: "25%",
  textAlign: "center",
};
export default function StartRent(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [solanaNFT, setSolanaNFT] = useState([]);
  const [selectedWantedNFT, setSelectedWantedNFT] = useState({ address: [], id: [], standard: [] });
  const [selectedOfferNFT, setSelectedOfferNFT] = useState({ address: [], id: [], standard: [], model: [], json: [], mintAddress: [] });
  const { wallet } = useWallet();

  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const getSolana = async () => {
    if (targetNetwork == 245022926) {
      const connection = new Connection(clusterApiUrl("devnet"));
      let accs = await connection.getParsedTokenAccountsByOwner(wallet.adapter._wallet.publicKey, { programId: TOKEN_PROGRAM_ID })
      let res = []
      const mx = Metaplex.make(connection);
      for (const acc of accs.value) {
        let balance = await connection.getTokenAccountBalance(acc.pubkey)
        if (balance.value.amount > 0) {
          let detailedAcc = await getAccount(connection, acc.pubkey)
          try {
            const nft = await mx.nfts().findByMint(detailedAcc.mint).run();
            res.push(nft)
          } catch(e) {
            //console.log("NOT NFT")
          }
        }
      }
      setSolanaNFT(res);
    }
  }

  useEffect(() => {
    const updateCollectibles721 = async () => {
      const collectibleUpdate = [];
      let totalSupply = await props.readContracts.YourCollectible721.totalSupply();
      totalSupply = totalSupply.toNumber();
      for (let tokenIndex = 1; tokenIndex < totalSupply + 1; tokenIndex++) {
        try {
          // let tokenId = await props.readContracts.YourCollectible721.tokenOfOwnerByIndex(props.address, tokenIndex);
          const tokenId = tokenIndex;
          const tokenURI = await props.readContracts.YourCollectible721.tokenURI(tokenId);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              ...jsonManifest,
              standard: 721,
              address: props.readContracts.YourCollectible721.address,
            });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles721(collectibleUpdate);
    };

    getSolana();
    updateCollectibles721();
  }, []);

  async function setApproval1155() {
    const approveTx = await tx(
      writeContracts[tokenName].setApprovalForAll(props.readContracts[contractName].address, 1),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  async function setApproval721() {
    const approveTx = await tx(
      writeContracts[tokenName721].setApprovalForAll(props.readContracts[contractName].address, 1),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  async function setApproval20(i) {
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint amount)",
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    const erc20_rw = new ethers.Contract(selectedOfferNFT.address[i], abi, props.signer);
    const approveTx = await tx(
      erc20_rw.approve(props.readContracts[contractName].address, 1),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);

  }

  /*async function selectOfferNFT(item) {
    try {
      const old = selectedOfferNFT;
      const oldElem = document.getElementById(old.id + "_" + old.uri + "offer");
      oldElem.style.border = "";
    } catch (e) {
      console.log(e);
    }

    const elem = document.getElementById(item.id + "_" + item.uri + "offer");
    elem.style.border = "solid white 3px";
    setSelectedOfferNFT(item);
  }*/

  async function selectOfferNFT(item) {
    const old = selectedOfferNFT;
    const elem = document.getElementById(item.id + "_" + item.uri + "offer");
    if (elem.style.border) {
      elem.style.border = null;
      for (let i = 0; i < old.address.length; i++) {
        if (old.address[i] === item.address) {
          old.address.splice(i);
          old.id.splice(i);
          old.standard.splice(i);
          old.model.splice(i);
          old.json.splice(i);
          old.mintAddress.splice(i);
        }
      }
    } else {
      elem.style.border = "solid white 3px";
      if (item.model === 'nft') {
        old.address.push(null);
        old.model.push(item.model);
        old.json.push(item.json);
        old.mintAddress.push(item.mintAddress.toString());
        old.id.push(0);
        old.standard.push(20);
      } else {
        old.id.push(item.id);
        old.standard.push(item.standard);
        old.address.push(item.address);
        old.model.push(0);
        old.json.push({});
        old.mintAddress.push("");
      }
    }
    setSelectedOfferNFT(old);
  }


  function create_account_layout(ether, nonce) {
    let struct = {
      ether: ether,
      nonce: nonce
    }
    var mainbytesArray = [];
    for(var i = 0; i < struct.length; i++){
      var bytes = [];
      for (var j = 0; j < struct[i].length; ++j)
        bytes.push(struct[i].charCodeAt(j));
      mainbytesArray.push(bytes);
    }
    return hexStringToByteArray("18") + mainbytesArray
  }

  async function transfer(tokenMintAddress, wallet, to, connection, wrap, index) {
    const mintPublicKey = new web3.PublicKey(tokenMintAddress);

    let EVM_LOADER_ID = new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU");
    const eth_account_addressbytes1 = hexStringToByteArray(props.address.slice(2));
    let neon_acc = PublicKey.findProgramAddressSync(
      [hexStringToByteArray("01"), eth_account_addressbytes1],
      new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"),
    )[0];

    const eth_account_addressbytes = hexStringToByteArray(wrap.slice(2));
    const solana_contract_address = PublicKey.findProgramAddressSync(
      [hexStringToByteArray("01"), eth_account_addressbytes],
      new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"),
    )[0];

    let source_token_acc = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey)

    let neon_accInfo = await connection.getAccountInfo(neon_acc);

    let nonce = 255;

    let trx = new Transaction()
    if (!neon_accInfo) {
      console.log("HEELO")
      trx.add(new TransactionInstruction({
        programId: EVM_LOADER_ID,
        data: create_account_layout(hexStringToByteArray(props.address.slice(2)), nonce),
        keys: [
          {pubkey: wallet.publicKey, isSigner: true, isWritable: true},
          {pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false},
          {pubkey: neon_acc, isSigner: false, isWritable: true},
        ]}))
    }

    let destAccInfo = await connection.getAccountInfo(to);

    if (!destAccInfo) {
      trx.add(new TransactionInstruction({
        programId: EVM_LOADER_ID,
        data: hexStringToByteArray('0F'),
        keys: [
          {pubkey: wallet.publicKey, isSigner: true, isWritable: true},
          {pubkey: to, isSigner: false, isWritable: true},
          {pubkey: neon_acc, isSigner: false, isWritable: true},
          {pubkey: solana_contract_address, isSigner: false, isWritable: true},
          {pubkey: mintPublicKey, isSigner: false, isWritable: true},
          {pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false},
          {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
          {pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false},
        ]}))
    }

    trx.add(new TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      data: hexStringToByteArray("030100000000000000"),
      keys: [
        {pubkey: source_token_acc, isSigner: false, isWritable: true},
        {pubkey: to, isSigner: false, isWritable: true},
        {pubkey: wallet.publicKey, isSigner: true, isWritable: false},
      ]}))

    trx.feePayer = wallet.publicKey;
    trx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    let res1 = await wallet.signAndSendTransaction(trx, connection)
    console.log("res1", res1)
    if (res1) {
      getSolana();
      selectedOfferNFT.address[index] = wrap
    }
  }

  async function SolidityChecks(i) {
    const tokenMint = base58_to_binary(selectedOfferNFT.mintAddress[i]);
    const tokenMintAddressSolana = binary_to_base58(tokenMint)
    const a = await props.readContracts.WrapperFactory.createWrapp(tokenMint);
    const b = await props.readContracts.WrapperFactory.allWrapps(1, 1);
    console.log("WRAP", b[b.length - 1])
    const utf8Encode = new TextEncoder();
    const connection = new Connection(clusterApiUrl("devnet"));
    const c = base58_to_binary(
      "2stoq6WdqMPqmgfRiLqFdyTSkiVoXfRJHkV3xEyzQGfJJETZxhnTLeKdJUysfqwtraZLCwDA4cRNNGfZzjzz2Dve",
    );
    const pair = web3.Keypair.fromSecretKey(c);
    //const wallet = new Wallet(pair);
    const seeds = [
      hexStringToByteArray("01"),
      utf8Encode.encode("ERC20Balance"),
      base58_to_binary(tokenMintAddressSolana),
      hexStringToByteArray(b[b.length - 1].slice(2)),
      hexStringToByteArray(props.address.slice(2)),
    ];
    const d = PublicKey.findProgramAddressSync(seeds, new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"))[0];

    await transfer(tokenMintAddressSolana, wallet.adapter._wallet, d, connection, b[b.length - 1], i);
  }

  async function StartBarter() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    if (!values.duration) {
      alert("TYPE DURATION OF RENT!");
      return;
    }
    if (!values.collateralSum) {
      alert("TYPE collateralSum OF RENT!");
      return;
    }
    for (let i in selectedOfferNFT.model) {
      if (selectedOfferNFT.model[i] === 'nft') {
        selectedOfferNFT.standard[i] = 20;
        selectedOfferNFT.id[i] = 0;
        await SolidityChecks(i);
      }
      if (selectedOfferNFT.standard[i] == 1155) {
        await setApproval1155();
      } else if (selectedOfferNFT.standard[i] == 721) {
        await setApproval721();
      } else if (selectedOfferNFT.standard[i] == 20) {
        await setApproval20(i);
      }
    }
    console.log(selectedOfferNFT)
    const setTx = await tx(
      writeContracts[contractName].startRent(
        selectedOfferNFT.address,
        selectedOfferNFT.id,
        selectedOfferNFT.standard,
        values.duration,
        values.collateralSum
      ),
    );
    const setTxResult = await setTx;
    console.log("startRent result", setTxResult);
    if (setTxResult != null) {
      try {
        await axios.post('http://94.228.122.16:8080/user', {
          solanaWallet: "",
          ethWallet: props.address,
        })
      } catch {}
      const data = {
        token: selectedOfferNFT.address,
        tokenId: selectedOfferNFT.id,
        tokenStandard: selectedOfferNFT.standard,
        durationHours: values.duration,
        collateralSum: values.collateralSum
      };
      let a = JSON.parse(localStorage.getItem("startedRents"));
      if (!a) {
        a = [];
      }
      data.chainId = setTxResult.chainId ? setTxResult.chainId : targetNetwork;
      data.author = props.address;
      a.push({chainId: setTxResult.chainId ? setTxResult.chainId : targetNetwork, data});
      localStorage.setItem("startedRents", JSON.stringify(a));
    }
  }

  return (
    <div>
      <Layout id="gamePage">
        <Layout>
          <Sidebar />
          <Layout style={{ padding: "0 24px 24px" }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Row>
                <Col span={8} className="ps-4">
                  <Card
                    className="mynft text-start"
                    style={{
                      background: `url(${axie})`,
                      backgroundPosition: "contain",
                      height: 300,
                    }}
                  >
                    <div className="mynft__text">
                      <h2 className="text-start">16 в кошельке</h2>
                      <small className="text-start">20 торгуется</small>
                      <div className="mt-3 text-center">
                        <Input
                          onChange={e => {
                            const newValues = { ...values };
                            newValues.duration = e.target.value;
                            setValues(newValues);
                          }}
                          placeholder="Время обмена (NFT будет заморожена)"
                          value={values.duration}
                        />{" "}
                        <br />
                        <Input
                          onChange={e => {
                            const newValues = { ...values };
                            newValues.collateralSum = e.target.value;
                            setValues(newValues);
                          }}
                          placeholder="Желаемая сумма залога"
                          value={values.collateralSum}
                        />{" "}
                        <br />
                        <Button type="primary" onClick={StartBarter.bind(this)}>
                          Начать обмен
                        </Button>
                      </div>
                    </div>

                    <div className="mynft__bg-overlay" />
                  </Card>
                </Col>
                <Col span={16} className="ps-5">
                  <Card>
                    <Row>
                      <h3>Ваши 1155</h3>
                    </Row>
                    <Row>
                      {props.yourCollectibles.map(item => {
                        if (item.owned.toNumber() > 0) {
                          return (
                            <Card.Grid
                              style={gridStyle}
                              title={item.name}
                              key={item.id + "_" + item.uri}
                              id={item.id + "_" + item.uri + "offer"}
                              onClick={selectOfferNFT.bind(this, item)}
                            >
                              <img src={item.image} width="72" height="72" />
                              <Meta title={item.name} description={item.description} />
                            </Card.Grid>
                          );
                        }
                        return <div> </div>;
                      })}
                    </Row>
                    <Row>
                      <h3>Ваши Solana NFT</h3>
                    </Row>
                    <Row>
                      {solanaNFT &&
                        solanaNFT.map(item => (
                          <Card.Grid
                            style={gridStyle}
                            title={item.name}
                            key={item.id + "_" + item.uri}
                            id={item.id + "_" + item.uri + "offer"}
                            onClick={selectOfferNFT.bind(this, item)}
                          >
                            <img src={item.json.image} width="72" height="72" />
                            <Meta title={item.name} description={item.json.description} />
                          </Card.Grid>
                        ))}
                    </Row>
                    <Row>
                      <h3>Ваши NFT 721</h3>
                    </Row>
                    <Row>
                      {props.yourCollectibles721 &&
                        props.yourCollectibles721.map(item => (
                          <Card.Grid
                            style={gridStyle}
                            title={item.name}
                            key={item.id + "_" + item.uri}
                            id={item.id + "_" + item.uri + "offer"}
                            onClick={selectOfferNFT.bind(this, item)}
                          >
                            <img src={item.image} width="72" height="72" />
                            <Meta title={item.name} description={item.description} />
                          </Card.Grid>
                        ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </div>
  );
}
