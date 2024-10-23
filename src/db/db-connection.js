import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInfo = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected !! Host : ${connectionInfo.connection.host}`
    );
  } catch (err) {
    console.log("MONGODB connection FAILED : ", err);
    process.exit(1);
  }
};

export default connectDB;
