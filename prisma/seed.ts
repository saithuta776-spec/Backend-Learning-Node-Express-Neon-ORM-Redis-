import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function createRandomuser() {
  return {
    phone: faker.phone.number({ style: "international" }),
    password: "",
    randToken: faker.internet.jwt(),
  };
}

export const userData = faker.helpers.multiple(createRandomuser, {
  count: 10,
});

async function main() {
  console.log("Start Seeding....");

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("12345678", salt);

  for (const u of userData) {
    u.password = password;
    await prisma.user.create({
      data: u,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
