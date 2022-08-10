import express from 'express';

import tradeController from '../../controllers/tradeController';

const router = express.Router();

router.get('/trade', tradeController.getTrade);
router.post('/trade', tradeController.saveTradeFromPost);

export default router;
