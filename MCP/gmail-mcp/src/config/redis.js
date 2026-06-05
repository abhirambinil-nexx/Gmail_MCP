import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = `redis://${process.env.REDIS_USER}:${encodeURIComponent(
  process.env.REDIS_PASSWD,
)}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const redis = createClient({
  url: redisUrl,
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

await redis.connect();

export default redis;
