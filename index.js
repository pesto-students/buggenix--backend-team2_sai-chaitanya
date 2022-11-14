import express, { json } from "express";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './routes/auth.js'
import axios from 'axios';
import { corsOptions } from "./config/corsOptions.js";
import { credentials } from "./utils/credentials.js";
// import { oktaAuthRequired } from "./utils/okta/oktaAuthRequired.js"
credentials
const router  = express.Router();
const app = express();
dotenv.config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("mongodb connected!");
    } catch (error) {
        throw error;
    }
};

app.listen("8800",()=>{
    connect();
    console.log("connected to backend.");
});

// and fetch cookies credentials requirement
app.use(credentials);
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// routes
// app.get('/api/free',oktaAuthRequired,(req, res) => {
//     console.log("email",req.email);
//     res.sendStatus(200)
// });
app.use('/api/auth',authRoute);

app.use((err,req,res,next)=>{
    console.log("errmiddleware")
    const errStatus = err.status || 500;
    const errMessage = err.message || "Something went wrong!";
    return res.status(errStatus).json({
        success:false,
        status:errStatus,
        message:errMessage,
        stack:err.stack
    });
})

