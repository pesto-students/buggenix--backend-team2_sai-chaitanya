import express from 'express';
import { registerUser, loginUser} from '../controllers/auth.js';

const router  = express.Router();

router.get('/register',registerUser);
router.get('/login',loginUser);

export default router