import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Object,
      required: true,
    },
    ticketId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notes", NotesSchema);
