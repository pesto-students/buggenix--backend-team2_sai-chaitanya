import express from 'express';
import { registerUser, loginUser,handleRefreshToken,handleLogout} from '../controllers/auth.js';
import { verifyJWT } from '../utils/jwtVerifier.js';
const router  = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',handleLogout);
router.get('/refresh',handleRefreshToken);
router.get('/check',verifyJWT,(req,res,next)=>{
    console.log("10",req.userId)
    res.sendStatus(200);
});


export default router