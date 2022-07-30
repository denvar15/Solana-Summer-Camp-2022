import express from "express";

import nftController from '../../controllers/nftController';


const router = express.Router();

router.get(
    '/nft',
    nftController.fetchCollection
)

export default router;