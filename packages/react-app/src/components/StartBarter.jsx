import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, Input, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "../bootstrap-utilites.css";
import { NodeExpandOutlined } from "@ant-design/icons";
import { base58_to_binary, binary_to_base58 } from "base58-js";
import { web3 } from "@project-serum/anchor";
import { clusterApiUrl, Keypair, Transaction, SystemProgram, Connection, PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axie from "../img/axie.jpg";

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
  const [selectedWantedNFT, setSelectedWantedNFT] = useState({ address: [], id: [], standard: [] });
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();

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

  function selectOfferNFT(item) {
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

  async function transfer(tokenMintAddress, wallet, to, connection, amount) {
    const mintPublicKey = new web3.PublicKey(tokenMintAddress);
    const mintToken = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      wallet.payer, // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
    );

    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(wallet.publicKey);

    const destPublicKey = new web3.PublicKey(to);

    // Get the derived address of the destination wallet which will hold the custom token
    /*

    const associatedDestinationTokenAddr = await Token.getAssociatedTokenAddress(
      mintToken.associatedProgramId,
      mintToken.programId,
      mintPublicKey,
      destPublicKey,
    );

    console.log("aaa ", associatedDestinationTokenAddr);

    const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);
    */

    const eth_account_addressbytes = hexStringToByteArray("5d9ba06d857EF3d2a6eCb00694D09328698dA006");
    const a = PublicKey.findProgramAddressSync(
      [hexStringToByteArray("01"), eth_account_addressbytes],
      new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"),
    )[0];
    console.log("AAAAAAA ", a.toString());

    const eth_account_addressbytes1 = hexStringToByteArray("3Cd3AA68E6f86c3e7237ee874EeB073c3D178339");
    const b = PublicKey.findProgramAddressSync(
      [hexStringToByteArray("01"), eth_account_addressbytes1],
      new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"),
    )[0];
    console.log("BBBB ", b.toString());

    const receiverAccount = await connection.getAccountInfo(destPublicKey);

    const instructions = [];
    const mmm = new web3.PublicKey("11111111111111111111111111111111");

    console.log("associatedProgramId ", mintToken.associatedProgramId.toString());
    console.log("programId ", mintToken.programId.toString());
    console.log("mint ", mintPublicKey.toString());
    console.log("associatedAccount ", destPublicKey.toString());
    console.log("owner ", a.toString());
    console.log("payer ", wallet.publicKey.toString());
    if (receiverAccount === null) {
      instructions.push(
        Token.createAssociatedTokenAccountInstruction(
          mintToken.associatedProgramId,
          mintToken.programId,
          mintPublicKey,
          destPublicKey,
          a,
          wallet.publicKey,
        ),
      );
    }

    /* instructions.push(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        destPublicKey,
        wallet.publicKey,
        [],
        amount,
      ),
    ); */

    const transaction = new web3.Transaction().add(...instructions);
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;


    console.log("aaa ", transaction)
    const transactionSignature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });


    await connection.confirmTransaction(transactionSignature);
  }

  async function SolidityChecks() {
    const tokenMint = base58_to_binary("ADG4tku1YyyDkwZA1XtWag3WooBVM2xBXMCCXp53zFx3");
    const a = props.readContracts.WrapperFactory.createWrapp(tokenMint);
    const utf8Encode = new TextEncoder();
    const connection = new Connection(clusterApiUrl("devnet"));
    const c = base58_to_binary(
      "2stoq6WdqMPqmgfRiLqFdyTSkiVoXfRJHkV3xEyzQGfJJETZxhnTLeKdJUysfqwtraZLCwDA4cRNNGfZzjzz2Dve",
    );
    const pair = web3.Keypair.fromSecretKey(c);
    const wallet = new Wallet(pair);
    const seeds = [
      hexStringToByteArray("01"),
      utf8Encode.encode("ERC20Balance"),
      base58_to_binary("ADG4tku1YyyDkwZA1XtWag3WooBVM2xBXMCCXp53zFx3"),
      hexStringToByteArray("5d9ba06d857EF3d2a6eCb00694D09328698dA006"),
      hexStringToByteArray("3Cd3AA68E6f86c3e7237ee874EeB073c3D178339"),
    ];
    // В seeds - последнее это мой адрес кошелька, с которого захожу на сайт должен быть, ОБРЕЗАННЫЙ БЕЗ 0x
    // Предпоследнее это адрес контракта и тоже обрезанный
    // PublicKey.findProgramAddressSync - работает верно, проверял с питоном. Нужно только реальные данные подставлять
    const b = PublicKey.findProgramAddressSync(seeds, new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"))[0];
    console.log("Mmm ", b.toString());

    transfer("ADG4tku1YyyDkwZA1XtWag3WooBVM2xBXMCCXp53zFx3", wallet, b, connection, 1);

    /*
    const payer = web3.Keypair.generate();
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL);

    await connection.confirmTransaction(airdropSignature);

    const toAccount = web3.Keypair.generate();

    // Create Simple Transaction
    const transaction = new web3.Transaction();

    const amount = 1

    // Add an instruction to execute
    transaction.add(
      amount,
      [payer.publicKey, toAccount.publicKey],
      TOKEN_PROGRAM_ID,
    );

    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
     */
  }

  async function StartBarter() {
    SolidityChecks();

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
