import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export const getUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({
    where: { phone },
  });
};

export const getOtpByPhone = async (phone: string) => {
  return prisma.otp.findUnique({
    where: { phone },
  });
};

export const createOtp = async (otpData: any) => {
  return prisma.otp.create({
    data: otpData,
  });
};

export const updateOtp = async (id: number, otpData: any) => {
  return prisma.otp.update({
    where: { id },
    data: otpData,
  });
};

export const createUser = async (userData: any) => {
  return prisma.user.create({
    data: userData,
  });
};

export const updateUser = async (id: number, userData: any) => {
  return prisma.user.update({
    where: { id },
    data: userData,
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
  });
};
