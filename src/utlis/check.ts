import { errorCode } from "../config/errorCode.js";
import { createError } from "./error.js";

export const checkUploadFile = (file: any) => {
  if (!file) {
    throw createError("Invalide Image", 409, errorCode.invalid);
  }
};
