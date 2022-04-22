import { Card, Col, Button, Input, Row, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import contracts from "../contracts/hardhat_contracts.json";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const contractName = "BarterWithArrays";
const tokenName = "YourCollectible";
const tokenName721 = "YourCollectible721";

const Networks = {
  5: "goerli",
  42: "kovan",
  4: "rinkeby",
  3: "ropsten",
  1: "mainnet",
  31337: "localhost"
};

const targetNetwork = localStorage.getItem("targetNetwork")

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

export default function ApproveBarter(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [usersLend, setUsersLend] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersBackendMock, setBackendMock] = useState();

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
        props.ownerAccountForTests,
      );
      for (let i = 0; i < count; i++) {
        try {
          const ul = await props.readContracts.BarterWithArrays.UsersBarters(
            props.ownerAccountForTests,
            i,
          );
          console.log(ul, ul.status);
          if (ul.status.toNumber() === 2) {
            res.push(ul);
          }
        } catch (e) {
          console.log(e);
        }
      }
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
          // console.log(a[i].data["wantedToken"] in b[j].data["acceptedToken"], a[i].data["wantedToken"], b[j].data["acceptedToken"])
          if (a[i].data.wantedTokenId in b[j].data.acceptedTokenId) {
            if (a[i].data.chainId !== b[j].data.chainId) {
              const inter = Number(a[i].data.chainId);
              const inter2 = Number(b[j].data.chainId);
              const name = Networks[a[i].data.chainId];
              const name2 = Networks[b[j].data.chainId];
              // console.log(a[i].data.chainId, contracts[5], contracts[inter])
              const addr1155 = contracts[inter][name].contracts.YourCollectible.address;
              const addr721 = contracts[inter][name].contracts.YourCollectible721.address;
              const addr1155_second = contracts[inter2][name2].contracts.YourCollectible.address;
              const addr721_second = contracts[inter2][name2].contracts.YourCollectible721.address;
              // console.log(contracts[inter][name].contracts.YourCollectible.address, contracts[inter][name].contracts.YourCollectible721.address);
              console.log(addr1155, addr1155_second, a[i].data.offerToken, b[j].data.acceptedToken);
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
      console.log("REs", res);
      setBackendMock(res);
    };
    updateCollectibles721();
    updateUsersLend();
    backendMock();
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
              placeholder="Стандарт предлагаемого токена"
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

  async function approveBarter() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
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
    if (props.address !== props.ownerAccountForTests) {
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
    if (props.address !== props.ownerAccountForTests) {
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
      const p = JSON.parse(localStorage.getItem("revokes"));
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
        {rowFormLendSettings("approveBarter", "📥📥", async (address, tokenId, tokenStandard) => {
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
        <Col span={10}>
          <h1>Offer 1155</h1>
          <List
            style={{ marginLeft: "50%" }}
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
        <Col span={10}>
          <h1>Offer 721</h1>
          <List
            style={{ marginLeft: "50%" }}
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
      </Row>
    </div>
  );
}
