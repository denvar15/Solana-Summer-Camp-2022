import httpStatusCodes from 'http-status-codes';
import * as express from 'express';

import userService from '../services/userService';
import { DeepPartial, getRepository } from 'typeorm';
import { User } from '../entities/userEntity';
import { defaultListAmount } from '../constants/defaultListAmount';

const saveUserFromPost = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const createdUser = getRepository(User).create(
            req.body as DeepPartial<User>,
        );

        await userService.saveUser(createdUser);

        res.status(httpStatusCodes.OK).json(
            'Successfully added new user',
        );
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'Incorrect request',
        );
    }
};

const getUsers = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const amount =
            (req.query.amount as string) || defaultListAmount;
        const users = await userService.getAllUsers(
            Number.parseInt(amount),
        );

        res.status(httpStatusCodes.OK).json(users);
    } catch (e) {
        console.log(e);
        res.status(httpStatusCodes.BAD_REQUEST).json(
            'Incorrect request',
        );
    }
};

export default {
    saveUserFromPost,
    getUsers,
};
