import { getRepository } from 'typeorm';
import { User } from '../entities/userEntity';

const saveUser = async (user: User) => {
    await getRepository(User).save(user);
};

const getAllUsers = async (amount: number) => {
    return await getRepository(User).find({
        take: amount,
    });
};

export default {
    saveUser,
    getAllUsers,
};
