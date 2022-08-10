import httpStatusCodes from 'http-status-codes';
import * as express from 'express';
import { DeepPartial, getRepository } from 'typeorm';
import { Trade } from '../entities/tradeEntity';

import tradeService from '../services/tradeService';

const saveTradeFromPost = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const createdTrade = getRepository(Trade).create(
            req.body as DeepPartial<Trade>,
        );
        await tradeService.saveTrade(createdTrade);
        res.status(httpStatusCodes.OK).json('Successfully added');
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'Incorrect request',
        );
    }
};

const getTrade = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const userAddress = req.query.address as string;
        const trades = await tradeService.getTradeByUser(userAddress);
        res.status(httpStatusCodes.OK).json(trades);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'Incorrect request',
        );
    }
};

export default {
    saveTradeFromPost,
    getTrade,
};
