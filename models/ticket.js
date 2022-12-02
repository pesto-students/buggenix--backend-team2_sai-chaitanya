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
    creatorInfo: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "open",
      required: false,
    },
    type:{
      type:String,
      default:"feedback",
      required:false
    },
    priority:{
      type:String,
      default:"urgent",
      required:false
    },
    scrapedFrom: {
      type: String,
      default: "twitter",
      required: false,
    },
    assigneeId:{
        type: String,
        default: null,
        required: false,
    },
    assigneeInfo:{
      type: Object,
      required: false,
    },
    projectId:{
        type: String,
        required: false,
    },
    conversations:[{type:'ObjectId',ref:'Notes'}]
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);
