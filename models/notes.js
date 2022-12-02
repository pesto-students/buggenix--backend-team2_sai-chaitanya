import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "note",
    },
    creatorInfo: {
      type: Object,
      required: true,
    },
    ticketId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notes", NotesSchema);
