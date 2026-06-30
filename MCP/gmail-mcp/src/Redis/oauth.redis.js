import redis from "../config/redis.js";
import crypto from "crypto";

// ─── Redis: OAuth state management ───────────────────────────────────────────
// Stores a short-lived random state string in Redis to prevent CSRF attacks
// during the OAuth login flow.
//
// Key:   "oauth:state:<state>"
// Value: email or "pending"
// TTL:   300 seconds (5 minutes — matches typical OAuth flow timeout)
//
// Usage:
//   1. generateState()  — called in /auth/login, state stored in Redis
//   2. verifyState()    — called in /auth/callback, validates & deletes state

export async function generateState() {
  const state = crypto.randomBytes(16).toString("hex");
  await redis.set(`oauth:state:${state}`, "pending", { EX: 300 });
  return state;
}

export async function verifyState(state) {
  const key = `oauth:state:${state}`;
  const value = await redis.get(key);

  if (!value) {
    throw new Error("Invalid or expired OAuth state. Please try logging in again.");
  }

  // Delete after use — one-time token
  await redis.del(key);
  return true;
}
