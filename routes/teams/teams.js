import express from 'express';
import { inviteNewTeammember,getAllTeamMembers,changeRoleOfUser,deleteTeamMember} from '../../controllers/index.js';
import { verifyJWT } from '../../utils/jwtVerifier.js';

const router  = express.Router();

router.post('/changeRoleOfUser',verifyJWT,changeRoleOfUser);
router.post('/deleteTeamMember',verifyJWT,deleteTeamMember);
router.get('/getAllTeamMember',verifyJWT,getAllTeamMembers);
router.post('/inviteTeamMember',verifyJWT,inviteNewTeammember);

export default router
