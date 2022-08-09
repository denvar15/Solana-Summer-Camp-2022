import * as express from 'express';

import nftRouter from './nft/nftRouter';
import collectionRouter from './collection/collectionRouter';

const router = express.Router();

router.use('/', nftRouter);
router.use('/', collectionRouter);

export default router;
