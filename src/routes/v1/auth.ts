import express from "express";
import {
  confirmPasswrod,
  forgetPassword,
  logIn,
  logOut,
  register,
  resetPassword,
  verifyOtp,
  verifyOtpForPassword,
} from "../../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verifyOtp", verifyOtp);
router.post("/confirmPassword", confirmPasswrod);
router.post("/logIn", logIn);
router.post("/logOut", logOut);

router.post("/forget-password", forgetPassword);
router.post("/verifyOtpForPassword", verifyOtpForPassword);
router.post("/resetPassword", resetPassword);

export default router;
