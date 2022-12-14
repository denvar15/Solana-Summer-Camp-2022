import { getRepository } from 'typeorm';
import { Token } from '../entities/tokenEntity';

const getTokenByAddress = async (mintAddress: string) => {
    return await getRepository(Token).findOne({
        where: {
            address: mintAddress,
        },
    });
};

const saveToken = async (token: Token) => {
    await getRepository(Token).save(token);
};

const getTokensByAmount = async (amount: number) => {
    return await getRepository(Token)
        .createQueryBuilder('token')
        // raw query for possible solution
        // .leftJoinAndSelect('token.collection', 'collection')
        .orderBy('random()')
        .take(amount)
        .getMany();
};

const getCollectionByTokenAddress = async (tokenAddress: string) => {
    return await getRepository(Token)
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.collection', 'collection')
        .where('token.address = :address', { address: tokenAddress })
        .getOne();
};

export default {
    getTokenByAddress,
    saveToken,
    getTokensByAmount,
    getCollectionByTokenAddress,
};
