import express from "express";
import { ticketController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { getTickets,updateTicket,deleteTicket,moveTicketToProject } = ticketController;

router.delete("/:id",verifyJWT,deleteTicket);
router.get("/", verifyJWT, getTickets);
router.post("/",verifyJWT,updateTicket);
router.post('/move-ticket',verifyJWT,moveTicketToProject);

export default router;
