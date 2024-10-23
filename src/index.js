import dotenv from "dotenv";
import connectDB from "./db/db-connection.js";
import {app} from "./app.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error in APP : ", err);
      throw err;
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection FAILED : ", err);
    process.exit(1);
  });
