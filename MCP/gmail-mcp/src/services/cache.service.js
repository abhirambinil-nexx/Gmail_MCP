import redis from "../config/redis.js";

// ─── Redis: generic JSON cache ────────────────────────────────────────────────
// Used by: listEmails, readEmail, searchEmail, getLabels in gmail.service.js
// Keys pattern: "<toolName>:<email>[:<extra>]"

export async function getCache(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key, value, ttl = 60) {
  await redis.setEx(key, ttl, JSON.stringify(value));
}
