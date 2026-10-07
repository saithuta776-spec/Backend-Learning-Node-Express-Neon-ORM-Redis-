import e, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  checkOtpErrorSameDate,
  checkOtpRow,
  checkUserExist,
  checkUserNotExist,
} from "../utlis/auth.js";
import { generateOtp, generateToken } from "../utlis/generate.js";
import {
  createOtp,
  createUser,
  getOtpByPhone,
  getUserById,
  getUserByPhone,
  updateOtp,
  updateUser,
} from "../services/authServices.js";
import bcrypt from "bcrypt";
import moment from "moment";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode.js";

export const register = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number must be between 5 and 12 digits"),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });

    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    let phone = req.body.phone;
    if (phone.slice(0, 2) == "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserByPhone(phone);
    checkUserExist(user);

    // const otp = generateOtp() For production
    const otp = 123456;
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();

    const otpRow = await getOtpByPhone(phone);
    let result;
    if (!otpRow) {
      const otpData = {
        phone,
        otp: hashOtp,
        rememberToken: token,
        count: 1,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastOtpRequest == today;
      checkOtpErrorSameDate(isSameDate, otpRow.error);

      if (!isSameDate) {
        const otpData = {
          otp: hashOtp,
          rememberToken: token,
          count: 1,
          error: 0,
        };
        result = await updateOtp(otpRow.id, otpData);
      } else {
        if (otpRow.count > 3) {
          const error: any = new Error(
            "OTP is allowed to request 3 times per day.",
          );
          error.status = 405;
          error.errorCode = "Error_OverLimit";
          return next(error);
        } else {
          const otpData = {
            otp: hashOtp,
            rememberToken: token,
            count: {
              increment: 1,
            },
          };
          result = await updateOtp(otpRow.id, otpData);
        }
      }
    }
    res.status(200).json({
      message: `We are sending otp to 09${result.phone}`,
      phone: result.phone,
      token: result.rememberToken,
    });
  },
];

export const verifyOtp = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number must be between 5 and 12 digits"),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid Token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });

    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    const { phone, otp, token } = req.body;
    const user = await getUserByPhone(phone);
    checkUserExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastOtpRequest = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpRequest === today;
    checkOtpErrorSameDate(isSameDate, otpRow!.error);

    if (otpRow?.rememberToken != token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      const error: any = new Error("Invalid Token");
      error.status = 400;
      error.errorCode = "Error_Invalid";
      return next(error);
    }

    const isExpired = moment().diff(otpRow?.updatedAt, "minutes") > 2;
    if (isExpired) {
      const error: any = new Error("OTP is expired");
      error.status = 403;
      error.errorCode = "Error_expired";
      return next(error);
    }

    const isMatch = await bcrypt.compare(otp, otpRow!.otp);
    if (!isMatch) {
      if (!isSameDate) {
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        const otpData = {
          error: {
            increment: 1,
          },
        };
        await updateOtp(otpRow!.id, otpData);
      }
      const error: any = new Error("OTP is incorrect");
      error.status = 401;
      error.errorCode = "Invalid";
      return next(error);
    }

    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "OTP Verified",
      phone: result.phone,
      token: result.verifyToken,
    });
  },
];

export const confirmPasswrod = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number must be between 5 and 12 digits"),
  body("password", "Invalid Password")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid Token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });

    //Input validation
    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    const { phone, password, token } = req.body;

    const user = await getUserByPhone(phone);
    checkUserExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    if (otpRow?.error === 5) {
      const error: any = new Error("This request may be an attack.");
      error.status = 401;
      error.errorCode = "Unauthorized";
      return next(error);
    }

    if (otpRow?.verifyToken != token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      const error: any = new Error("Invalid Token");
      error.status = 401;
      error.errorCode = "Error_Invalid";
      return next(error);
    }

    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 10;
    if (isExpired) {
      const error: any = new Error("Your request is expired.");
      error.status = 403;
      error.errorCode = "Error_Expired";
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const randToken = "I will replace with Refresh Token";

    const userData = {
      phone,
      password: hashPassword,
      randToken,
    };

    const newUser = await createUser(userData);

    const accessTokenPayload = { id: newUser.id };
    const refreshTOkenPayload = { id: newUser.id, phone: newUser.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 60 * 15 },
    );

    const refreshToken = jwt.sign(
      refreshTOkenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    const userUpdateData = {
      randToken: refreshToken,
    };

    await updateUser(newUser.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Successfully create an account",
        userId: newUser.id,
      });
  },
];

export const logIn = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number must be between 5 and 12 digits"),
  body("password", "Invalid Password")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });

    //Input validation
    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    const password = req.body.password;
    let phone = req.body.phone;

    if (phone.slice(0, 2) == "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    if (user!.status === "FREEZE") {
      const error: any = new Error(
        "Your account is temporarily locked. Please contact us.",
      );
      error.status = 401;
      error.errorCode = "Error_Freeze";
      return next(error);
    }

    const isMatchPassword = await bcrypt.compare(password, user!.password);
    if (!isMatchPassword) {
      const lastRequest = new Date(user!.updatedAt).toLocaleDateString;
      const isSameDate = lastRequest === new Date().toLocaleDateString;

      if (!isSameDate) {
        const userData = {
          errorLoginCount: 1,
        };
        await updateUser(user!.id, userData);
      } else {
        if (user!.errorLoginCount >= 2) {
          const userData = {
            status: "FREEZE",
          };
          await updateUser(user!.id, userData);
        } else {
          const userData = {
            errorLoginCount: {
              increment: 1,
            },
          };
          await updateUser(user!.id, userData);
        }
        const error: any = new Error("Password is Wrong");
        error.status = 401;
        error.errorCode = "Error_Invalid";
        return next(error);
      }
    }
    const accessTokenPayload = { id: user?.id };
    const refreshTokenPayload = { id: user?.id, phone: user?.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15,
      },
    );

    const refeshtoken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    const updateUserData = {
      errorLoginCount: 0,
      randToken: refeshtoken,
    };
    await updateUser(user!.id, updateUserData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refeshtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Successfully Logged In",
        userId: user?.id,
      });
  },
];

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    const error: any = new Error("no refresh token");
    error.status = 401;
    error.errorCode = "Error_Unauthenticated.";
    return next(error);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      phone: string;
    };
  } catch (err) {
    const error: any = new Error("Invalid refresh token");
    error.status = 401;
    error.errorCode = "Error_Unauthenticated.";
    return next(error);
  }

  const user = await getUserById(decoded.id);

  checkUserNotExist(user);

  if (user!.phone !== decoded.phone) {
    const error: any = new Error("Invalid user");
    error.status = 401;
    error.errorCode = "Error_Unauthenticated.";
    return next(error);
  }

  const userData = {
    randToken: generateToken(),
  };

  await updateUser(user!.id, userData);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.status(200).json({
    message: "Logged Out",
  });
};

export const forgetPassword = [
  body("phone", "Invalid Phone Number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone Number must be between 5 and 12 digits"),
  // body("token", "Invalid Token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });

    //Input validation
    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = errorCode.invalid;
      return next(error);
    }
    // let token = req.body.token;
    let phone = req.body.phone;
    if (phone.slice(0, 2) == "09") {
      phone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    const otp = 123456;
    // const otp = generateOtp(); // For production
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString(), salt);
    const token = generateToken();

    const otpRow = await getOtpByPhone(phone);
    let result;
    if (!otpRow) {
      const otpData = {
        phone,
        otp: hashOtp,
        rememberToken: token,
        count: 1,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastOtpRequest === today;
      checkOtpErrorSameDate(isSameDate, otpRow.error);

      if (!isSameDate) {
        const otpData = {
          otp: hashOtp,
          rememberToken: token,
          count: 1,
          error: 0,
        };
        result = await updateOtp(otpRow.id, otpData);
      } else {
        if (otpRow.count >= 3) {
          const error: any = new Error(
            "OTP is allowed to request 3 times per day.",
          );
          error.status = 405;
          error.errorCode = "Error_OverLimit";
          return next(error);
        } else {
          const otpData = {
            otp: hashOtp,
            rememberToken: token,
            count: {
              increment: 1,
            },
          };
          result = await updateOtp(otpRow.id, otpData);
        }
      }
    }
    res.status(200).json({
      message: `We are sending OTP to 09${result.phone} to reset password.`,
      phone: result.phone,
      token: result.rememberToken,
    });
  },
];

export const verifyOtpForPassword = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    const { phone, otp, token } = req.body;

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpVerify === today;
    // If OTP error is in the same date and over limit
    checkOtpErrorSameDate(isSameDate, otpRow!.error);

    // Token is wrong
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = "Error Invalid";
      return next(error);
    }

    // OTP is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isExpired) {
      const error: any = new Error("OTP is expired");
      error.status = 403;
      error.errorCode = "Error_expired";
      return next(error);
    }

    const isMatchOtp = await bcrypt.compare(otp, otpRow!.otp);
    // OTP is wrong
    if (!isMatchOtp) {
      // If OTP error is first time today
      if (!isSameDate) {
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        // If OTP error is not first time today
        const otpData = {
          error: { increment: 1 },
        };
        await updateOtp(otpRow!.id, otpData);
      }

      const error: any = new Error("OTP is incorrect");
      error.status = 401;
      error.errorCode = "Invalid";
      return next(error);
    }

    // All are OK
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };
    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "OTP is successfully verified to reset password",
      phone: result.phone,
      token: result.verifyToken,
    });
  },
];

export const resetPassword = [
  // Validate and sanitize fields.
  body("token", "Token must not be empty.").trim().notEmpty().escape(),
  body("phone", "Invalid Phone Number.")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits.")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 8, max: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (validation.length > 0) {
      const error: any = new Error(validation[0].msg);
      error.status = 400;
      error.errorCode = errorCode.invalid;
      return next(error);
    }
    const { token, phone, password } = req.body;

    const user = await getUserByPhone(phone);
    checkUserNotExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    if (otpRow!.error === 5) {
      const error: any = new Error("This request may be an attack.");
      error.status = 401;
      error.errorCode = errorCode.unauthorised;
      return next(error);
    }

    if (otpRow!.verifyToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      const error: any = new Error("Invalid Token");
      error.status = 401;
      error.errorCode = errorCode.invalid;
      return next(error);
    }

    // request is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 5;
    if (isExpired) {
      const error: any = new Error("Your request is expired.");
      error.status = 403;
      error.errorCode = errorCode.otpExpired;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // jwt token
    const accessPayload = { id: user!.id };
    const refreshPayload = { id: user!.id, phone: user!.phone };

    const accessToken = jwt.sign(
      accessPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 mins
      },
    );

    const refreshToken = jwt.sign(
      refreshPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d", // "30d" in production
      },
    );

    const userUpdateData = {
      password: hashPassword,
      randToken: refreshToken,
    };
    await updateUser(user!.id, userUpdateData);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 mins
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .status(200)
      .json({
        message: "Successfully reset your password.",
        userId: user!.id,
      });
  },
];
