import 'reflect-metadata';
import { createConnection } from 'typeorm';
require('dotenv').config();

import app from './config/express';
const PORT = 8080;

createConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.info(`Server running at ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.info(`Database connection failed with error ${error}`);
  });
