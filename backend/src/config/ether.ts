import { ethers } from 'ethers';
import { signerPrivateKey } from '../constants/wallets';

const provider = new ethers.providers.JsonRpcProvider();

const signer = new ethers.Wallet(signerPrivateKey, provider);
