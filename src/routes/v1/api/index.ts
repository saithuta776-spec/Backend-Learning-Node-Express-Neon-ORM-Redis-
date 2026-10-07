import express from "express";
import {
  changeLanguage,
  testPermission,
  uploadProfile,
  uploadProfileMultiple,
  uploadProfileOptimize,
} from "../../../controllers/api/profileController.js";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/uploadFilde.js";

const router = express.Router();

router.post("/changeLanguage", changeLanguage);
router.get("/test-permission", auth, testPermission);
router.patch("/profile/upload", auth, upload.single("avatar"), uploadProfile);

router.patch(
  "/profile/upload/multple",
  auth,
  upload.single("avatar"),
  uploadProfileMultiple,
);
router.patch(
  "/profile/upload/optimize",
  auth,
  upload.single("avatar"),
  uploadProfileOptimize,
);

export default router;
