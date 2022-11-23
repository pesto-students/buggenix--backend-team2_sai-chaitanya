import express from "express";
import { getTickets } from "../../controllers/index.js";
import { verifyJWT } from "../../utils/jwtVerifier.js";

const router = express.Router();

router.get("/", verifyJWT,getTickets);

export default router;
