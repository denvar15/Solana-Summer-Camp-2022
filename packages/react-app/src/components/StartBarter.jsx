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

export class Wallet {
  constructor(payer) {
    this.payer = payer;
  }

  async signTransaction(tx) {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs) {
    return txs.map(t => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey() {
    return this.payer.publicKey;
  }
}

const { Header, Content, Sider } = Layout;
const { Meta } = Card;
const { BufferList } = require("bl");
const axios = require('axios')
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const contractName = "BarterWithArrays";
const tokenName = "YourCollectible";
const tokenName721 = "YourCollectible721";

const targetNetwork = localStorage.getItem("targetNetwork");

const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    return content;
  }
};

const getConfirmation = async (connection, tx) => {
  const result = await connection.getSignatureStatus(tx, {
    searchTransactionHistory: true,
  });
  console.log("RESULT ", result)
  return result.value?.confirmationStatus;
};

function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

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
export default function StartBarter(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [solanaNFT, setSolanaNFT] = useState([]);
  const [selectedWantedNFT, setSelectedWantedNFT] = useState({ address: [], id: [], standard: [] });
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const { wallet } = useWallet();

  const tx = props.tx;

  const writeContracts = props.writeContracts;

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

    const getSolana = async () => {
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
            //console.log("nft", nft)
            res.push(nft)
          } catch(e) {
            //console.log("NOT NFT")
          }
        }
      }
      setSolanaNFT(res);
    }
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
      writeContracts[tokenName].setApprovalForAll(props.readContracts[contractName].address, 1, {
        gasLimit: 200000,
      }),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  async function setApproval721() {
    const approveTx = await tx(
      writeContracts[tokenName721].setApprovalForAll(props.readContracts[contractName].address, 1, {
        gasLimit: 200000,
      }),
    );
    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  function selectWantedNFT(item) {
    const old = selectedWantedNFT;
    const elem = document.getElementById(item.id + "_" + item.uri);
    console.log("ASDASDASD ", elem.style.border, elem.style.border === null);
    if (elem.style.border) {
      elem.style.border = null;
      for (let i = 0; i < old.address.length; i++) {
        if (old.address[i] === item.address) {
          old.address.splice(i);
          old.id.splice(i);
          old.standard.splice(i);
        }
      }
    } else {
      elem.style.border = "solid white 3px";
      old.address.push(item.address);
      old.id.push(item.id);
      old.standard.push(item.standard);
    }
    setSelectedWantedNFT(old);
  }

  async function selectOfferNFT(item) {
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

  async function transfer(tokenMintAddress, wallet, to, connection, wrap) {
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
      console.log("1 ", wallet.publicKey.toString())
      console.log("2 ", to.toString())
      console.log("3 ", neon_acc.toString())
      console.log("4 ", solana_contract_address.toString())
      console.log("5 ", mintPublicKey.toString())
      console.log("7 ", TOKEN_PROGRAM_ID.toString())
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

    console.log("11", source_token_acc.toString())
    console.log("12", to.toString())
    console.log("13", wallet.publicKey.toString())
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
      selectedOfferNFT.address = wrap
    }
  }

  async function mockTransfer(tokenMintAddress, wallet, to, connection) {
      const mockTo = new web3.PublicKey("G3ukZRaZQgX5uF2Wq9V5jqf8JCKn8pKRxqiiCAqwCAuR");
      to = mockTo;

      const mintPublicKey = new web3.PublicKey(tokenMintAddress);
      let tokenAccountPubKey = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);
      let tokenAmount = await connection.getTokenAccountBalance(tokenAccountPubKey);
      if (tokenAmount.value.amount == 0) {
        return;
      }
      console.log("TOKEN BALANCE ", tokenAmount)

      /*
      const eth_account_addressbytes1 = hexStringToByteArray(props.address.slice(2));
      const b = PublicKey.findProgramAddressSync(
        [hexStringToByteArray("01"), eth_account_addressbytes1],
        new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"),
      )[0];

      let sys = new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU");
      console.log("sys", sys)
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: b,
          lamports: 10,
          space: 100,
          programId: sys,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      let res00 = await wallet.signAndSendTransaction(transaction)

      //let res0 = await wallet.signTransaction(transaction);
      console.log("RES0", res00)
  */

      let tokenAccountTo = await getAssociatedTokenAddress(mintPublicKey, to);

      let tokenAccountToInfo = await connection.getAccountInfo(tokenAccountTo);

      if (!tokenAccountToInfo) {
        let tx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, // payer
            tokenAccountTo, // ata
            to, // owner
            mintPublicKey, // mint
          )
        );

        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

        let res01 = await wallet.signAndSendTransaction(tx, connection)
        console.log("RES1", res01)
      } else {
    }

    let tx2 = new Transaction().add(
      createTransferCheckedInstruction(
        tokenAccountPubKey, // from (should be a token account)
        mintPublicKey, // mint
        tokenAccountTo, // to (should be a token account)
        wallet.publicKey, // from's owner
        1, // amount, if your deciamls is 8, send 10^8 for 1 token
        0 // decimals
      )
    );

    tx2.feePayer = wallet.publicKey;
    tx2.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    let res02 = await wallet.signAndSendTransaction(tx2, connection)
    console.log("RES2", res02)
    if (res02) {
      console.log("EEEEEEEE")
    }
  }

  async function SolidityChecks() {
    //const tokenMintAddressSolana = "BoPi4sbTbEsABA2WZdBex5Gj9ZHXWULNsLDGcEb8seGe"
    //const tokenMint = base58_to_binary(tokenMintAddressSolana);
    const tokenMint = base58_to_binary(selectedOfferNFT.mintAddress.toString());
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
    // В seeds - последнее это мой адрес кошелька, с которого захожу на сайт должен быть, ОБРЕЗАННЫЙ БЕЗ 0x
    // Предпоследнее это адрес контракта и тоже обрезанный
    // PublicKey.findProgramAddressSync - работает верно, проверял с питоном. Нужно только реальные данные подставлять

    const d = PublicKey.findProgramAddressSync(seeds, new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"))[0];

    //console.log(pair.publicKey._bn.words.concat(pair.secretKey), pair.publicKey, pair.secretKey)
    axios.post('http://localhost:5000/', {
      source_sol: pair.secretKey,
      dest_neon: props.address,
      wrapper: b[b.length - 1],
      tokenMint: tokenMintAddressSolana
    }, {
      headers: {
        'Access-Control-Allow-Origin' : '*',
      }
    })
      .then(function (response) {
        console.log(response);
      })

    //transfer(tokenMintAddressSolana, wallet.adapter._wallet, d, connection, b[b.length - 1]);

    await transfer(tokenMintAddressSolana, wallet.adapter._wallet, d, connection, b[b.length - 1]);
  }

  async function StartBarter() {
    console.log("selectedOfferNFT", selectedOfferNFT)
    if (selectedOfferNFT.model === 'nft') {
      console.log("AAAAAAAAAAAAAAAAAAAAAAA")
      await SolidityChecks();
    }

    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    if (!selectedWantedNFT) {
      alert("SELECT WANTED NFT!");
      return;
    }
    if (!values.duration) {
      alert("TYPE DURATION OF BARTER!");
      return;
    }
    if (selectedOfferNFT.standard == 1155) {
      await setApproval1155();
    } else if (selectedOfferNFT.standard == 721) {
      await setApproval721();
    }
    const setTx = await tx(
      writeContracts[contractName].startBartering(
        selectedOfferNFT.address,
        selectedOfferNFT.id,
        values.duration,
        selectedWantedNFT.address,
        selectedWantedNFT.id,
        selectedOfferNFT.standard,
        selectedWantedNFT.standard,
      ),
    );
    const setTxResult = await setTx;
    console.log("startBartering result", setTxResult);
    if (setTxResult != null) {
      const data = {
        token: selectedOfferNFT.address,
        tokenId: selectedOfferNFT.id,
        durationHours: values.duration,
        acceptedToken: selectedWantedNFT.address,
        acceptedTokenId: selectedWantedNFT.id,
        tokenStandard: selectedOfferNFT.standard,
        acceptedTokenStandard: selectedWantedNFT.standard,
      };
      let a = JSON.parse(localStorage.getItem("startedBarters"));
      if (!a) {
        a = [];
      }
      data.chainId = setTxResult.chainId ? setTxResult.chainId : targetNetwork;
      data.author = props.address;
      a.push({ chainId: setTxResult.chainId ? setTxResult.chainId : targetNetwork, data });
      localStorage.setItem("startedBarters", JSON.stringify(a));
    }
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
                <Col span={8} className="ps-4">
                  <Card
                    className="mynft text-start"
                    style={{
                      background: `url(${axie})`,
                      backgroundPosition: "contain",
                      height: 220,
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
                    <Row>
                      <h2>Выберите NFT которую вы хотите получить взамен</h2>
                    </Row>
                    <Row>
                      <h3>NFT 1155</h3>
                    </Row>
                    <Row>
                      {props.yourCollectibles &&
                        props.yourCollectibles.map(item => (
                          <Card.Grid
                            style={gridStyle}
                            title={item.name}
                            key={item.id + "_" + item.uri}
                            id={item.id + "_" + item.uri}
                            onClick={selectWantedNFT.bind(this, item)}
                          >
                            <img src={item.image} width="72" height="72" />
                            <Meta title={item.name} description={item.description} />
                          </Card.Grid>
                        ))}
                    </Row>
                    <Row>
                      <h3>NFT 721</h3>
                    </Row>
                    <Row>
                      {yourCollectibles721 &&
                        yourCollectibles721.map(item => (
                          <Card.Grid
                            style={gridStyle}
                            title={item.name}
                            key={item.id + "_" + item.uri}
                            id={item.id + "_" + item.uri}
                            onClick={selectWantedNFT.bind(this, item)}
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
