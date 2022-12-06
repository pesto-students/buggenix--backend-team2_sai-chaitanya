import express from "express";
import { authController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { handleRefreshToken, handleLogout, loginUser, registerUser } =
  authController;

router.get("/logout", handleLogout);
router.get("/refresh", handleRefreshToken);
// router.post("/socials", verifyJWT, handleSocials);
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
