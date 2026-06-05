import pool from "../config/mysql.js";
import { oauth2Client } from "../config/google.js";
import redis from "../config/redis.js";

export async function callback(req, res) {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const gmail = (await import("googleapis")).google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const profile = await gmail.users.getProfile({
    userId: "me",
  });

  const email = profile.data.emailAddress;

  // Persist refresh token and expiry to DB
  await pool.query(
    `
  INSERT INTO oauth_accounts
  (
    email,
    refresh_token,
    expiry_date
  )
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
  refresh_token = VALUES(refresh_token),
  expiry_date = VALUES(expiry_date)
  `,
    [email, tokens.refresh_token, tokens.expiry_date],
  );

  // Cache access token in Redis for quick refresh
  if (tokens.access_token) {
    try {
      await redis.set(`gmail:access:${email}`, tokens.access_token, {
        EX: 3500,
      });
    } catch (err) {
      console.error("Failed to set access token in Redis:", err);
    }
  }

  res.send("Connected");
}
