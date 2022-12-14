import express, { json } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
  authRoute,
  usersRoute,
  projectRoute,
  ticketsRoute,
  socialRoute,
  noteRoute,
  metricRoute
} from "./routes/index.js";
import { corsOptions } from "./config/corsOptions.js";
import { credentials } from "./utils/credentials.js";

const router = express.Router();
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

// const port = process.env.PORT || 8800;
const port = 8800;
connect()
    .then(() => {
        app.listen(port, console.log(`listening on port :${port}`));
    }).catch((e) => {
        console.log(e);
    })

// app.listen(port, () => {
//   connect();
//   console.log("connected to backend.");
// });

// and fetch cookies credentials requirement
app.use(credentials);
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/projects", projectRoute);
app.use("/api/tickets", ticketsRoute);
app.use('/api/social',socialRoute);
app.use('/api/notes',noteRoute);
app.use('/api/metrics',metricRoute)

console.log("running")

app.use((err, req, res, next) => {
  console.log("errmiddleware", err);
  const errStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong!";
  return res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMessage,
    stack: err.stack,
  });
});
