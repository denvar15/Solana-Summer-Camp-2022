import { ethers } from 'ethers';

export const createEthWallet = async () => {
    const newWallet = ethers.Wallet.createRandom();
    console.log(newWallet.address);
    console.log(newWallet.privateKey);
};
