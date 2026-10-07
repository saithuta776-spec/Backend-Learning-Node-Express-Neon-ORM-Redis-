import { Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode.js";
import { customRequest } from "../../type/index.js";
import i18next from "i18next";
import { checkUserNotExist } from "../../utlis/auth.js";
import { getUserById, updateUser } from "../../services/authServices.js";
import { authorise } from "../../utlis/authorise.js";
import { checkUploadFile } from "../../utlis/check.js";
import path from "node:path";
// import { authorise } from "../../utlis/authorise.js";
// import { getUserById } from "../../services/authService.js";
// import { checkUserNotExist } from "../../utlis/auth.js";
import { unlink } from "node:fs/promises";
import sharp from "sharp";
import ImageQueue from "../../jobs/queues/imageQueue.js";

export const changeLanguage = [
  query("lng", "Invalid Language code.")
    .trim()
    .notEmpty()
    .matches("^[a-z]+$")
    .isLength({ min: 2, max: 3 }),
  (req: customRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { lng } = req.query;
    const language = i18next.hasResourceBundle(lng as string, "translation")
      ? lng
      : "en";
    res.cookie("i18next", language);
    res.status(200).json({ message: req.t("changeLan", { lang: language }) });
  },
];

export const testPermission = async (
  req: customRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserNotExist(user);
  const info: any = {
    title: "Testing Permission",
  };

  const can = authorise(true, user!.role, "ADMIN");
  if (can) {
    info.content = "You have a permission to read this line.";
  }

  res.status(200).json({
    info,
  });
};

// console.log("testPermission exported");

export const uploadProfile = async (
  req: customRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;
  const image = req.file;

  console.log("User Uploaded Image : ", image);

  const user = await getUserById(userId!);
  checkUserNotExist(user);
  checkUploadFile(image);

  const fileName = image?.filename;
  if (user?.image) {
    try {
      const filePath = path.join(
        __dirname,
        "../../..",
        "/uploads/images",
        user.image,
      );
      await unlink(filePath);
    } catch (error) {
      console.log(error);
    }
  }

  const userData = {
    image: fileName,
  };
  await updateUser(user!.id, userData);

  res.status(200).json({
    message: "Profile picture uploaded successfully",
    image: fileName,
  });
};

export const uploadProfileMultiple = async (
  req: customRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("FILE:", req.files);

  res.status(200).json({
    message: "Profile picture uploaded successfully",
  });
};

export const uploadProfileOptimize = async (
  req: customRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("🔥 OPTIMIZE CONTROLLER RUNNING");
  // console.log("FILE:", req.file);
  // console.log("BODY:", req.body);
  const userId = req.userId;
  const image = req.file;

  const user = await getUserById(userId!);
  checkUserNotExist(user);
  checkUploadFile(image);

  const splitFileName = image?.filename.split(".")[0];
  const job = await ImageQueue.add("optimize-image", {
    filePath: image?.path,
    fileName: `${splitFileName}.webp`,
  });

  console.log("Current DB image:", user?.image);
  if (user?.image) {
    const originalFilePath = path.join(
      __dirname,
      "../../..",
      "uploads/images",
      user.image,
    );

    try {
      await unlink(originalFilePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.log("Error deleting original image:", error);
      }
    }

    const optimizedFilePath = path.join(
      __dirname,
      "../../..",
      "uploads/optimize",
      user.image.split(".")[0] + ".webp",
    );

    try {
      await unlink(optimizedFilePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.log("Error deleting optimized image:", error);
      }
    }
  }
  const userData = {
    image: image?.filename,
  };
  await updateUser(user!.id, userData);

  res.status(200).json({
    message: "Profile picture uploaded successfully",
    image: splitFileName,
    jobId: job.id,
  });
};
