import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env["UPSTASH_REDIS_REST_URL"] as string,
  token: process.env["UPSTASH_REDIS_REST_TOKEN"] as string,
});

(async () => {
  try {
    const data = await redis.get("key");
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();