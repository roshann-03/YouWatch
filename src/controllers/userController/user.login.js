import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import User from "../../models/user.model.js";
import { generateAuthTokenAndRefreshToken } from "../../utils/generateTokens.js";
import { options } from "../../constants.js";
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const isPasswordMatched = await user.isPasswordMatched(password);
  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { authToken, refreshToken } =
    await generateAuthTokenAndRefreshToken(user);

  if (!authToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate tokens");
  }

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .cookie("authToken", authToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: authToken, refreshToken },
        "User registered successfully"
      )
    );
});
