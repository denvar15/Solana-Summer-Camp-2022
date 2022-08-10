import { getRepository } from 'typeorm';
import { Token } from '../entities/tokenEntity';
import { Trade } from '../entities/tradeEntity';

const saveTrade = async (trade: Trade) => {
    await getRepository(Trade).save(trade);
};

const getTradeByUser = async (amount: number) => {
    return await getRepository(Trade)
        .createQueryBuilder('trade')
        .leftJoinAndSelect(
            Token,
            'token',
            'token.address = trade.solana_mint_address',
        )
        .take(amount)
        .getMany();
};

export default {
    saveTrade,
    getTradeByUser,
};
