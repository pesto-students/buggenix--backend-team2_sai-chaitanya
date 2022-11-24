import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    superAdminId: {
      type: String,
      required: false,
    },
    createrInfo: {
      type: Object,
      required: true,
    },
    stats: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
