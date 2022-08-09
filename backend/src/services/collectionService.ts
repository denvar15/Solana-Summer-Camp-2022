import { getRepository } from 'typeorm';
import { Collection } from '../entities/collectionEntity';

const saveCollection = async (collection: Collection) => {
    const dbCollection = getRepository(Collection).create(collection);
    await getRepository(Collection).save(dbCollection);
};

const getCollectionById = async (id: number) => {
    return await getRepository(Collection).findOne({
        where: {
            id: id,
        },
    });
};

export default {
    saveCollection,
    getCollectionById,
};
