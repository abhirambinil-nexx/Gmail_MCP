import { z } from "zod";
import { searchEmail } from "../../services/gmail.service.js";

export default function registerSearchEmail(server) {
  server.tool(
    "searchEmail",
    {
      email: z.string(),
      query: z.string(),
    },
    async ({ email, query }) => {
      const data = await searchEmail(email, query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );
}
export async function searchEmail(email, query) {
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

  return detailedMessages;
}
