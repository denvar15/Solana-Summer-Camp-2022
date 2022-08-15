import { Card, Col, Button, Input, Row, List, Layout } from "antd";
import { useBalance, useContractReader, useContractReaderUntyped } from "eth-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import abi from "../contracts/hardhat_contracts.json"
import {Metaplex} from "@metaplex-foundation/js";
import {clusterApiUrl, Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {base58_to_binary, binary_to_base58} from "base58-js";
import axios from "axios";
import {getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {useWallet} from "@solana/wallet-adapter-react";
import {web3} from "@project-serum/anchor";
import { Sidebar } from './../components'
const { BufferList } = require("bl");
const {create} = require('ipfs-http-client')
const auth = 'Basic ' + Buffer.from("2DAF3VlkmCD9NtqMk2hIxxawzak" + ':' + "f3c411643318af9767a14a1a7c4ca6b9").toString('base64');
const ipfs = create({ url: "https://denvar15.infura-ipfs.io/ipfs", headers: { Authorization: auth } });
const { Header, Content, Sider } = Layout;

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

export default function ActiveOffers(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersLend, setUsersLend] = useState();
  const [solanaNFT, setSolanaNFT] = useState([]);
  const [bartersFromBackend, setBartersFromBackend] = useState([]);
  const [usersBackend, setBackend] = useState();
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

    const updateUsersLend = async () => {
      /*let accounts = JSON.parse(localStorage.getItem("accounts"));
      if (!accounts) {
        accounts = []
      }*/

      let response = await axios.get('http://94.228.122.16:8080/user');
      let accounts = response.data;
      const res = [];
      for (let i in accounts) {
        let acc = accounts[i].ethWallet;
        if (props.address !== acc) {
          let count = 0;
          try {
            count = await props.readContracts.BarterWithArrays.UsersBarterCount(
              acc,
            );
          } catch {}
         try {
            count = count.toNumber();
          } catch {}
          for (let i = 0; i < count; i++) {
            try {
              const ul_base = await props.readContracts.BarterWithArrays.UsersBarters(
                acc,
                i,
              );
              console.log("ul_base", ul_base)
              const addressTok = await props.readContracts.BarterWithArrays.getAcceptedAddressesBarter(
                acc,
                i,
              );
              const idTok_bigs = await props.readContracts.BarterWithArrays.getAcceptedIdsBarter(
                acc,
                i,
              );
              const standardTok_bigs = await props.readContracts.BarterWithArrays.getAcceptedStandardsBarter(
                acc,
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
              //console.log(ul, ul.status);
              if (ul.status.toNumber() === 1) {
                res.push(ul);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      for (let i in res) {
        let acceptedAddrs = res[i].acceptedToken
        res[i].tokenMint = []
        for (let j in acceptedAddrs) {
          let accAddr = acceptedAddrs[j]
          try {
            const erc20_rw = new ethers.Contract(accAddr, abi["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
            const tokenMint = await erc20_rw.tokenMint();
            res[i].tokenMint.push(tokenMint);
          } catch(e) {
            res[i].tokenMint.push(null);
          }
        }
      }
      /*
      a[i].data.tokenMint = []
      for (let j in acceptedAddrs) {
        let accAddr = acceptedAddrs[j]
        try {
          const erc20_rw = new ethers.Contract(accAddr, abi["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
          const tokenMint = await erc20_rw.tokenMint();
          a[i].data.tokenMint.push(tokenMint);
        } catch(e) {
          a[i].data.tokenMint.push(null);
          console.log(e)
        }
      }

       */
      setUsersLend(res);
    };

    const backend = async () => {
      //let a = JSON.parse(localStorage.getItem("startedBarters"));
      const res = await axios.get('http://94.228.122.16:8080/trade');
      let a = res.data;
      if (!a) {
        a = []
      }
      for (let i in a) {
        if (a[i].barterStatus === 1) {
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
    backend();
    getSolana();
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
    if (res1) {
      getSolana();
      selectedOfferNFT.address = wrap
    }
  }

  async function sendSolanaNFT(wrap) {
    const tokenMint = base58_to_binary(selectedOfferNFT.mintAddress.toString());
    const tokenMintAddressSolana = binary_to_base58(tokenMint)
    const utf8Encode = new TextEncoder();
    const connection = new Connection(clusterApiUrl("devnet"));
    const seeds = [
      hexStringToByteArray("01"),
      utf8Encode.encode("ERC20Balance"),
      base58_to_binary(tokenMintAddressSolana),
      hexStringToByteArray(wrap.slice(2)),
      hexStringToByteArray(props.address.slice(2)),
    ];
    const d = PublicKey.findProgramAddressSync(seeds, new PublicKey("eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU"))[0];

    await transfer(tokenMintAddressSolana, wallet.adapter._wallet, d, connection, wrap);
  }

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

  function selectWantedNFT(item) {
    try {
      const old = selectedWantedNFT;
      if (old.standard === 20) {
        const oldElem = document.getElementById(old.nft.address.toString());
        oldElem.style.border = "";
      } else {
        const oldElem = document.getElementById(old.id + "_" + old.uri);
        oldElem.style.border = "";
      }
    } catch (e) {
      console.log(e);
    }
    if (item.standard === 20) {
      const elem = document.getElementById(item.nft.address.toString());
      elem.style.border = "solid white 3px";
      setSelectedWantedNFT(item);
    } else {
      const elem = document.getElementById(item.id + "_" + item.uri);
      elem.style.border = "solid white 3px";
      setSelectedWantedNFT(item);
    }
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
    } else if (selectedOfferNFT.model === "nft") {
      let j = usersLend.findIndex(el => {return el === item})
      let i = usersLend[j].tokenMint.findIndex(el =>
      {return binary_to_base58(hexStringToByteArray(el.slice(2))).toString() === selectedOfferNFT.mintAddress.toString()})
      console.log( usersLend[j].tokenMint, i, selectedOfferNFT.mintAddress)
      await sendSolanaNFT(usersLend[j].acceptedToken[i]);
      selectedOfferNFT.address = usersLend[j].acceptedToken[i];
      selectedOfferNFT.id = 0;
      selectedOfferNFT.standard = 20;
      await setApproval20();
    }

    if (selectedWantedNFT.standard === 20) {
      selectedWantedNFT.address = selectedWantedNFT.firstNFTAddress
      console.log("M", selectedWantedNFT.address, selectedWantedNFT)
      selectedWantedNFT.id = 0;
    }

    if (targetNetwork !== chainId) {
      const data = {
        wantedToken: item.token,
        wantedTokenId: item.tokenId,
        offerToken: selectedOfferNFT.address,
        offerTokenId: selectedOfferNFT.id,
        wantedTokenStandard: item.tokenStandard,
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
      console.log("madeOffers Inter Chain result", setTxResult);

      let a = JSON.parse(localStorage.getItem("madeOffers"));
      if (!a) {
        a = [];
      }
      data.chainId = targetNetwork;
      data.author = props.address;
      console.log("A", a);
      a.push({ chainId: targetNetwork, data });
      localStorage.setItem("madeOffers", JSON.stringify(a));
    } else {
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
    <Layout>
      <Sidebar />
    <Row>
      
      <Col span={24}>
      
          
        <h1>Active Offers</h1>
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
              } else {
                styler = true;
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
        <h1>Active InterChain Offers</h1>
        <List
          bordered
          dataSource={usersBackend}
          renderItem={item => {
            console.log("item", item)
            if (targetNetwork == item.evmId) {
              return <div> </div>;
            }
            if (item.userFirst == props.address) {
              return <div> </div>;
            }
            let styler = true;
            if (item.secondNFTAddress) {
              return (
                <List.Item key={item.token + "_" + item.secondNFTAddress[0]} id={item.token + "_" + item.secondNFTAddress[0]}>
                  <Card
                    title={
                      <div>
                        <span style={{ fontSize: 16, marginRight: 8 }}>#{item.chainId}</span>
                      </div>
                    }
                  >
                    <div>Wanted addresses {item.secondNFTAddress}</div>
                    <div>Wanted ids {item.secondNFTId}</div>
                    <div>Offered address {item.firstNFTAddress}</div>
                    <div>Offered id {item.firstNFTId}</div>
                    <Button
                      onClick={styler ? makeOffer.bind(this, item.chainId, item) : null}
                      style={{ backgroundColor: styler ? "green" : "red", color: "white" }}
                    >
                      Make Offer
                    </Button>
                  </Card>
                </List.Item>
              );
            }
          }}
        />
      </Col>
      <Col span={4}>
        <h1>Wanted 1155</h1>
        <List
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
      <Col span={4}>
        <h1>Wanted 721</h1>
        <List
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
      <Col span={4}>
        <h1>Wanted ERC20</h1>
        <List
          bordered
          dataSource={usersBackend}
          renderItem={item => {
            if (item.nft) {
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
                      <img src={item.nft.json.image} style={{ maxWidth: 100 }} onClick={selectWantedNFT.bind(this, item)} />
                    </div>
                    <div>{item.nft.json.description}</div>
                  </Card>
                </List.Item>
              );
            }
          }}
        />
      </Col>
      <Col span={4}>
        <h1>Offer 1155</h1>
        <List
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
      {/*
      <Col span={4}>
        <h1>Offer ERC20</h1>
        <List
          bordered
          dataSource={usersBackendMock}
          renderItem={parentItem => {
              const id = 0;
              return (
                <List.Item key={id + "_parent"} id={id + "_parent"}>
                  <List
                    bordered
                    dataSource={parentItem.data.acceptedToken}
                    renderItem={item => {
                      let i = parentItem.data.acceptedToken.findIndex(el => {return el === item})
                      console.log(parentItem.data.acceptedTokensNft[i])
                      if (parentItem.data.acceptedTokensNft[i] !== null) {
                        const id = parentItem.data.acceptedTokensNft[i].address.toString();
                        return(
                          <List.Item key={id + "_offer"} id={id + "_offer"}>
                            <Card
                              title={
                                <div>
                                  <span style={{ fontSize: 16, marginRight: 8 }}>{parentItem.data.acceptedTokensNft[i].name}</span>
                                </div>
                              }
                            >
                              <div>
                                <img src={parentItem.data.acceptedTokensNft[i].json.image} style={{ maxWidth: 100 }}
                                     onClick={selectOfferNFT.bind(this, {standard: 20,
                                       wrap:parentItem.data.acceptedToken[i], nft: parentItem.data.acceptedTokensNft[i]})} />
                              </div>
                              <div>{parentItem.data.acceptedTokensNft[i].json.description}</div>
                            </Card>
                          </List.Item>
                        );
                      }
                    }}
                    />
                </List.Item>
              );
          }}
        />
      </Col>
      */}
      <Col span={4}>
        <h1>Offer ERC20</h1>
        <List
          bordered
          dataSource={solanaNFT}
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
                    <img src={item.json.image} style={{ maxWidth: 100 }} onClick={selectOfferNFT.bind(this, item)} />
                  </div>
                  <div>{item.json.description}</div>
                </Card>
              </List.Item>
            );
          }}
        />
      </Col>
      <Col span={4}>
        <h1>Offer 721</h1>
        <List
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
      
    </Row>
    </Layout>
  );
}
