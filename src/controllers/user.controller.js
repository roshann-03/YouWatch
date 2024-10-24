import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { generateAuthTokenAndRefreshToken } from "../utils/generateTokens.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

  if (isUserExist) {
    throw new ApiError(409, "Username or Email already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const recentUser = await User.findById({ _id: user._id }).select(
    "-password -refreshToken"
  );

  if (!recentUser) {
    throw new ApiError(500, "Failed to create user");
  }

  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("authToken", authToken);
  res.cookie("refreshToken", refreshToken);

  return res
    .status(201)
    .json(new ApiResponse(200, recentUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const user = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  }).select("-password -refreshToken");

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
  const options = {
    httpOnly: true,
    secure: true,
  };

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

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("authToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
