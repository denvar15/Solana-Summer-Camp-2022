import { Card, Col, Button, Input, Row } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import axios from "axios";

const contractName = "ERC1155Lending";
const tokenName = "UBMassons";
const accessToken = "UBMAccess";
const xTokenName = "xUBMassons";
const wxTokenName = "wxUBMassons";
const UBMGovernor = "UBMGovernor";
const n = 0;

const makeCall = async (callName, contract, args, metadata = {}) => {
  if (contract[callName]) {
    let result;
    if (args) {
      result = await contract[callName](...args, metadata);
    } else {
      result = await contract[callName]();
    }
    return result;
  }
  console.log("no call of that name!");
  return undefined;
};

export default function Borrow(props) {
  const display = [];
  const display2 = [];

  const [form, setForm] = useState([]);
  const [values, setValues] = useState({});
  const [sellSums, setSellSums] = useState({});
  const [presetSums, setPresetSums] = useState({});
  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const contractAddress = props.readContracts[contractName].address;
  const contractBalance = useBalance(props.localProvider, contractAddress);

  // const sellsSum = useContractReader(props.readContracts, contractName, "sellSums", 0);
  // const presetsSum = useContractReader(props.readContracts, contractName, "presetSums", 0);
  let sellsSumParsed = 0;
  let presetsSumParsed = 0;

  props.readContracts.ERC1155Lending.sellSums(0).then(sellSums => {
    props.readContracts.ERC1155Lending.presetSums(0).then(presetSums => {
      console.log("sellsSum", sellSums);
      console.log("presetsSum", presetSums);

      if (sellSums !== undefined && presetSums !== undefined) {
        sellsSumParsed = parseFloat(ethers.utils.formatEther(sellSums));
        presetsSumParsed = parseFloat(ethers.utils.formatEther(presetSums));
        console.log("presetsSumParsed", presetsSumParsed);
        console.log("sellsSumParsed", sellsSumParsed);
        setSellSums(sellsSumParsed);
        setPresetSums(presetsSumParsed);
      }
    });
  });

  const rowForm = (title, icon, onClick) => {
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
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
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
              value={values[title]}
            />
            <Input
              onChange={e => {
                const newValues = { ...values };
                newValues[title + 1] = e.target.value;
                setValues(newValues);
              }}
              value={values[title + 1]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title], values[title + 1]);
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

  async function setApproval() {
    const approveTx = await tx(
      writeContracts[accessToken].setApprovalForAll(props.readContracts[contractName].address, 1, {
        gasLimit: 200000,
      }),
    );

    const approveTxResult = await approveTx;
    console.log("Approve results", approveTxResult);
  }

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {rowFormLendSettings("setLendSettings", "📤📤", async (tokenId, duration) => {
          const setTx = await tx(writeContracts[contractName].setLendSettings(tokenId, duration));
          const setTxResult = await setTx;
          console.log("SetLendSettings result", setTxResult);
        })}

        {rowFormLendSettings("stopBorrowing", "📥📥", async (value, tokenId) => {
          const valueInEther = ethers.utils.parseEther("" + value);
          const allowance = await props.readContracts[tokenName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );

          let approveTx;
          if (allowance.lt(valueInEther)) {
            approveTx = await tx(
              writeContracts[tokenName].approve(props.readContracts[contractName].address, valueInEther, {
                gasLimit: 200000,
              }),
            );
          }
          console.log("allowance", allowance);

          const swapTx = tx(writeContracts[contractName].stopBorrowing(tokenId));
          const swapTxResult = await swapTx;
          console.log("stopBorrowing results", swapTxResult);
        })}
      </div>,
    );
  }

  return (
    <Row>
      <Col span={3}> </Col>
      <Col span={18}>
        <Card
          title={
            <div>
              <div style={{ fontSize: 24 }}>Borrow</div>
              <div style={{ fontSize: 24, float: "left" }}>
                Collateralized rate {(presetSums / sellSums).toFixed(2)}%
              </div>
            </div>
          }
          size="large"
          loading={false}
        >
          <Button style={{ float: "left" }} onClick={setApproval.bind(this)}>
            Approve NFT
          </Button>
          {display}
        </Card>
      </Col>
      <Col span={3}> </Col>
    </Row>
  );
}
