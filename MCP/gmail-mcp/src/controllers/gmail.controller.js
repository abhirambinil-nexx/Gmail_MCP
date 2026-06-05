import pool from "../config/mysql.js";
import { oauth2Client } from "../config/google.js";

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

  await pool.query(
    `
    INSERT INTO oauth_accounts
    (
      email,
      access_token,
      refresh_token,
      expiry_date
    )
    VALUES (?, ?, ?, ?)
    `,
    [email, tokens.access_token, tokens.refresh_token, tokens.expiry_date],
  );

  res.send("Connected");
}
