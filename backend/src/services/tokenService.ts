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
    const dbToken = getRepository(Token).create(token);
    await getRepository(Token).save(dbToken);
};

const getTokensByAmount = async (amount: number) => {
    return await getRepository(Token)
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.collection', 'collection')
        .orderBy('RAND()')
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
