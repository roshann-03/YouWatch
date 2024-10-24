import { asyncHandler } from "../../utils/asyncHandler.js";
import User from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateAuthTokenAndRefreshToken } from "../../utils/generateTokens.js";
import { options } from "../../constants.js";
export const refreshAuthToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(
        401,
        "Unauthorized request: Refresh token is required"
      );
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const { authToken, refreshToken } =
      await generateAuthTokenAndRefreshToken(user);

    return res
      .status(200)
      .cookie("authToken", authToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            authToken,
            refreshToken,
          },
          "Auth token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
