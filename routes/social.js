import express from "express";
import { socialController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { handleSocials } = socialController;

router.post("/", verifyJWT, handleSocials);

export default router;
