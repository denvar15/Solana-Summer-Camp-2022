import { getRepository } from 'typeorm';
import { Token } from '../entities/tokenEntity';
import { Trade } from '../entities/tradeEntity';

const saveTrade = async (trade: Trade) => {
    await getRepository(Trade).save(trade);
};

const getTradeByUser = async (userAddress: string) => {
    return await getRepository(Trade)
        .createQueryBuilder('trade')
        .leftJoinAndSelect(
            Token,
            'token',
            'token.address = trade.solana_mint_address',
        )
        .where('trade.user_first = :user_address', {
            user_address: userAddress,
        })
        .orWhere('trade.user_second = :user_address', {
            user_address: userAddress,
        })
        .getMany();
};

export default {
    saveTrade,
    getTradeByUser,
};
