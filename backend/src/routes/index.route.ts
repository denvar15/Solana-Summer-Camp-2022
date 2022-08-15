import * as express from 'express';

import nftRouter from './nft/nftRouter';
import collectionRouter from './collection/collectionRouter';
import tradeRouter from './trade/tradeRouter';
import userRouter from './user/userRouter';

const router = express.Router();

router.use('/', nftRouter);
router.use('/', collectionRouter);
router.use('/', tradeRouter);
router.use('/', userRouter);

export default router;
