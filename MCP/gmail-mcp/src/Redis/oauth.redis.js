import pool from "../config/mysql.js";
import redis from "../config/redis.js";
import { oauth2Client } from "../config/google.js";

export async function getAccessToken(email) {
  let accessToken = await redis.get(`gmail:access:${email}`);

  if (accessToken) {
    return accessToken;
  }

  const [rows] = await pool.query(
    `
    SELECT refresh_token
    FROM oauth_accounts
    WHERE email=?
    `,
    [email],
  );

  if (!rows.length) {
    throw new Error("Gmail not connected");
  }

  const refreshToken = rows[0].refresh_token;

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  accessToken = credentials.access_token;

  // Persist refreshed refresh_token to DB if provided
  try {
    if (credentials.refresh_token) {
      await pool.query(
        `UPDATE oauth_accounts SET refresh_token = ? WHERE email = ?`,
        [credentials.refresh_token, email],
      );
    }
  } catch (err) {
    console.error("Failed to persist refreshed tokens to DB:", err);
  }

  await redis.set(`gmail:access:${email}`, accessToken, {
    EX: 3500,
  });

  return accessToken;
}
