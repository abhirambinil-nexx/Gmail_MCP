import redis from "../config/redis.js";

export async function limit(email) {
  const key = `send:${email}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60);
  }

  if (count > 20) {
    throw new Error("Rate limit exceeded");
  }
}
