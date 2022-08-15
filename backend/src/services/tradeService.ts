import { getRepository } from 'typeorm';
import { Token } from '../entities/tokenEntity';
import { Trade } from '../entities/tradeEntity';

const saveTrade = async (trade: Trade) => {
    await getRepository(Trade).save(trade);
};

const getTradeByUser = async (amount: number) => {
    return await getRepository(Trade).find({
        take: amount,
    });
};

export default {
    saveTrade,
    getTradeByUser,
};
