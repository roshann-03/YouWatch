import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import User from "../../models/user.model.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { generateAuthTokenAndRefreshToken } from "../../utils/generateTokens.js";
import { options } from "../../constants.js";
export const registerUser = asyncHandler(async (req, res) => {
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
      username: username,
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
  
    const { authToken, refreshToken } =
      await generateAuthTokenAndRefreshToken(user);
  
    user.refreshToken = refreshToken;
    await user.save();

    console.log(authToken, refreshToken);
    return res
      .status(201)
      .cookie("authToken", authToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, recentUser, "User registered successfully"));
  });
  