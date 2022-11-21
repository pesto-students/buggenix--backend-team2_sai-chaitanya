import {createProject,getProjects} from '../../controllers/index.js';
import express from 'express';
import { verifyJWT } from '../../utils/jwtVerifier.js';

const router  = express.Router();

router.post('/',verifyJWT,createProject);
router.get('/',verifyJWT,getProjects);

export default router


