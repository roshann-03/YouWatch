import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/db-connection.js";

dotenv.config({
  path: "./env",
});
const PORT = process.env.PORT || 5000;
connectDB();
