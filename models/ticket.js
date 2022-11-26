import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    superAdminId: {
      type: String,
      required: false,
    },
    scrapedInfo: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "open",
      required: false,
    },
    scrapedFrom: {
      type: String,
      default: "twitter",
      required: false,
    },
    assignedTo:{
        type: String,
        default: "None",
        required: false,
    },
    projectId:{
        type: String,
        required: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);
