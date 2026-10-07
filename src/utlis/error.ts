import { stat } from "fs";
import { errorCode } from "../config/errorCode.js";

export const createError = (
  message: string,
  status: number,
  errorCode: string,
) => {
  const error: any = new Error(message);
  error.status = status;
  error.errorCode = errorCode;
  return error;
};
