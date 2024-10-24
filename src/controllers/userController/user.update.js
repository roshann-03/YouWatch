import User from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadToCloudinary } from "../../utils/cloudinary";
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordMatched(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully"));
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage is required");
  }
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Failed to upload coverImage");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully"));
});
