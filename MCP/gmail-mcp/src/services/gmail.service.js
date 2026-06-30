import { google } from "googleapis";
import pool from "../config/mysql.js";
import { oauth2Client } from "../config/google.js";
import { getCache, setCache } from "./cache.service.js";
import { logTool } from "./audit.service.js";

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
    refresh_token: account.refresh_token,
    ...(account.access_token ? { access_token: account.access_token } : {}),
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}

export async function listEmails(email) {
  const cacheKey = `listEmails:${email}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const gmail = await getGmail(email);

  const result = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
  });

  await setCache(cacheKey, result.data, 60);
  await logTool(email, "listEmails", "success");
  return result.data;
}

export async function readEmail(email, messageId) {
  const cacheKey = `readEmail:${email}:${messageId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const gmail = await getGmail(email);

  const result = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  await setCache(cacheKey, result.data, 300);
  await logTool(email, "readEmail", "success");
  return result.data;
}

export async function searchEmail(email, query) {
  const cacheKey = `searchEmail:${email}:${query}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const gmail = await getGmail(email);

  const result = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 10,
  });

  const messages = result.data.messages || [];

  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = full.data.payload.headers;

      return {
        id: msg.id,
        subject: headers.find((h) => h.name === "Subject")?.value,
        from: headers.find((h) => h.name === "From")?.value,
        date: headers.find((h) => h.name === "Date")?.value,
      };
    }),
  );

  await setCache(cacheKey, detailedMessages, 60);
  await logTool(email, "searchEmail", "success");
  return detailedMessages;
}

export async function sendEmail(email, to, subject, body) {
  const { limit } = await import("./rateLimit.service.js");
  await limit(email);

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

  await logTool(email, "sendEmail", "success");
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

  await logTool(email, "createDraft", "success");
  return draft.data;
}

export async function getLabels(email) {
  const cacheKey = `getLabels:${email}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const gmail = await getGmail(email);

  const result = await gmail.users.labels.list({
    userId: "me",
  });

  await setCache(cacheKey, result.data, 300);
  await logTool(email, "getLabels", "success");
  return result.data;
}
