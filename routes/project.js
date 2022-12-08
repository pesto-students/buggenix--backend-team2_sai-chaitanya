import express from "express";
import { verifyJWT } from "../utils/jwtVerifier.js";
import { projectController } from "../controllers/index.js";

const router = express.Router();

const { createProject, getProjects } = projectController;

router.post("/", verifyJWT, createProject);
router.get("/", verifyJWT, getProjects);

export default router;
