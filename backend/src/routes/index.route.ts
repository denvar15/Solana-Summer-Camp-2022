import * as express from 'express';

import nftFetch from './nft/fetchRoute';


const router = express.Router();

router.use('/', nftFetch)

export default router;
