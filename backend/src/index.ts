import 'reflect-metadata';
import { createConnection } from 'typeorm';
require('dotenv').config();
import { viewSignersInfo } from './config/ether';

import app from './config/express';
import { PORT } from './constants/port';

createConnection()
    .then(async () => {

        // await viewSignersInfo();
        app.listen(PORT, () => {
            console.info(`Server started and running at ${PORT}`);
        });
    })
    .catch((error: Error) => {
        console.log(error);
        console.info(`Database connection failed with error ${error}`);
    });
