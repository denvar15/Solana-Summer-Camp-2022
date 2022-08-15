import { ethers, utils } from 'ethers';
import { goerliContractAddress, neonContractAddress } from '../constants/contracts';
import { signerPrivateKey } from '../constants/wallets';

import barterContractABI from '../contracts/BarterWithArrays_abi.json';

const neonProvider = new ethers.providers.JsonRpcProvider(
    'https://proxy.devnet.neonlabs.org/solana',
);

const goerliProvider = new ethers.providers.JsonRpcProvider(
    'https://goerli.prylabs.net/',
);

const neonSigner = new ethers.Wallet(signerPrivateKey, neonProvider);
const goerliSigner = new ethers.Wallet(signerPrivateKey, goerliProvider);

const neonBarterContract = new ethers.Contract(neonContractAddress, barterContractABI, neonSigner);
const goerliBarterContract = new ethers.Contract(goerliContractAddress, barterContractABI, goerliSigner);


export const viewSignersInfo = async () => {
    const neonBalance = await neonSigner.getBalance();
    console.log('Balance of neon signer: ', utils.formatEther(neonBalance));
    const goerliBalance = await goerliSigner.getBalance();
    console.log('Balance of goerli signer: ', utils.formatEther(goerliBalance));
};
