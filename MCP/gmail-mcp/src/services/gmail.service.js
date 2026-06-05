import { google } from "googleapis";
import pool from "../config/mysql.js";
import { oauth2Client } from "../config/google.js";

export async function getGmail(email) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM oauth_accounts
    WHERE email = ?
    `,
    [email],
  );

  const account = rows[0];

  if (!account) {
    throw new Error(`No Gmail account found for ${email}`);
  }

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}

export async function listEmails(email) {
  const gmail = await getGmail(email);

  const result = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
  });

  return result.data;
}

export async function readEmail(email, messageId) {
  const gmail = await getGmail(email);

  const result = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  return result.data;
}

export async function searchEmail(email, query) {
  const gmail = await getGmail(email);

  const result = await gmail.users.messages.list({
    userId: "me",
    q: query,
  });

  return result.data;
}

export async function sendEmail(email, to, subject, body) {
  const gmail = await getGmail(email);

  const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return result.data;
}

export async function createDraft(email, to, subject, body) {
  const gmail = await getGmail(email);

  const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: {
        raw: encodedMessage,
      },
    },
  });

  return draft.data;
}

export async function getLabels(email) {
  const gmail = await getGmail(email);

  const result = await gmail.users.labels.list({
    userId: "me",
  });

  return result.data;
}
