import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

export const getSettingStatus = async (key: string) => {
  return prisma.setting.findUnique({
    where: { key },
  });
};

export const createOrUpdateSetting = async (key: string, value: string) => {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key: key, value: value },
  });
};
