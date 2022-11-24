import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["superAdmin", "member", "admin"],
      default: "superAdmin",
    },
    superAdminId: {
      type: String,
      required: false,
    },
    socialNetworkHandle: {
      type: [],
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
