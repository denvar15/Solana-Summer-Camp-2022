import 'reflect-metadata';
import { createConnection } from 'typeorm';
require('dotenv').config();

import app from './config/express';
import { addTokens } from './scipts/addToken';
import { PORT } from './constants/port';

createConnection()
    .then(async () => {
        
        await addTokens();
        // app.listen(PORT, () => {
        //     console.info(`Server started and running at ${PORT}`);
        // });
    })
    .catch((error: Error) => {
        console.info(`Database connection failed with error ${error}`);
    });
