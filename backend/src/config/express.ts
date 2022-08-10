import express from 'express';

import cors from 'cors';
import indexRoute from '../routes/index.route';

const app = express();

app.use(express.json());
app.use(cors());

// Router
app.use('/', indexRoute);

export default app;
