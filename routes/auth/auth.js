import express from 'express';
import { registerUser, loginUser,handleRefreshToken,handleLogout,handleSocialMediaInput} from '../../controllers/index.js';
import { verifyJWT } from '../../utils/jwtVerifier.js';

const router  = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',handleLogout);
router.get('/refresh',handleRefreshToken);
router.get('/check',verifyJWT,(req,res,next)=>{
    console.log("10",req.userId)
    res.sendStatus(200);
});
router.post('/handleSocialMediaInput',verifyJWT,handleSocialMediaInput);
// order evrything alphabetically and use index file
// handlesocialmediainput,getallteammember
// team api in diffferent folder

export default router
