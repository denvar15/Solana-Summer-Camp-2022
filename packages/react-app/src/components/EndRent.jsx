import { Card, Col, Button, Input, Row, List } from "antd";
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
const { BufferList } = require("bl");
const {create} = require('ipfs-http-client')
const auth = 'Basic ' + Buffer.from("2DAF3VlkmCD9NtqMk2hIxxawzak" + ':' + "f3c411643318af9767a14a1a7c4ca6b9").toString('base64');
const ipfs = create({ url: "https://denvar15.infura-ipfs.io/ipfs", headers: { Authorization: auth } });

const contractName = "RentContract";
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

export default function EndRent(props) {
  const display = [];

  const [values, setValues] = useState({});
  const [yourCollectibles721, setYourCollectibles721] = useState();
  const [selectedWantedNFT, setSelectedWantedNFT] = useState();
  const [selectedOfferNFT, setSelectedOfferNFT] = useState();
  const [usersLend, setUsersLend] = useState();
  const [solanaNFT, setSolanaNFT] = useState([]);
  const [bartersFromBackend, setBartersFromBackend] = useState([]);
  const [usersBackendMock, setBackendMock] = useState();
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
      let response = await axios.get('http://94.228.122.16:8080/user');
      let accounts = response.data;
      const res = [];
      for (let i in accounts) {
        let acc = accounts[i].ethWallet;
        if (props.address !== acc) {
          let count = 0;
          try {
            count = await props.readContracts[contractName].UsersRentCount(
              acc,
            );
          } catch {}
          for (let i = 0; i < count; i++) {
            try {
              const ul_base = await props.readContracts[contractName].UsersRents(
                acc,
                i,
              );
              const ul = {};
              ul.token = ul_base.token;
              ul.status = ul_base.status;
              ul.tokenId = ul_base.tokenId;
              ul.tokenStandard = ul_base.tokenStandard.toNumber();
              ul.collateralSum = ul_base.collateralSum.toNumber();
              ul.collateralSumBig = ul_base.collateralSum;
              ul.durationHours = ul_base.durationHours.toNumber();
              if (ul.status.toNumber() === 2 && ul_base.borrower === props.address) {
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
            console.log(e)
          }
        }
      }
      console.log("res", res)
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

    const backendMock = async () => {
      let a = JSON.parse(localStorage.getItem("startedBarters"));
      if (!a) {
        a = []
      }
      for (let i in a) {
        let addr = a[i].data.token
        try {
          const erc20_rw = new ethers.Contract(addr, abi["245022926"]["neonlabs"]["contracts"]["NeonERC20Wrapper"]["abi"], props.signer);
          const tokenMint = await erc20_rw.tokenMint();
          const connection = new Connection(clusterApiUrl("devnet"));
          const mx = Metaplex.make(connection);
          //console.log("A", new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2)))))
          const nft = await mx.nfts().findByMint(new PublicKey(binary_to_base58(hexStringToByteArray(tokenMint.slice(2))))).run();
          a[i].data.nft = nft;
          a[i].standard = 20
        } catch(e) {
          //console.log(e)
        }
      }
      setBackendMock(a);
    };

    const getBartersFromBackend = async () => {
      let response = await  axios.get("http://94.228.122.16:8080/trade")
      //response.data.shift();
      setBartersFromBackend(response.data);
    }

    updateCollectibles721();
    updateUsersLend();
    backendMock();
    getSolana();
    getBartersFromBackend();
  }, []);

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

  async function setApproval20(addr) {
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint amount)",
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    const erc20_rw = new ethers.Contract(addr, abi, props.signer);
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
        const oldElem = document.getElementById(old.data.nft.address.toString());
        oldElem.style.border = "";
      } else {
        const oldElem = document.getElementById(old.id + "_" + old.uri);
        oldElem.style.border = "";
      }
    } catch (e) {
      console.log(e);
    }
    if (item.standard === 20) {
      const elem = document.getElementById(item.data.nft.address.toString());
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
    if (item.tokenStandard === 1155) {
      await setApproval1155();
    } else if  (item.tokenStandard === 721) {
      await setApproval721()
    } else if  (item.tokenStandard === 20) {
      await setApproval20(item.token)
    }

    console.log(item)
    const setTx = await tx(
      writeContracts[contractName].endRent(
        item.token,
        item.tokenId,
        item.tokenStandard,
      ),
    );
    const setTxResult = await setTx;
    console.log("endRent result", setTxResult);
  }

  return (
    <Row>
      <Col span={24}>
        <h1>Active Offers</h1>
        <List
          bordered
          dataSource={usersLend}
          renderItem={item => {
            const id = item.id;
            let styler = true;
            return (
              <List.Item key={item.token + "_" + item.collateralSum} id={item.token + "_" + item.collateralSum}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }
                >
                  <div>Wanted sum {item.collateralSum} Mora</div>
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
    </Row>
  );
}
