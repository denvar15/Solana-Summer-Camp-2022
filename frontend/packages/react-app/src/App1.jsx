import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import {
  Account,
  Address,
  AddressInput,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  StartBarter,
  ActiveOffers,
  ApproveBarter,
  P2p,
  AaveGotchi,
} from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useGasPrice,
  useOnBlock,
  useUserSigner,
} from "./hooks";

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const { ethers } = require("ethers");

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
let targetNetwork = NETWORKS.neon; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

const ownerAccountForTests = "0x62FaFb31cfB1e57612bE488035B3783048cFe813";
localStorage.setItem("targetNetwork", targetNetwork.chainId);

window.localStorage.setItem("theme", "dark");

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = false;

// EXAMPLE STARTING JSON:
const STARTING_JSON = {
  description: "It's actually a bison?",
  external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
  image: "https://austingriffith.com/images/paintings/buffalo.jpg",
  name: "Buffalo",
  attributes: [
    {
      trait_type: "BackgroundColor",
      value: "green",
    },
    {
      trait_type: "Eyes",
      value: "googly",
    },
  ],
};

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
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

// 🛰 providers

// if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
// if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

function App(props) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider, localProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(injectedProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  //const mainnetContracts = useContractLoader(mainnetProvider);

  // If you want to call a function on a new block
  //useOnBlock(mainnetProvider, () => {
    // console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  //});

  // Then read your DAI balance like:
  //const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
  //  "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  //]);

  // 📟 Listen for broadcast events
  //const transferEvents = useEventListener(readContracts, "YourCollectible", "TransferSingle", localProvider, 1);

  // const collectiblesCount = useContractReader(readContracts, "YourCollectible", "getCurrentTokenID");
  // const numberCollectiblesCount = collectiblesCount && collectiblesCount.toNumber && collectiblesCount.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();
  const [yourCollectibles721, setYourCollectibles721] = useState();
  // const balance = useContractReader(readContracts, "YourCollectible721", "balanceOf", [address]);
  // const yourBalance = balance && balance.toNumber && balance.toNumber();


  useEffect(() => {
    const updateCollectibles = async () => {
      const collectiblesUpdate = [];

      let numberCollectiblesCount = 0;
      if (readContracts) {
        //const collectiblesCount = await readContracts.YourCollectible.getCurrentTokenID();
        //numberCollectiblesCount = collectiblesCount && collectiblesCount.toNumber && collectiblesCount.toNumber();
      }

      for (let collectibleIndex = 0; collectibleIndex < numberCollectiblesCount; collectibleIndex++) {
        try {
          const tokenSupply = await readContracts.YourCollectible.tokenSupply(collectibleIndex);
          const owned = await readContracts.YourCollectible.balanceOf(address, collectibleIndex);

          let uri = await readContracts.YourCollectible.uri(0); // All tokens have the same base uri
          uri = uri.replace(/{(.*?)}/, collectibleIndex);
          const ipfsHash = uri.replace("https://ipfs.io/ipfs/", "");
          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            collectiblesUpdate.push({
              id: collectibleIndex,
              supply: tokenSupply,
              owned,
              name: jsonManifest.name,
              description: jsonManifest.description,
              image: jsonManifest.image,
              standard: 1155,
              address: readContracts.YourCollectible.address,
            });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectiblesUpdate);
    };
    const updateCollectibles721 = async () => {
      const collectibleUpdate = [];

      let yourBalance = 0;
      if (readContracts) {
        //const balance = await readContracts.YourCollectible721.balanceOf(address);
        //yourBalance = balance && balance.toNumber && balance.toNumber();
      }

      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          let tokenId = await readContracts.YourCollectible721.tokenOfOwnerByIndex(address, tokenIndex);
          tokenId = tokenId.toNumber();
          const tokenURI = await readContracts.YourCollectible721.tokenURI(tokenId);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              owner: address,
              ...jsonManifest,
              standard: 721,
              address: readContracts.YourCollectible721.address,
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
    updateCollectibles();
    updateCollectibles721();
  }, [yourLocalBalance]);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts
    ) {
      /* console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("💵 yourMainnetDAIBalance", myMainnetDAIBalance);
      console.log("🔐 writeContracts", writeContracts);
      */
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
  ]);

  let networkDisplay = "";
  if (selectedChainId !== targetNetwork.chainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <b>{networkLocal && networkLocal.name}</b>.
                <Button
                  onClick={async () => {
                    let yourNumber;
                    if (networkLocal.chainId >= 10) {
                      yourNumber = ethers.utils.hexlify(networkLocal.chainId);
                    } else {
                      yourNumber = "0x" + networkLocal.chainId;
                    }
                    console.log(yourNumber);
                    await window.ethereum.request({
                      method: "wallet_switchEthereumChain",
                      params: [{ chainId: yourNumber }],
                    });
                    localStorage.setItem("targetNetwork", networkLocal.chainId);
                  }}
                >
                  Switch
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      // console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      // console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      // console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId == 31337 &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: ethers.utils.parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }
  faucetHint = (
    <div style={{ padding: 16 }}>
      <Button
        type="primary"
        onClick={() => {
          faucetTx({
            to: address,
            value: ethers.utils.parseEther("0.01"),
          });
          setFaucetClicked(true);
        }}
      >
        💰 Grab funds from the faucet ⛽️
      </Button>
      <Button
        onClick={async () => {
          const yourNumber = ethers.utils.hexlify(NETWORKS.goerli.chainId);
          console.log(yourNumber);
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }],
          });
          localStorage.setItem("targetNetwork", NETWORKS.goerli.chainId);
          targetNetwork = NETWORKS.goerli;
        }}
      >
        Goerli
      </Button>
      <Button
        onClick={async () => {
          const yourNumber = ethers.utils.hexlify(NETWORKS.kovan.chainId);
          console.log(yourNumber);
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: yourNumber }],
          });
          targetNetwork = NETWORKS.kovan;
          localStorage.setItem("targetNetwork", NETWORKS.kovan.chainId);
        }}
      >
        Kovan
      </Button>
    </div>
  );

  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();

  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();

  const [transferToAddresses, setTransferToAddresses] = useState({});

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Start Barter
            </Link>
          </Menu.Item>
          <Menu.Item key="/active_offers">
            <Link
              onClick={() => {
                setRoute("/active_offers");
              }}
              to="/active_offers"
            >
              Active Barter Offers
            </Link>
          </Menu.Item>
          <Menu.Item key="/approve_barter">
            <Link
              onClick={() => {
                setRoute("/approve_barter");
              }}
              to="/approve_barter"
            >
              Approve Barter
            </Link>
          </Menu.Item>
          <Menu.Item key="/your_collectibles">
            <Link
              onClick={() => {
                setRoute("/your_collectibles");
              }}
              to="/your_collectibles"
            >
              YourCollectibles
            </Link>
          </Menu.Item>
          <Menu.Item key="/AaveGotchi">
            <Link
              onClick={() => {
                setRoute("/AaveGotchi");
              }}
              to="/AaveGotchi"
            >
              AaveGotchi
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route path="/your_collectibles">
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id;
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
                      </Card>
                      <div>
                        owned: {item.owned.toNumber()} of {item.supply.toNumber()}
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(
                              writeContracts.YourCollectible.safeTransferFrom(
                                address,
                                transferToAddresses[id],
                                id,
                                1,
                                [],
                              ),
                            );
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
              <h1>Here 721</h1>
              <List
                bordered
                dataSource={yourCollectibles721}
                renderItem={item => {
                  const id = item.id;
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/debugcontracts">
            <Contract
              name="YourCollectible"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/debugcontracts721">
            <Contract
              name="YourCollectible721"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/debugcontractsBarter">
            <Contract
              name="Barter"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/debugcontractsBarterArrays">
            <Contract
              name="BarterWithArrays"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route exact path="/">
            {readContracts && address && localProvider ? (
              <StartBarter
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                localProvider={localProvider}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                blockExplorer={blockExplorer}
                signer={userSigner}
                price={price}
                yourCollectibles={yourCollectibles}
                yourCollectibles721={yourCollectibles721}
              />
            ) : (
              ""
            )}
          </Route>
          <Route path="/active_offers">
            {readContracts && address && localProvider ? (
              <ActiveOffers
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                localProvider={localProvider}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                blockExplorer={blockExplorer}
                signer={userSigner}
                price={price}
                yourCollectibles={yourCollectibles}
                yourCollectibles721={yourCollectibles721}
                ownerAccountForTests={ownerAccountForTests}
              />
            ) : (
              ""
            )}
          </Route>
          <Route path="/approve_barter">
            {readContracts && address && localProvider ? (
              <ApproveBarter
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                localProvider={localProvider}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                blockExplorer={blockExplorer}
                signer={userSigner}
                price={price}
                yourCollectibles={yourCollectibles}
                yourCollectibles721={yourCollectibles721}
                ownerAccountForTests={ownerAccountForTests}
              />
            ) : (
              ""
            )}
          </Route>
          <Route path="/p2p">
            <P2p />
          </Route>
          <Route path="/AaveGotchi">
            <AaveGotchi />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support:
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
                if the local provider has a signer, let's show the faucet:
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    */}
    </div>
  );
}

export default App;
