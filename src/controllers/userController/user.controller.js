import { registerUser } from "./user.register.js";
import { loginUser } from "./user.login.js";
import { logoutUser } from "./user.logout.js";
import { refreshAuthToken } from "./refreshAuthToken.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "./user.update.js";

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAuthToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};
