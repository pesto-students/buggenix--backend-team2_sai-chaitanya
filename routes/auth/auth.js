import express from 'express';
import { handleRefreshToken,handleLogout,handleSocials,loginUser,registerUser } from '../../controllers/index.js';
import { verifyJWT } from '../../utils/jwtVerifier.js';

const router  = express.Router();

router.get('/logout',handleLogout);
router.get('/refresh',handleRefreshToken);
router.post('/socials',verifyJWT,handleSocials);
router.post('/login',loginUser);
router.post('/register',registerUser);

export default router
