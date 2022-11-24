import express from "express";
import { usersController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { changeRoleOfUser, deleteUser, inviteNewUser, getAllUsers } =
  usersController;
router.post("/change-role", verifyJWT, changeRoleOfUser);
router.delete("/", verifyJWT, deleteUser);
router.get("/", verifyJWT, getAllUsers);
router.post("/", verifyJWT, inviteNewUser);

export default router;
