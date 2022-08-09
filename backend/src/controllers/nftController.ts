import httpStatusCodes from 'http-status-codes';
import * as express from 'express';
import tokenService from '../services/tokenService';
import collectionService from '../services/collectionService';
import { fetchByMint } from '../api/nft/metaplexFetching';
import { PublicKey } from '@solana/web3.js';
import { genopetsCollectionId } from '../constants/genopets';
import { defaultListAmount } from '../constants/defaultListAmount';
import { convertToken } from '../scipts/convertToken';

const fetchSingleNFT = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const address = req.query.address as string;
        let token = await tokenService.getCollectionByTokenAddress(
            address,
        );

        if (token == null) {
            const nft = await fetchByMint(new PublicKey(address));
            convertToken(nft, token);
        }

        res.status(httpStatusCodes.OK).json(token);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'Incorrect nft address',
        );
    }
};

const fetchCollection = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const collection = await collectionService.getCollectionById(
            genopetsCollectionId,
        );
        res.status(httpStatusCodes.OK).json(collection);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'No such collection',
        );
    }
};

const listCollection = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const amount =
            (req.query.amount as string) || defaultListAmount;

        const listedNft = await tokenService.getTokensByAmount(
            Number.parseInt(amount),
        );
        res.status(httpStatusCodes.OK).json(listedNft);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json('Invalid request');
    }
};

export default {
    fetchSingleNFT,
    fetchCollection,
    listCollection,
};
