import { Card, Col, Button, Input, Row, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { AddressInput } from "../index";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

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

export default function Lend(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
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

  async function StartBarter() {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
    }
    if (!selectedWantedNFT) {
      alert("SELECT WANTED NFT!");
    }
    if (!values.duration) {
      alert("TYPE DURATION OF BARTER!");
    }
    if (selectedOfferNFT.standard == 1155) {
      await setApproval1155();
    } else if (selectedOfferNFT.standard == 721) {
      await setApproval721();
    }
    console.log("AAAAAAAAAAAA ", values.duration);
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
                addressSecond,
                tokenIdSecond,
                tokenStandard,
                acceptedTokenStandard,
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
      <Row>
        <Col span={3}> </Col>
        <Col span={14} style={{ margin: "auto", marginTop: "50px", marginBottom: "50px" }}>
          <h1>Duration of Barter</h1>
          <Input
            onChange={e => {
              const newValues = { ...values };
              newValues.duration = e.target.value;
              setValues(newValues);
            }}
            placeholder="Длительность актиности сделки"
            value={values.duration}
          />
          <Button onClick={StartBarter.bind(this)}>Start Barter</Button>
        </Col>
        <Col span={3}> </Col>
        {/*  <Button style={{ marginLeft: "50%" }} onClick={setApproval1155.bind(this)}>
          Approve NFT 1155
        </Button>
        <Button style={{ marginLeft: "50%" }} onClick={setApproval721.bind(this)}>
          Approve NFT 721
        </Button> */}

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
                <div style={{ fontSize: 24 }}>Lend</div>
              </div>
            }
            size="large"
            loading={false}
          >
            {display}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
