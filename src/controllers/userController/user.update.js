import User from "../../models/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadToCloudinary } from "../../utils/cloudinary";

//* Password update operations
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

//* Get current user

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

//* Account details update operations

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
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

//* Avatar update operations

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

//* Cover image update operations

export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage is required");
  }
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Failed to upload coverImage");
  }

  //* Name and Email operatoins

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



//* Avatar and Cover image operations

export const deleteAvatarFromCloudinary = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let avatarUrl = user.avatar;

  if (!avatarUrl) {
    throw new ApiError(400, "Avatar not found");
  }

  const avatarPublicId = avatarUrl.split("/").pop().split(".")[0];

  let result = await cloudinary.v2.uploader.destroy(avatarPublicId);
  if (result.result !== "ok") {
    throw new ApiError(400, "Failed to delete avatar");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar deleted successfully"));
});

export const deleteCoverImageFromCloudinary = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let coverImageUrl = user.coverImage;

  if (!coverImageUrl) {
    throw new ApiError(400, "Cover image not found");
  }

  const coverImagePublicId = coverImageUrl.split("/").pop().split(".")[0];

  let result = await cloudinary.v2.uploader.destroy(coverImagePublicId);
  if (result.result !== "ok") {
    throw new ApiError(400, "Failed to delete cover image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image deleted successfully"));
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: "",
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar deleted successfully"));
});
