import * as express from 'express';

import nftRouter from './nft/nftRouter';
import collectionRouter from './collection/collectionRouter';
import tradeRouter from './trade/tradeRouter';

const router = express.Router();

router.use('/', nftRouter);
router.use('/', collectionRouter);
router.use('/', tradeRouter);

export default router;
