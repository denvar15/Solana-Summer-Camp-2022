import httpStatusCodes from 'http-status-codes';
import * as express from 'express';
import { fetchByMint } from '../api/nft/metaplexFetching';
import { PublicKey } from '@solana/web3.js';

const fetchCollection = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const address = new PublicKey(req.query.address);
        const nfts = await fetchByMint(address);

        res.status(httpStatusCodes.OK).json(nfts);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).send();
    }
};

export default {
    fetchCollection,
};
