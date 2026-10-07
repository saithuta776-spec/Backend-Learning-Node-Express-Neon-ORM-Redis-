import "dotenv/config";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    console.log("🔥 JOB RECEIVED:", job.id);
    const { filePath, fileName } = job.data;

    console.log("📁 File path:", filePath);
    console.log("📝 File name:", fileName);

    const optimizedImage = path.join(
      __dirname,
      "../../..",
      "uploads/optimize/",
      fileName,
    );

    await sharp(filePath)
      .resize(200, 200)
      .webp({ quality: 50 })
      .toFile(optimizedImage);
  },
  { connection },
);

imageWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

imageWorker.on("failed", (job: any, err) => {
  console.log(`Jon ${job.id} failed with ${err.message}`);
});
console.log("🔥 IMAGE WORKER STARTED");
