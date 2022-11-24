import express from "express";
import { ticketController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { getTickets } = ticketController;

router.get("/", verifyJWT, getTickets);

export default router;
