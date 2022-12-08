import mongoose from "mongoose";

const TwitterSchema = new mongoose.Schema(
  {
    superAdminId: {
      type: String,
      required: true,
    },
    lastScrapedId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Twitter", TwitterSchema);
