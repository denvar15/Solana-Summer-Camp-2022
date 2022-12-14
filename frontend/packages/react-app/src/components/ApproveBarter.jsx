import { Card, Col, Button, Input, Row, List, Layout } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import contracts from "../contracts/hardhat_contracts.json";
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {Metaplex} from "@metaplex-foundation/js";
import {binary_to_base58} from "base58-js";
import axios from "axios";
import abi from "../contracts/hardhat_contracts.json";
import { Sidebar } from './../components'

const { BufferList } = require("bl");
//const ipfsAPI = require("ipfs-http-client");
//const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const {create} = require('ipfs-http-client')
const auth = 'Basic ' + Buffer.from("2DAF3VlkmCD9NtqMk2hIxxawzak" + ':' + "f3c411643318af9767a14a1a7c4ca6b9").toString('base64');
const ipfs = create({ url: "https://denvar15.infura-ipfs.io/ipfs", headers: { Authorization: auth } });
const { Header, Content, Sider } = Layout;

const contractName = "BarterWithArrays";
const tokenName = "YourCollectible";
const tokenName721 = "YourCollectible721";

const Networks = {
  5: "goerli",
  42: "kovan",
  4: "rinkeby",
  3: "ropsten",
  1: "mainnet",
  31337: "localhost",
  245022926: "neonlabs"
};

const targetNetwork = localStorage.getItem("targetNetwork")

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

export default function ApproveBarter(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [SolanaNFTs, setSolanaNFTs] = useState();
  const [usersLend, setUsersLend] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersBackendMock, setBackendMock] = useState();
  const [usersBackend, setBackend] = useState();

  // const ul = useContractReader(props.readContracts, contractName, "UsersLend", [props.address]);
  // console.log("AAAAAAAAAAA ", ul);
  // setUsersLend(ul);

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
    const updateUsersLend = async () => {
      const res = [];
      const count = await props.readContracts.BarterWithArrays.UsersBarterCount(
        props.address,
      );
      for (let i = 0; i < count; i++) {
        try {
          const ul = await props.readContracts.BarterWithArrays.UsersBarters(
            props.address,
            i,
          );
          //console.log(ul)
          if (ul.status.toNumber() === 2) {
            res.push(ul);
          }
        } catch (e) {
          console.log(e);
        }
      }
      let resSolana = []
      for (let i in res) {
        let addr = res[i].token
        try {
          const erc20_rw = new ethers.Contract(addr, contracts["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
          const tokenMint = await erc20_rw.tokenMint();
          const connection = new Connection(clusterApiUrl("devnet"));
          const mx = Metaplex.make(connection);
          const nft = await mx.nfts().findByMint(new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2))))).run();
          let b = {};
          b.address = res[i].token;
          b.id = res[i].tokenId
          b.nft = nft;
          b.standard = 20
          resSolana.push(b)

        } catch(e) {
          console.log(e)
        }
      }
      console.log("res", res)
      setSolanaNFTs(resSolana);
      setUsersLend(res);
    };

    const backendMock = async () => {
      let a = JSON.parse(localStorage.getItem("madeOffers"));
      let b = JSON.parse(localStorage.getItem("startedBarters"));
      if (!a) {
        a = []
      }

      if (!b) {
        b = []
      }
      const res = [];
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          if (a[i].data.wantedToken === b[j].data.token) {
            if (a[i].data.chainId !== b[j].data.chainId) {
              const inter = Number(a[i].data.chainId);
              const inter2 = Number(b[j].data.chainId);
              const name = Networks[a[i].data.chainId];
              const name2 = Networks[b[j].data.chainId];
              console.log(contracts[inter], contracts[inter2], name, name2)
              const addr1155 = contracts[inter][name].contracts.YourCollectible.address;
              const addr721 = contracts[inter][name].contracts.YourCollectible721.address;
              const addr1155_second = contracts[inter2][name2].contracts.YourCollectible.address;
              const addr721_second = contracts[inter2][name2].contracts.YourCollectible721.address;
              // console.log(contracts[inter][name].contracts.YourCollectible.address, contracts[inter][name].contracts.YourCollectible721.address);
              //console.log(addr1155, addr1155_second, a[i].data.offerToken, b[j].data.acceptedToken);
              console.log(inter, inter2)
              if (a[i].data.offerToken === addr1155) {
                console.log(addr1155_second, b[j].data.acceptedToken, addr1155_second in b[j].data.acceptedToken);
                if (b[j].data.acceptedToken.includes(addr1155_second)) {
                  console.log("VIVAT!", a[i]);
                  res.push(a[i]);
                }
              }
              if (a[i].data.offerToken === addr721) {
                console.log(addr721_second, b[j].data.acceptedToken);
                if (b[j].data.acceptedToken.includes(addr721_second)) {
                  console.log("VIVAT!", a[i]);
                  a[i].starterIndex = j;
                  a[i].ownIndex = i;
                  res.push(a[i]);
                }
              }
            }
          }
        }
      }
      //console.log("REs", res);
      setBackendMock(res);
    };

    const backend = async () => {
      const res = await axios.get('http://94.228.122.16:8080/trade');
      let a = res.data;
      let b = res.data;
      if (!a) {
        a = []
      }
      for (let i in a) {
        if (a[i].barterStatus === 2) {
          let addr = a[i].firstNFTAddress
          try {
            const erc20_rw = new ethers.Contract(addr, abi["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
            const tokenMint = await erc20_rw.tokenMint();
            const connection = new Connection(clusterApiUrl("devnet"));
            const mx = Metaplex.make(connection);
            //console.log("A", new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2)))))
            const nft = await mx.nfts().findByMint(new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2))))).run();
            a[i].nft = nft;
            a[i].standard = 20
          } catch(e) {
            //console.log(e)
          }
        } else {
          a.splice(i);
        }
      }
      setBackend(a);
    };

    updateCollectibles721();
    updateUsersLend();
    backendMock();
    backend();
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
              placeholder="?????????? ?????????????????????????? ????????????"
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id ?????????????????????????? ????????????"
              value={values[title + 1]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 2] = e.target.value;
                setValues(newValues);
              }}
              placeholder="???????????????????????? ???????????????? ?????????????????????? ?? ??????????"
              value={values[title + 2]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 3] = e.target.value;
                setValues(newValues);
              }}
              placeholder="?????????? ?????????????????? ????????????"
              value={values[title + 3]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 4] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id ?????????????????? ????????????"
              value={values[title + 4]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 5] = e.target.value;
                setValues(newValues);
              }}
              placeholder="???????????????? ?????????????????????????? ????????????"
              value={values[title + 5]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 6] = e.target.value;
                setValues(newValues);
              }}
              placeholder="???????????????? ?????????????????? ????????????"
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

  const rowFormLendSettings = (title, icon, onClick) => {
    return (
      <Row>
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
              placeholder="?????????? ?????????????????????????? ????????????"
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id ?????????????????????????? ????????????"
              value={values[title + 1]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 2] = e.target.value;
                setValues(newValues);
              }}
              placeholder="???????????????? ?????????????????????????? ????????????"
              value={values[title + 2]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title], values[title + 1], values[title + 2]);
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

  function selectOfferNFT(item) {
    if (item.standard === 20) {
      try {
        const old = selectedOfferNFT;
        const oldElem = document.getElementById(old.nft.address);
        oldElem.style.border = "";
      } catch (e) {
        console.log(e);
      }

      const elem = document.getElementById(item.nft.address);
      elem.style.border = "solid white 3px";
      setSelectedOfferNFT(item);
    } else {
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
  }

  async function approveBarter() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    console.log("selectedOfferNFT", selectedOfferNFT)
    const setTx = await tx(
      writeContracts[contractName].approveBarter(
        selectedOfferNFT.address,
        selectedOfferNFT.id,
        selectedOfferNFT.standard,
      ),
    );
    const setTxResult = await setTx;
    console.log("approveBarter result", setTxResult);
  }

  async function revokeBarter() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    const setTx = await tx(
      writeContracts[contractName].revokeBarter(
        selectedOfferNFT.address,
        selectedOfferNFT.id,
        selectedOfferNFT.standard,
      ),
    );
    const setTxResult = await setTx;
    console.log("approveBarter result", setTxResult);
  }

  async function approveInterChainBarter(item) {
    let author;
    if (props.address !== props.address) {
      alert("NOT OWNER OF CONTRACTS!");
      return;
    }
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    if (targetNetwork === item.chainId) {
      let p = JSON.parse(localStorage.getItem("approvals"));
      if (!p) {
        alert("FIRSTLY APPROVE ON OTHER CHAIN!");
        return;
      }
      if (!p[props.address]) {
        alert("FIRSTLY APPROVE ON OTHER CHAIN!");
        return;
      }
      author = props.address;
      console.log("AAAAAAA", item.offerToken,
        item.offerTokenId,
        item.offerTokenStandard,
        author)
      const setTx = await tx(
        writeContracts[contractName].approveIterChainBarter(
          item.offerToken,
          item.offerTokenId,
          item.offerTokenStandard,
          author,
        ),
      );
      const setTxResult = await setTx;
      console.log("approveBarter result", setTxResult, item.ownIndex, item.starterIndex);
      delete p[props.address];
      localStorage.setItem("approvals", JSON.stringify(p));
      let a = JSON.parse(localStorage.getItem("madeOffers"));
      let b = JSON.parse(localStorage.getItem("startedBarters"));
      console.log("AAAAAAAA", a, b)
      a.splice(item.ownIndex, 1)
      b.splice(item.starterIndex, 1);
      console.log("BBB", a, b)
      localStorage.setItem("madeOffers", JSON.stringify(a));
      localStorage.setItem("startedBarters", JSON.stringify(b));
    } else {
      author = item.author;
      const setTx = await tx(
        writeContracts[contractName].approveIterChainBarter(
          selectedOfferNFT.address,
          selectedOfferNFT.id,
          selectedOfferNFT.standard,
          author,
        ),
      );
      const setTxResult = await setTx;
      let p = JSON.parse(localStorage.getItem("approvals"));
      if (p == null) {
        p = {};
      }
      p[props.address] = true;
      localStorage.setItem("approvals", JSON.stringify(p));
      console.log("approveBarter result", setTxResult);
    }
  }

  async function revokeInterChainBarter(item) {
    let author;
    if (props.address !== props.address) {
      alert("NOT OWNER OF CONTRACTS!");
      return;
    }
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    if (targetNetwork === item.chainId) {
      let p = JSON.parse(localStorage.getItem("revokes"));
      if (!p) {
        alert("FIRSTLY REVOKE ON OTHER CHAIN!");
        return;
      }
      if (!p[props.address]) {
        alert("FIRSTLY REVOKE ON OTHER CHAIN!");
        return;
      }
      author = item.author;
      const setTx = await tx(
        writeContracts[contractName].revokeIterChainBarter(
          item.offerToken,
          item.offerTokenId,
          item.offerTokenStandard,
          author,
        ),
      );
      const setTxResult = await setTx;
      console.log("approveBarter result", setTxResult);
      p.delete(props.address);
      localStorage.setItem("approvals", JSON.stringify(p));
      let a = JSON.parse(localStorage.getItem("madeOffers"));
      let b = JSON.parse(localStorage.getItem("startedBarters"));
      a.splice(item.ownIndex)
      b.splice(item.starterIndex);
      localStorage.setItem("madeOffers", JSON.stringify(a));
      localStorage.setItem("startedBarters", JSON.stringify(b));
    } else {
      author = props.address;
      const setTx = await tx(
        writeContracts[contractName].revokeIterChainBarter(
          selectedOfferNFT.address,
          selectedOfferNFT.id,
          selectedOfferNFT.standard,
          author,
        ),
      );
      const setTxResult = await setTx;
      let p = JSON.parse(localStorage.getItem("revokes"));
      if (p == null) {
        p = {};
      }
      p[props.address] = true;
      localStorage.setItem("revokes", JSON.stringify(p));
      console.log("approveBarter result", setTxResult);
    }
  }

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {rowFormLendSettings("approveBarter", "????????", async (address, tokenId, tokenStandard) => {
          if (selectedOfferNFT) {
            address = selectedOfferNFT.address;
            tokenId = selectedOfferNFT.id;
            tokenStandard = selectedOfferNFT.standard;
          }
          const setTx = await tx(writeContracts[contractName].approveBarter(address, tokenId, tokenStandard));
          const setTxResult = await setTx;
          console.log("approveBarter result", setTxResult);
        })}
      </div>,
    );
  }

  return (
    <div>
      <Layout>
        <Sidebar/>
      <Row>
        <Col span={24}>
          <h1>Awaiting Approve</h1>
          <List
            bordered
            dataSource={usersLend}
            renderItem={item => {
              const id = item.id;
              const styler = true;
              return (
                <List.Item key={item.token + "_" + item.acceptedToken} id={item.token + "_" + item.acceptedToken}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                      </div>
                    }
                  >
                    <div>Wanted address {item.fulfilledToken}</div>
                    <div>Wanted id {item.fulfilledTokenId.toNumber()}</div>
                    <div>Offered address {item.token}</div>
                    <div>Offered id {item.tokenId.toNumber()}</div>
                    <Button onClick={approveBarter.bind(this)} style={{ backgroundColor: "green", color: "white" }}>
                      Approve Barter
                    </Button>
                    <Button onClick={revokeBarter.bind(this)} style={{ backgroundColor: "red", color: "white" }}>
                      Revoke Barter
                    </Button>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Col>
        <Col span={24}>
          <h1>Awaiting Approve InterChain</h1>
          <List
            bordered
            dataSource={usersBackendMock}
            renderItem={item => {
              item = item.data;
              const id = item.id;
              return (
                <List.Item key={item.wantedToken + item.offerToken} id={item.wantedToken + item.offerToken}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>#{item.chainId}</span>
                      </div>
                    }
                  >
                    <div>Offered address {item.wantedToken}</div>
                    <div>Offered id {item.wantedTokenId}</div>
                    <Button
                      onClick={approveInterChainBarter.bind(this, item)}
                      style={{ backgroundColor: "green", color: "white" }}
                    >
                      Approve Barter
                    </Button>
                    <Button onClick={revokeInterChainBarter.bind(this, item)} style={{ backgroundColor: "red", color: "white" }}>
                      Revoke Barter
                    </Button>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Col>
        <Col span={7}>
          <h1>Offer 1155</h1>
          <List
            style={{ marginLeft: "35%" }}
            bordered
            dataSource={props.yourCollectibles}
            renderItem={item => {
              const id = item.id;
              if (item.owned.toNumber() > 0) {
                return (
                  <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri + "offer"}>
                    <Card
                      title={
                        <div>
                          <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                        </div>
                      }
                    >
                      <div>
                        <img src={item.image} style={{ maxWidth: 100 }} onClick={selectOfferNFT.bind(this, item)} />
                      </div>
                      <div>{item.description}</div>
                    </Card>
                  </List.Item>
                );
              }
              return <div> </div>;
            }}
          />
        </Col>
        <Col span={7}>
          <h1>Offer 721</h1>
          <List
            style={{ marginLeft: "35%" }}
            bordered
            dataSource={yourCollectibles721}
            renderItem={item => {
              const id = item.id;
              return (
                <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri + "offer"}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                      </div>
                    }
                  >
                    <div>
                      <img src={item.image} style={{ maxWidth: 100 }} onClick={selectOfferNFT.bind(this, item)} />
                    </div>
                    <div>{item.description}</div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Col>
        <Col span={6}>
          <h1>Wanted ERC20</h1>
          <List
            style={{ marginLeft: "35%" }}
            bordered
            dataSource={SolanaNFTs}
            renderItem={item => {
              console.log("ITEM", item)
              const id = item.nft.address.toString();
              return (
                <List.Item key={id} id={id}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>{item.nft.name}</span>
                      </div>
                    }
                  >
                    <div>
                      <img src={item.nft.json.image} style={{ maxWidth: 100 }} onClick={selectOfferNFT.bind(this, item)} />
                    </div>
                    <div>{item.nft.json.description}</div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Col>
      </Row>
      </Layout>
    </div>
  );
}
