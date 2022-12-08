import express from "express";
import { verifyJWT } from "../utils/jwtVerifier.js";
import { metricController } from "../controllers/metrics.js";

const { ticketMetrics } = metricController;

const router = express.Router();

router.get("/", verifyJWT, ticketMetrics);

export default router;
