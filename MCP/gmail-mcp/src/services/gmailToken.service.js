import pool from "../config/mysql.js";
import redis from "../config/redis.js";
import { oauth2Client } from "../config/google.js";

export async function getAccessToken(email) {
  const cacheKey = `gmail:access:${email}`;

  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const [rows] = await pool.query(
    `
    SELECT refresh_token
    FROM oauth_accounts
    WHERE email = ?
    `,
    [email],
  );

  if (!rows.length) {
    throw new Error("Gmail account not connected. Please authenticate first.");
  }

  oauth2Client.setCredentials({
    refresh_token: rows[0].refresh_token,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  const accessToken = credentials.access_token;

  await redis.set(cacheKey, accessToken, { EX: 3500 });

  if (credentials.refresh_token) {
    try {
      await pool.query(
        `UPDATE oauth_accounts SET refresh_token = ? WHERE email = ?`,
        [credentials.refresh_token, email],
      );
    } catch (err) {
      console.error("Failed to persist rotated refresh token:", err.message);
    }
  }

  return accessToken;
}
