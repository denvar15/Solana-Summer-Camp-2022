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
import abi from "../contracts/hardhat_contracts.json";
import solanaAbi from "../contracts/erc20_iface.json"

const { Header, Content, Sider } = Layout;
const { Meta } = Card;
const { BufferList } = require("bl");
const axios = require('axios')
//const ipfsAPI = require("ipfs-http-client");
const {create} = require('ipfs-http-client')
const auth = 'Basic ' + Buffer.from("2DAF3VlkmCD9NtqMk2hIxxawzak" + ':' + "f3c411643318af9767a14a1a7c4ca6b9").toString('base64');
const ipfs = create({ url: "https://denvar15.infura-ipfs.io/ipfs", headers: { Authorization: auth } });

const contractName = "BarterWithArrays";
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
export default function Withdraw(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [solanaNFT, setSolanaNFT] = useState([]);
  const [selectedWantedNFT, setSelectedWantedNFT] = useState({ address: [], id: [], standard: [] });
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const { wallet } = useWallet();

  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const getSolana = async () => {
    if (targetNetwork == 245022926) {
      let res = []
      const b = await props.readContracts.WrapperFactory.allWrapps(1, 1);
      for (let i in b) {
        const abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",
          "function transfer(address to, uint amount) returns (bool)",
          "event Transfer(address indexed from, address indexed to, uint amount)",
          "function approve(address spender, uint256 amount) external returns (bool)"
        ];

        const erc20_rw = new ethers.Contract(b[i], abi, props.signer);
        const balanceOf = await tx(
          erc20_rw.balanceOf(props.address),
        );
        const approveTxResult = await balanceOf;
        if (approveTxResult.toNumber() > 0) {
          res.push(b[i])
        }
      }
      let res2 = []
      for (let i in res) {
        let addr = res[i]
        try {
          const erc20_rw = new ethers.Contract(addr, abi["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
          const tokenMint = await erc20_rw.tokenMint();
          const connection = new Connection(clusterApiUrl("devnet"));
          const mx = Metaplex.make(connection);
          //console.log("A", new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2)))))
          const nft = await mx.nfts().findByMint(new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2))))).run();
          let obj = {}
          obj.nft = nft;
          obj.standard = 20;
          obj.wrap = addr;
          res2.push(obj)
        } catch(e) {
          //console.log(e)
        }
      }
      setSolanaNFT(res2);
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

  const rowForm = (title, icon, onClick) => {
    return (
      <Row style={{ marginBottom: 8 }}>
        <Col span={8} style={{ textAlign: "center", paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Адрес предлагаемого токена"
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id предлагаемого токена"
              value={values[title + 1]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 2] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Длительность действия предложения в часах"
              value={values[title + 2]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 3] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Адрес желаемого токена"
              value={values[title + 3]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 4] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id желаемого токена"
              value={values[title + 4]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 5] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Стандарт предлагаемого токена"
              value={values[title + 5]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 6] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Стандарт желаемого токена"
              value={values[title + 6]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(
                      values[title],
                      values[title + 1],
                      values[title + 2],
                      values[title + 3],
                      values[title + 4],
                      values[title + 5],
                      values[title + 6],
                    );
                    const newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

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

  async function setApproval20() {
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint amount)",
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const erc20_rw = new ethers.Contract(selectedOfferNFT.address, abi, props.signer);
    const approveTx = await tx(
      erc20_rw.approve(props.readContracts[contractName].address, 1),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  async function withdrawNFT(item) {
    console.log("ITEM", item)
    const tokenMint = base58_to_binary(item.nft.mintAddress.toString());
    const tokenMintAddressSolana = binary_to_base58(tokenMint)
    const connection = new Connection(clusterApiUrl("devnet"));
    const utf8Encode = new TextEncoder();
    const seeds = [
      hexStringToByteArray("01"),
      utf8Encode.encode("ERC20Balance"),
      base58_to_binary(tokenMintAddressSolana),
      hexStringToByteArray(item.wrap.slice(2)),
      hexStringToByteArray(props.address.slice(2)),
    ];
    const d = PublicKey.findProgramAddressSync(seeds, new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"))[0];
    await transfer(tokenMintAddressSolana, wallet.adapter._wallet, d, connection, item.wrap);
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

  async function transfer(tokenMintAddress, wallet, from, connection, wrap) {
    let source_neon_info = await connection.getAccountInfo(from);
    if (!source_neon_info) {
      return;
    }

    const mintPublicKey = new web3.PublicKey(tokenMintAddress);
    let dest_token_account = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey)
    let dest_token_account_info = await connection.getAccountInfo(dest_token_account);
    if (!dest_token_account_info) {
      let trx = new Transaction()
      trx.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          dest_token_account, // ata
          wallet.publicKey, // owner
          mintPublicKey // mint
        )
      );

      trx.feePayer = wallet.publicKey;
      trx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      let res1 = await wallet.signAndSendTransaction(trx, connection)
    }

    const erc20_rw = new ethers.Contract(wrap, solanaAbi, props.signer);
    console.log(erc20_rw)
    const res2 = await erc20_rw.approveSolana(base58_to_binary(wallet.publicKey.toString()), 1);
    if (!res2) {
      return;
    }

    let trx = new Transaction()
    trx.add(new TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      data: hexStringToByteArray("030100000000000000"),
      keys: [
        {pubkey: from, isSigner: false, isWritable: true},
        {pubkey: dest_token_account, isSigner: false, isWritable: true},
        {pubkey: wallet.publicKey, isSigner: true, isWritable: false},
      ]}))

    trx.feePayer = wallet.publicKey;
    trx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    let res3 = await wallet.signAndSendTransaction(trx, connection)
    console.log(res3)
  }

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {rowForm(
          "startBartering",
          "📤📤",
          async (
            addressFirst,
            tokenIdFirst,
            duration,
            addressSecond,
            tokenIdSecond,
            tokenStandard,
            acceptedTokenStandard,
          ) => {
            if (selectedWantedNFT) {
              addressSecond = selectedWantedNFT.address;
              tokenIdSecond = selectedWantedNFT.id;
              acceptedTokenStandard = selectedWantedNFT.standard;
              console.log(selectedWantedNFT);
            }
            if (selectedOfferNFT) {
              addressFirst = selectedOfferNFT.address;
              tokenIdFirst = selectedOfferNFT.id;
              tokenStandard = selectedOfferNFT.standard;
            }
            if (tokenStandard == 1155) {
              await setApproval1155();
            } else if (tokenStandard == 721) {
              await setApproval721();
            }
            console.log("AAAAAAAAAAAA ", values.duration);
            const setTx = await tx(
              writeContracts[contractName].startBartering(
                addressFirst,
                tokenIdFirst,
                values.duration,
                [addressSecond],
                [tokenIdSecond],
                tokenStandard,
                [acceptedTokenStandard],
              ),
            );
            const setTxResult = await setTx;
            console.log("startBartering result", setTxResult);
          },
        )}
      </div>,
    );
  }

  return (
    <div>
      {/*  <Button style={{ marginLeft: "50%" }} onClick={setApproval1155.bind(this)}>
          Approve NFT 1155
        </Button>
        <Button style={{ marginLeft: "50%" }} onClick={setApproval721.bind(this)}>
          Approve NFT 721
        </Button> */}
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
                <Col span={16} className="ps-5">
                  <Card>
                    <Row>
                      <h3>Yours Solana NFT в ERC20</h3>
                    </Row>
                    <Row>
                      {solanaNFT &&
                        solanaNFT.map(item => (
                          <Card.Grid
                            style={gridStyle}
                            title={item.nft.name}
                            key={item.nft.id + "_" + item.nft.uri}
                            id={item.nft.id + "_" + item.nft.uri + "offer"}
                            onClick={withdrawNFT.bind(this, item)}
                          >
                            <img src={item.nft.json.image} width="72" height="72" />
                            <Meta title={item.nft.name} description={item.nft.json.description} />
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
