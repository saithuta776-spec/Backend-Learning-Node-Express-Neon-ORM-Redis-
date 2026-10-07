import { Request, Response, NextFunction } from "express";
import { customRequest } from "../type/index.js";
import { getSettingStatus } from "../services/systemServices.js";
import { createError } from "../utlis/error.js";
import { errorCode } from "../config/errorCode.js";

const whiteList = ["127.0.0.1", "::1"];
export const maintenance = async (
  req: customRequest,
  res: Response,
  next: NextFunction,
) => {
  const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (whiteList.includes(ip)) {
    console.log(`Allowed IP: ${ip}`);
    next();
  } else {
    console.log(`Not Allowed IP: ${ip}`);
    const setting = await getSettingStatus("maintenance");
    if (setting?.value == "true") {
      return next(
        createError(
          "This server is currently under maintenance. Please try again later.",
          503,
          errorCode.maintenance,
        ),
      );
    }
    next();
  }
};
