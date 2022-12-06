import express from "express";
import { ticketController } from "../controllers/index.js";
import { verifyJWT } from "../utils/jwtVerifier.js";

const router = express.Router();
const { getTickets,updateTicket,deleteTicket,moveTicketToProject,createTicket } = ticketController;

router.delete("/:id",verifyJWT,deleteTicket);
router.get("/", verifyJWT, getTickets);
router.post("/",verifyJWT,createTicket);
router.put("/",verifyJWT,updateTicket);
router.post('/move-ticket',verifyJWT,moveTicketToProject);

export default router;
