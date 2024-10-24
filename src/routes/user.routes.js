import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAuthToken
} from "../controllers/userController/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser, logoutUser);
router.route("/refresh-token").post(refreshAuthToken);
export default router;
