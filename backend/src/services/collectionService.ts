import { getRepository } from 'typeorm';
import { Collection } from '../entities/collectionEntity';

const saveCollection = async (collection: Collection) => {
    await getRepository(Collection).save(collection);
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
