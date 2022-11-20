import express from 'express';
import { changeRoleOfUser,deleteUser,inviteNewUser,getAllUsers} from '../../controllers/index.js';
import { verifyJWT } from '../../utils/jwtVerifier.js';

const router  = express.Router();

router.post('/change-role',verifyJWT,changeRoleOfUser);
router.delete('/',verifyJWT,deleteUser);
router.get('/',verifyJWT,getAllUsers);
router.post('/',verifyJWT,inviteNewUser);

export default router
