import { Request, Response, NextFunction } from "express";
import { customRequest } from "../type/index.js";
import { getUserById, getUserByPhone } from "../services/authServices.js";
import { errorCode } from "../config/errorCode.js";

export const authorise = (permssion: boolean, ...roles: string[]) => {
  return async (req: customRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const user = await getUserById(userId!);
    if (!user) {
      const error: any = new Error("This account has not registered.");
      error.status = 401;
      error.errorCode = errorCode.unauthorised;
      return next(error);
    }

    const result = roles.includes(user.role);
    if (permssion && !result) {
      const error: any = new Error("This action is not allowed");
      error.status = 401;
      error.errorCode = errorCode.unauthorised;
      return next(error);
    }

    if (!permssion && result) {
      const error: any = new Error("This action is not allowed");
      error.status = 401;
      error.errorCode = errorCode.unauthorised;
      return next(error);
    }

    req.user = user;
    next();
  };
};
