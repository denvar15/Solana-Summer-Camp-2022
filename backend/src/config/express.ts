import express from 'express';

import indexRoute from '../routes/index.route';

const app = express();

require('dotenv').config();
app.use(express.json());

// Router
app.use('/', indexRoute);

export default app;
