import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.authToken || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.AUTH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return reject(new ApiError(401, "Invalid token"));
        }
        resolve(decoded);
      });
    });

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    throw new ApiError(401, "Internal Server Error");
  }
});

export { verifyUser };
