import { request, gql } from "graphql-request";
import { SelectedGotchi } from './SelectedGotchi/index';
import { GotchiListing } from './GotchiListing/index';
import Web3 from 'web3';
import diamondABI from './abi/diamond.json';
import React, { Component, useEffect, useState }  from 'react';

const diamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d';

const uri = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';
const uriSVG = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-svg';

export default function AaveGotchi() {
  const [ gotchis, setGotchis ] = useState([]);
  const [ selectedGotchi, setSelectedGotchi ] = useState(0);
  const [ contract, setContract ] = useState(null);
  const [ user, setUser ] = useState({gotchisOwned: []});
  const [ gotchiSVGs, setGotchisSVGs ] = useState('');

  const connectToWeb3 = () => {
    //let newProvider = Web3.givenProvider;
    //newProvider.chainId = '0x89';
    //newProvider.networkVersion = 137;
    //console.log("AAAAAAAAAAAAAAAAA ", Web3.givenProvider.chainId, Web3.givenProvider.networkVersion, newProvider.chainId, newProvider.networkVersion)
    const web3 = new Web3(Web3.givenProvider);
    const aavegotchiContract = new web3.eth.Contract(diamondABI, diamondAddress);
    setContract(aavegotchiContract);
  }

  const fetchGotchis = async (id) => {
    const query = `
      {
        aavegotchis(first: 5, orderBy: gotchiId) {
          id
          name
          collateral
          withSetsNumericTraits
        }
      }
    `
    const response = await request(uri, query);
    setGotchis(response.aavegotchis)
  }

  const fetchUser = async (id) => {
    const query = `
      {
        user(id: "0x749388a5dc4fe0011a2c26d97fe13b93b2adb2aa") {
          portalsOwned{id }, portalsBought {id},gotchisOwned { id, name },id
         }
      }
    `
    const response = await request(uri, query);
    for (let j = 0; j < response.user.gotchisOwned.length; j++) {
      let svg = await fetchGotchisConcreteSVG(response.user.gotchisOwned[j].id);
      response.user.gotchisOwned[j].svg = svg.aavegotchi.svg;
    }
    setUser(response.user)
  }

  const fetchGotchisSVG = async () => {
    let query = `
      {
        aavegotchis(first: 5 ) {
          id
          svg
        }
      }
    `
    const response = await request(uriSVG, query);
    console.log("AAAAAAAAAAAAAAA W", response)
    setGotchisSVGs(response.aavegotchis)
  }

  const fetchGotchisConcreteSVG = async (id) => {
    let query = `
      {
        aavegotchi(id: ` + id +` ) {
          id
          svg
        }
      }
    `
    const response = await request(uriSVG, query);
    console.log("qweqweqwe   W", response)
    return response;
  }

  const getCollateralColor = (gotchiCollateral) => {
    //const collateral = collaterals.find(item => item.collateralType.toLowerCase() === gotchiCollateral);
    //if (collateral) {
    //  return collateral.collateralTypeInfo.primaryColor.replace("0x", '#');
    //}
    return "white";
  }

  useEffect(() => {
    fetchGotchis();
    fetchGotchisSVG();
    fetchUser();
    connectToWeb3();
  }, [])

  useEffect(() => {
    if (!!contract) {
      //const fetchAavegotchiCollaterals = async () => {
      //  const collaterals = await contract.methods.getCollateralInfo(1).call();
      //  setCollaterals(collaterals);
      //};
      //fetchAavegotchiCollaterals();
    }
  }, [contract]);

  useEffect(() => {
    const getAavegotchiSVG = async (tokenId) => {
      //const svg = await contract?.methods.getAavegotchiSvg(tokenId).call();
      //setGotchiSVG(svg);
    };

    if (contract && gotchis.length > 0) {
      //fetchGotchisSVG(gotchis[selectedGotchi].id || 0)
    }
  }, [selectedGotchi, contract, gotchis]);

  return (
    <div className="App">
    <div className="container">
    <div className="selected-container">
    {gotchis.length > 0 && (
        <SelectedGotchi
      svg={selectedGotchi < 100 ? gotchiSVGs[selectedGotchi] ? gotchiSVGs[selectedGotchi].svg : null : user.gotchisOwned[selectedGotchi - 100].svg}
      name={ selectedGotchi < 100 ? gotchis[selectedGotchi].id: user.gotchisOwned[selectedGotchi - 100].id}
      traits={selectedGotchi < 100 ? gotchis[selectedGotchi].withSetsNumericTraits : []}
  />
)}
</div>
      <h1>Some Gothis</h1>
  <div className="gotchi-list">
    {
      gotchis.map((gotchi, i) => (
        <GotchiListing
      key={gotchi.id}
      id={gotchi.id}
      name={gotchi.name}
      collateralColor={getCollateralColor(gotchi.collateral)}
      selectGotchi={() => setSelectedGotchi(i)}
      selected={i === selectedGotchi}
  />
))
}
</div>
      <h1>Your Gothis</h1>
      <div className="gotchi-list">
        {
          user.gotchisOwned.map((gotchi, j) => (
            <GotchiListing
              key={gotchi.id}
              id={gotchi.id}
              name={gotchi.name}
              collateralColor={getCollateralColor(gotchi.collateral)}
              selectGotchi={() => {setSelectedGotchi(100+ j)}}
              selected={j === selectedGotchi - 100}
            />
          ))
        }
      </div>
  </div>
  </div>
);
}