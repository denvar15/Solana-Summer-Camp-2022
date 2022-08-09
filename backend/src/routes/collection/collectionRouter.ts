import express from 'express';

import nestedRouter from './nestedCollectionRouter';

const router = express.Router();

router.use('/collection', nestedRouter);

export default router;
