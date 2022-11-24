import { notesController } from "../controllers/index.js";
import express from "express";
import { verifyJWT } from "../utils/jwtVerifier.js";

const { getNotes, addNote } = notesController;

const router = express.Router();

router.post("/", verifyJWT, addNote);
router.get("/", verifyJWT, getNotes);

export default router;
