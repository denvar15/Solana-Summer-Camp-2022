import express from 'express';

import nftController from '../../controllers/nftController';

const router = express.Router();

router.get('/nft', nftController.fetchSingleNFT);

export default router;
