import express from 'express';

import usercontroller from '../../controllers/userController';

const router = express.Router();

router.get('/user', usercontroller.getUsers);
router.post('/user', usercontroller.saveUserFromPost);

export default router;
