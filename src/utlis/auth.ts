import { errorCode } from "../config/errorCode.js";

export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("This phone has already registered");
    error.status = 409;
    error.errorCode = errorCode.userExist;
    throw error;
  }
};

export const checkOtpErrorSameDate = (isSameDate: boolean, errorCount: any) => {
  if (isSameDate && errorCount === 5) {
    const error: any = new Error(
      "OTP is wrong for 5 times. Please try again tomorrow.",
    );
    error.status = 401;
    error.errorCode = errorCode.overLimit;
    throw error;
  }
};

export const checkOtpRow = (otpRow: any) => {
  if (!otpRow) {
    const error: any = new Error("Phone Number is not found");
    error.status = 400;
    error.errorCode = errorCode.invalid;
    throw error;
  }
};

export const checkUserNotExist = (user: any) => {
  if (!user) {
    const error: any = new Error("No account found with this phone number.");
    error.status = 401;
    error.errorCode = errorCode.unauthenticated;
    throw error;
  }
};
