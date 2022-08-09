import { PublicKey } from '@solana/web3.js';
import { Token } from '../entities/tokenEntity';
import { fetchByMint } from '../api/nft/metaplexFetching';
import tokenService from '../services/tokenService';
import { convertToken } from './convertToken';

export const addTokens = async () => {
    // read from json file

    const nftFile: string[] = require('../nft.json');

    for (const address of nftFile) {
        if (address == '2TYr44SvwBPeuhn4Ju8UMSzSc9544QHA1mJbLkTLJNTm') {
            continue;
        }

        let mintAddress = new PublicKey(address);

        let nft = await fetchByMint(mintAddress);

        let token = new Token();

        convertToken(nft, token);

        token.collectionId = 2;

        await tokenService.saveToken(token);
    }
};
