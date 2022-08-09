import express from 'express';

import nftController from '../../controllers/nftController';

const router = express.Router();

router.get('/', nftController.fetchCollection);
router.get('/list', nftController.listCollection);

export default router;
