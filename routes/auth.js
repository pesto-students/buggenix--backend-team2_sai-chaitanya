import express from 'express';
import { registerUser, loginUser,handleRefreshToken,handleLogout,inviteNewTeammember,getAllTeamMembers,changeRoleOfUser} from '../controllers/auth.js';
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
router.get('/inviteTeamMember',verifyJWT,inviteNewTeammember);
router.get('/changeRoleOfUser',verifyJWT,changeRoleOfUser);
router.get('/getAllTeamMember',verifyJWT,getAllTeamMembers);


export default router
