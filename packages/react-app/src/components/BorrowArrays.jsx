import { Card, Col, Button, Input, Row, List } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

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

export default function Borrow(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersLend, setUsersLend] = useState();
  const [usersBackendMock, setBackendMock] = useState();

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
      if (props.address !== "0x62FaFb31cfB1e57612bE488035B3783048cFe813") {
        const count = await props.readContracts.BarterWithArrays.UsersLendCount(
          "0x62FaFb31cfB1e57612bE488035B3783048cFe813",
        );
        for (let i = 0; i < count; i++) {
          try {
            const ul_base = await props.readContracts.BarterWithArrays.UsersLend(
              "0x62FaFb31cfB1e57612bE488035B3783048cFe813",
              i,
            );
            const addressTok = await props.readContracts.BarterWithArrays.getAcceptedAddressesLend(
              "0x62FaFb31cfB1e57612bE488035B3783048cFe813",
              i,
            );
            const idTok_bigs = await props.readContracts.BarterWithArrays.getAcceptedIdsLend(
              "0x62FaFb31cfB1e57612bE488035B3783048cFe813",
              i,
            );
            const standardTok_bigs = await props.readContracts.BarterWithArrays.getAcceptedStandardsLend(
              "0x62FaFb31cfB1e57612bE488035B3783048cFe813",
              i,
            );
            const idTok = [];
            const standardTok = [];
            const ul = {};
            for (let j = 0; j < idTok_bigs.length; j++) {
              idTok[j] = idTok_bigs[j];
              idTok[j] = idTok[j].toNumber();
            }
            for (let j = 0; j < standardTok_bigs.length; j++) {
              standardTok[j] = standardTok_bigs[j];
              standardTok[j] = standardTok[j].toNumber();
            }
            ul.token = ul_base.token;
            ul.status = ul_base.status;
            ul.tokenId = ul_base.tokenId;
            ul.acceptedToken = addressTok;
            ul.acceptedTokenId = idTok;
            ul.acceptedTokenStandard = standardTok;
            console.log(ul, ul.status);
            if (ul.status.toNumber() === 1) {
              res.push(ul);
            }
          } catch (e) {
            console.log(e);
          }
        }
        console.log("AAAAAAAAA", res)
        setUsersLend(res);
      }
    };
    const backendMock = async () => {
      let a = JSON.parse(localStorage.getItem("startedBarters"));
      if (!a) {
        a = []
      }
      setBackendMock(a);
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
              placeholder="Адрес желаемого токена"
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id желаемого токена"
              value={values[title + 1]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 2] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Адрес предлагаемого токена"
              value={values[title + 2]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 3] = e.target.value;
                setValues(newValues);
              }}
              placeholder="id предлагаемого токена"
              value={values[title + 3]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 4] = e.target.value;
                setValues(newValues);
              }}
              placeholder="Стандарт желаемого токена"
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

  async function makeOffer(chainId, item) {
    if (!selectedOfferNFT) {
      alert("SELECT OFFER NFT!");
      return;
    }
    if (!selectedWantedNFT) {
      alert("SELECT WANTED NFT!");
      return;
    }
    if (selectedOfferNFT.standard == 1155) {
      await setApproval1155();
    } else if (selectedOfferNFT.standard == 721) {
      await setApproval721();
    }
    if (targetNetwork !== chainId) {
      const data = {
        wantedToken: selectedWantedNFT.address,
        wantedTokenId: selectedWantedNFT.id,
        offerToken: selectedOfferNFT.address,
        offerTokenId: selectedOfferNFT.id,
        wantedTokenStandard: selectedWantedNFT.standard,
        offerTokenStandard: selectedOfferNFT.standard,
      };
      console.log("DATA", data, item.durationHours);
      const setTx = await tx(
        writeContracts[contractName].startBartering(
          selectedOfferNFT.address,
          selectedOfferNFT.id,
          item.durationHours,
          [item.token],
          [item.tokenId],
          selectedOfferNFT.standard,
          [item.tokenStandard],
        ),
      );
      const setTxResult = await setTx;
      console.log("startBartering result", setTxResult);

      let a = JSON.parse(localStorage.getItem("madeOffers"));
      if (!a) {
        a = [];
      }
      data.chainId = targetNetwork;
      data.author = props.address;
      console.log("A", a);
      a.push({ chainId: targetNetwork, data });
      localStorage.setItem("madeOffers", JSON.stringify(a));
      return;
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
          "📤📤",
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
            for (let j = 0; j < item.acceptedTokenStandard.length; j++) {
              if (item.acceptedTokenStandard[j] === 1155) {
                for (const collect in props.yourCollectibles) {
                  // console.log(props.yourCollectibles[collect], item.acceptedTokenId, item.acceptedToken);
                  if (props.yourCollectibles[collect]) {
                    if (
                      props.yourCollectibles[collect].id === item.acceptedTokenId[j] ||
                      props.yourCollectibles[collect].address === item.acceptedToken[j]
                    ) {
                      styler = true;
                    }
                  }
                }
              } else if (item.acceptedTokenStandard[j] === 721) {
                for (const collect in props.yourCollectibles721) {
                  if (props.yourCollectibles721[collect]) {
                    if (
                      props.yourCollectibles721[collect].id === item.acceptedTokenId[j] ||
                      props.yourCollectibles721[collect].address === item.acceptedToken[j]
                    ) {
                      styler = true;
                    }
                  }
                }
              }
            }
            return (
              <List.Item key={item.token + "_" + item.acceptedToken[0]} id={item.token + "_" + item.acceptedToken[0]}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }
                >
                  <div>Wanted addresses {item.acceptedToken}</div>
                  <div>Wanted ids {item.acceptedTokenId}</div>
                  <div>Offered address {item.token}</div>
                  <div>Offered id {item.tokenId.toNumber()}</div>
                  <Button
                    onClick={styler ? makeOffer.bind(this, targetNetwork, item) : null}
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

      <Col span={24}>
        <h1>Active Backend Mock</h1>
        <List
          bordered
          dataSource={usersBackendMock}
          renderItem={item => {
            item = item.data;
            const id = item.id;
            let styler = false;
            if (targetNetwork === item.chainId) {
              return <div> </div>;
            }
            styler = true;

            return (
              <List.Item key={item.token + "_" + item.acceptedToken[0]} id={item.token + "_" + item.acceptedToken[0]}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{item.chainId}</span>
                    </div>
                  }
                >
                  <div>Wanted addresses {item.acceptedToken}</div>
                  <div>Wanted ids {item.acceptedTokenId}</div>
                  <div>Offered address {item.token}</div>
                  <div>Offered id {item.tokenId}</div>
                  <Button
                    onClick={styler ? makeOffer.bind(this, item.chainId, item) : null}
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
