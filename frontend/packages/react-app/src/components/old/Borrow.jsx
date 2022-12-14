import { Card, Col, Button, Input, Row, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

const { BufferList } = require("bl");
//const ipfsAPI = require("ipfs-http-client");
//const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const ipfs = {}

const contractName = "Barter";
const tokenName = "YourCollectible";
const tokenName721 = "YourCollectible721";

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

export default function Borrow(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersLend, setUsersLend] = useState();

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
      if (props.address !== "0xe45Ba4475C256d713B6A20C7d2552D3793e37854") {
        const count = await props.readContracts.Barter.UsersLendCount("0xe45Ba4475C256d713B6A20C7d2552D3793e37854");
        for (let i = 0; i < count; i++) {
          try {
            const ul = await props.readContracts.Barter.UsersLend("0xe45Ba4475C256d713B6A20C7d2552D3793e37854", i);
            console.log("UL", ul);
            if (ul.status.toNumber() === 1) {
              res.push(ul);
            }
          } catch (e) {
            console.log(e);
          }
        }
        setUsersLend(res);
      }
    };
    updateCollectibles721();
    updateUsersLend();
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
              placeholder="?????????? ?????????????????? ????????????"
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id ?????????????????? ????????????"
              value={values[title + 1]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 2] = e.target.value;
                setValues(newValues);
              }}
              placeholder="?????????? ?????????????????????????? ????????????"
              value={values[title + 2]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 3] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id ?????????????????????????? ????????????"
              value={values[title + 3]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 4] = e.target.value;
                setValues(newValues);
              }}
              placeholder="???????????????? ?????????????????? ????????????"
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
    try {
      const old = selectedWantedNFT;
      const oldElem = document.getElementById(old.id + "_" + old.uri);
      oldElem.style.border = "";
    } catch (e) {
      console.log(e);
    }

    const elem = document.getElementById(item.id + "_" + item.uri);
    elem.style.border = "solid blue 10px";
    setSelectedWantedNFT(item);
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
    elem.style.border = "solid blue 10px";
    setSelectedOfferNFT(item);
  }

  async function makeOffer() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
    }
    if (!selectedWantedNFT) {
      alert("SELECT WANTED NFT!");
    }
    if (selectedOfferNFT.standard == 1155) {
      await setApproval1155();
    } else if (selectedOfferNFT.standard == 721) {
      await setApproval721();
    }
    const setTx = await tx(
      writeContracts[contractName].makeOffer(
        selectedWantedNFT.address,
        selectedWantedNFT.id,
        selectedOfferNFT.address,
        selectedOfferNFT.id,
        selectedWantedNFT.standard,
        selectedOfferNFT.standard,
      ),
    );
    const setTxResult = await setTx;
    console.log("makeOffer result", setTxResult);
  }

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {rowForm(
          "makeOffer",
          "????????",
          async (addressFirst, tokenIdFirst, addressSecond, tokenIdSecond, wantedTokenStandard, offerTokenStandard) => {
            if (selectedWantedNFT) {
              addressFirst = selectedWantedNFT.address;
              tokenIdFirst = selectedWantedNFT.id;
              wantedTokenStandard = selectedWantedNFT.standard;
            }
            if (selectedOfferNFT) {
              addressSecond = selectedOfferNFT.address;
              tokenIdSecond = selectedOfferNFT.id;
              offerTokenStandard = selectedOfferNFT.standard;
            }
            if (offerTokenStandard == 1155) {
              await setApproval1155();
            } else if (offerTokenStandard == 721) {
              await setApproval721();
            }
            console.log(
              addressFirst,
              tokenIdFirst,
              addressSecond,
              tokenIdSecond,
              wantedTokenStandard,
              offerTokenStandard,
            );
            const setTx = await tx(
              writeContracts[contractName].makeOffer(
                addressFirst,
                tokenIdFirst,
                addressSecond,
                tokenIdSecond,
                wantedTokenStandard,
                offerTokenStandard,
              ),
            );
            const setTxResult = await setTx;
            console.log("makeOffer result", setTxResult);
          },
        )}
      </div>,
    );
  }

  return (
    <Row>
      <Col span={24}>
        <h1>Active Lends</h1>
        <List
          bordered
          dataSource={usersLend}
          renderItem={item => {
            const id = item.id;
            let styler = false;
            if (item.acceptedTokenStandard.toNumber() === 1155) {
              for (const collect in props.yourCollectibles) {
                // console.log(props.yourCollectibles[collect], item.acceptedTokenId, item.acceptedToken);
                if (props.yourCollectibles[collect]) {
                  if (
                    props.yourCollectibles[collect].id === item.acceptedTokenId ||
                    props.yourCollectibles[collect].address === item.acceptedToken
                  ) {
                    styler = true;
                  }
                }
              }
            } else if (item.acceptedTokenStandard.toNumber() === 721) {
              for (const collect in props.yourCollectibles721) {
                if (props.yourCollectibles[collect]) {
                  if (
                    props.yourCollectibles[collect].id === item.acceptedTokenId ||
                    props.yourCollectibles[collect].address === item.acceptedToken
                  ) {
                    styler = true;
                  }
                }
              }
            }
            return (
              <List.Item key={item.token + "_" + item.acceptedToken} id={item.token + "_" + item.acceptedToken}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }
                >
                  <div>Wanted address {item.acceptedToken}</div>
                  <div>Wanted id {item.acceptedTokenId.toNumber()}</div>
                  <div>Offered address {item.token}</div>
                  <div>Offered id {item.tokenId.toNumber()}</div>
                  <Button
                    onClick={styler ? makeOffer.bind(this) : null}
                    style={{ backgroundColor: styler ? "green" : "red", color: "white" }}
                  >
                    Make Offer
                  </Button>
                </Card>
              </List.Item>
            );
          }}
        />
      </Col>
      {/*
      <List
        style={{ marginLeft: "50%" }}
        bordered
        dataSource={props.yourCollectibles}
        renderItem={item => {
          const id = item.id;
          return (
            <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri}>
              <Card
                title={
                  <div>
                    <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                  </div>
                }
              >
                <div>
                  <img src={item.image} style={{ maxWidth: 150 }} onClick={selectNFT.bind(this, item)} />
                </div>
                <div>{item.description}</div>
              </Card>
            </List.Item>
          );
        }}
      />
      <List
        style={{ marginLeft: "50%" }}
        bordered
        dataSource={yourCollectibles721}
        renderItem={item => {
          const id = item.id;
          return (
            <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri}>
              <Card
                title={
                  <div>
                    <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                  </div>
                }
              >
                <div>
                  <img src={item.image} style={{ maxWidth: 150 }} onClick={selectNFT.bind(this, item)} />
                </div>
                <div>{item.description}</div>
              </Card>
            </List.Item>
          );
        }}
      /> */}
      <Col span={6}>
        <h1>Wanted 1155</h1>
        <List
          style={{ marginLeft: "50%" }}
          bordered
          dataSource={props.yourCollectibles}
          renderItem={item => {
            const id = item.id;
            return (
              <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }
                >
                  <div>
                    <img src={item.image} style={{ maxWidth: 100 }} onClick={selectWantedNFT.bind(this, item)} />
                  </div>
                  <div>{item.description}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </Col>
      <Col span={6}>
        <h1>Wanted 721</h1>
        <List
          style={{ marginLeft: "50%" }}
          bordered
          dataSource={yourCollectibles721}
          renderItem={item => {
            const id = item.id;
            return (
              <List.Item key={id + "_" + item.uri} id={id + "_" + item.uri}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }
                >
                  <div>
                    <img src={item.image} style={{ maxWidth: 100 }} onClick={selectWantedNFT.bind(this, item)} />
                  </div>
                  <div>{item.description}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </Col>
      <Col span={6}>
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
      <Col span={6}>
        <h1>Offer 721</h1>
        <List
          style={{ marginLeft: "50%" }}
          bordered
          dataSource={props.yourCollectibles721}
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
      <Col span={18}>
        <Card
          title={
            <div>
              <div style={{ fontSize: 24 }}>Borrow</div>
            </div>
          }
          size="large"
          loading={false}
        >
          {display}
        </Card>
      </Col>
      <Col span={3}> </Col>
      <Col span={14} style={{ margin: "auto", marginTop: "50px", marginBottom: "50px" }}>
        <Button onClick={makeOffer.bind(this)}>Make Offer</Button>
      </Col>
      <Col span={3}> </Col>
    </Row>
  );
}
