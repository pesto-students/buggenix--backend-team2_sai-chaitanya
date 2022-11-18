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
            type:String,
            required:false
        },
        role: {
            type:String,
            enum: ['superAdmin','member','admin'],
            default: 'superAdmin'
        },
        superAdminId:{
            type:String,
            required:false
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);