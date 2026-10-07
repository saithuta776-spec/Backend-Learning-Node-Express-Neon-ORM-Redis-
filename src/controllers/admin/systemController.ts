import { Request, Response, NextFunction } from "express";
import { customRequest } from "../../type/index.js";
import { body, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode.js";
import { createError } from "../../utlis/error.js";
import { createOrUpdateSetting } from "../../services/systemServices.js";

export const setMaintenance = [
  body("mode")
    .custom((value) => typeof value === "boolean")
    .withMessage("Mode must be boolean"),
  async (req: customRequest, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (validation.length > 0) {
      return next(createError(validation[0].msg, 400, errorCode.invalid));
    }
    const { mode } = req.body;
    const value = mode ? "true" : "false";
    const message = mode
      ? "Successfully set Maintenance Mode"
      : "Maintenance Mode Turn off";
    await createOrUpdateSetting("maintenance", value);
    res.status(200).json({ message });
  },
];
